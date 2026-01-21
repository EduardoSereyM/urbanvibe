from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func, desc
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List
import re

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.profiles import Profile
from app.models.friends import Friendship
from app.schemas.friends import UserSearchResponse, FriendListItem, FriendRequestAction
from app.services.notifications.core import notification_service

router = APIRouter()

@router.get("/search", response_model=List[UserSearchResponse])
async def search_users(
    query: str = Query(..., min_length=3),
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """
    Búsqueda inteligente de usuarios:
    1. Por Referral Code (UV-XXXXXX)
    2. Por Email (Coincidencia exacta)
    3. Por Username (Coincidencia parcial)
    """
    stmt = select(Profile).options(selectinload(Profile.current_level))
    
    # Excluir al usuario actual de la búsqueda
    stmt = stmt.where(Profile.id != current_user.id)
    
    # 1. Patrón Referral Code: UV-XXXXXX
    if re.match(r"^UV-[A-Z0-9]{6}$", query.upper()):
        stmt = stmt.where(Profile.referral_code == query.upper())
    # 2. Patrón Email
    elif "@" in query and "." in query:
        stmt = stmt.where(Profile.email == query.lower())
    # 3. Borramos Username fuzzy search por privacidad
    else:
        # Si no es UV-XXXXXX ni email, no devolvemos resultados
        return []
    
    stmt = stmt.limit(10)
    result = await db.execute(stmt)
    profiles = result.scalars().all()
    
    # Mapear a esquema de respuesta pública
    response = []
    for p in profiles:
        response.append(UserSearchResponse(
            id=p.id,
            username=p.username,
            full_name=p.full_name,
            avatar_url=p.avatar_url,
            referral_code=p.referral_code,
            current_level_name=p.current_level.name if p.current_level else "Bronce"
        ))
    
    return response

@router.post("/request/{friend_id}", status_code=status.HTTP_201_CREATED)
async def send_friend_request(
    friend_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Envía una solicitud de amistad y dispara una notificación push."""
    if friend_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes enviarte una solicitud a ti mismo")
    
    # Verificar si ya existe una relación
    exist_stmt = select(Friendship).where(
        or_(
            and_(Friendship.user_id == current_user.id, Friendship.friend_id == friend_id),
            and_(Friendship.user_id == friend_id, Friendship.friend_id == current_user.id)
        )
    )
    res = await db.execute(exist_stmt)
    existing = res.scalar_one_or_none()
    
    if existing:
        if existing.status == 'accepted':
            raise HTTPException(status_code=400, detail="Ya son amigos")
        if existing.status == 'pending':
            raise HTTPException(status_code=400, detail="Ya hay una solicitud pendiente")
        # Si fue rechazada, permitimos re-enviar (o actualizamos estado)
        existing.status = 'pending'
        existing.user_id = current_user.id # El que re-envía es el nuevo solicitante
        existing.friend_id = friend_id
    else:
        new_friendship = Friendship(
            user_id=current_user.id,
            friend_id=friend_id,
            status='pending'
        )
        db.add(new_friendship)
    
    await db.commit()
    
    # Enviar Notificación Push
    try:
        await notification_service.send_in_app_notification(
            db=db,
            user_id=friend_id,
            title="¡Nueva solicitud de amistad! 👋",
            body=f"{current_user.username} desea ser tu amigo en UrbanVibe",
            type="info",
            data={
                "type": "FRIEND_REQUEST",
                "sender_id": str(current_user.id),
                "screen": "community"
            }
        )
    except Exception as e:
        print(f"Error enviando push: {e}")
        # No fallamos el endpoint si el push falla
    
    return {"message": "Solicitud enviada con éxito"}

@router.get("/list", response_model=List[FriendListItem])
async def get_friends_list(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Retorna la lista de amigos y solicitudes enviadas."""
    # Buscamos relaciones donde el usuario participe
    stmt = select(Friendship).where(
        or_(Friendship.user_id == current_user.id, Friendship.friend_id == current_user.id)
    ).where(Friendship.status != 'rejected')
    
    result = await db.execute(stmt)
    friendships = result.scalars().all()
    
    response = []
    for f in friendships:
        # Identificar quién es el amigo en esta relación
        is_sender = f.user_id == current_user.id
        friend_uuid = f.friend_id if is_sender else f.user_id
        
        # Obtener datos del amigo
        friend_stmt = select(Profile).where(Profile.id == friend_uuid)
        friend_res = await db.execute(friend_stmt)
        friend = friend_res.scalar_one_or_none()
        
        if friend:
            response.append(FriendListItem(
                friendship_id=f.id,
                friend_id=friend.id,
                username=friend.username,
                full_name=friend.full_name,
                avatar_url=friend.avatar_url,
                status=f.status,
                is_sender=is_sender,
                created_at=f.created_at
            ))
            
    return response

@router.patch("/requests/{friendship_id}/action")
async def handle_friend_request(
    friendship_id: UUID,
    action: FriendRequestAction,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Acepta o rechaza una solicitud recibida."""
    stmt = select(Friendship).where(Friendship.id == friendship_id)
    res = await db.execute(stmt)
    friendship = res.scalar_one_or_none()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    if friendship.friend_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para gestionar esta solicitud")
    
    if action.action == 'accept':
        friendship.status = 'accepted'
        # Notificar al remitente que fue aceptado
        await notification_service.send_in_app_notification(
            db=db,
            user_id=friendship.user_id,
            title="¡Solicitud aceptada! 🎉",
            body=f"{current_user.username} ha aceptado tu invitación",
            type="success",
            data={"type": "FRIEND_ACCEPTED", "friend_id": str(current_user.id)}
        )
    elif action.action == 'reject':
        friendship.status = 'rejected'
    else:
        raise HTTPException(status_code=400, detail="Acción no válida")
    
    await db.commit()
    return {"message": f"Solicitud {action.action}ada"}

@router.delete("/{friendship_id}")
async def remove_friend(
    friendship_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Elimina una relación de amistad o cancela una invitación."""
    stmt = select(Friendship).where(Friendship.id == friendship_id)
    res = await db.execute(stmt)
    friendship = res.scalar_one_or_none()
    
    if not friendship:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    
    if friendship.user_id != current_user.id and friendship.friend_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar esta relación")
    
    await db.delete(friendship)
    await db.commit()
    
    return {"message": "Amistad eliminada"}

from app.schemas.friends import PublicProfileResponse, BadgeItem
from app.models.notifications import Notification # Para importar insignias si fuera necesario

@router.get("/profile/{user_id}", response_model=PublicProfileResponse)
async def get_public_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Retorna el perfil público de un usuario."""
    # 1. Obtener el perfil con su nivel
    from app.models.levels import Level
    stmt = select(Profile).options(selectinload(Profile.current_level)).where(Profile.id == user_id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # 1.1 Contar Reseñas
    from app.models.reviews import Review
    r_stmt = select(func.count(Review.id)).where(Review.user_id == user_id)
    r_res = await db.execute(r_stmt)
    reviews_count = r_res.scalar_one() or 0
    
    # 2. Verificar si son amigos
    f_stmt = select(Friendship).where(
        or_(
            and_(Friendship.user_id == current_user.id, Friendship.friend_id == user_id),
            and_(Friendship.user_id == user_id, Friendship.friend_id == current_user.id)
        ),
        Friendship.status == 'accepted'
    )
    f_res = await db.execute(f_stmt)
    is_friend = f_res.scalar_one_or_none() is not None or current_user.id == user_id
    
    # 3. Obtener insignias (Solo si son amigos o es su propio perfil)
    badges = []
    if is_friend:
        from app.models.gamification_advanced import Badge, UserBadge
        b_stmt = select(Badge).join(UserBadge).where(UserBadge.user_id == user_id)
        b_res = await db.execute(b_stmt)
        badges = [BadgeItem.model_validate(b) for b in b_res.scalars().all()]

    return PublicProfileResponse(
        id=profile.id,
        username=profile.username,
        full_name=profile.full_name,
        avatar_url=profile.avatar_url,
        bio=profile.bio,
        current_level_name=profile.current_level.name if profile.current_level else "Bronce",
        reviews_count=reviews_count,
        verified_checkins_count=profile.verified_checkins_count or 0,
        badges=badges,
        is_friend=is_friend
    )

# --- VENUE INVITATIONS ---

from app.schemas.friends import VenueInvitationCreate, VenueInvitationResponse, VenueInvitationAction
from app.models.friends import VenueInvitation
from app.models.venues import Venue
from app.services.gamification_service import gamification_service

@router.post("/invite-to-venue", status_code=status.HTTP_201_CREATED)
async def invite_friend_to_venue(
    invitation: VenueInvitationCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Envía una invitación a un amigo o a un grupo para ir a un local específico."""
    if not invitation.friend_id and not invitation.group_id:
        raise HTTPException(status_code=400, detail="Debes especificar un amigo o un grupo")

    # 1. Verificar existencia del local
    v_stmt = select(Venue).where(Venue.id == invitation.venue_id)
    v_res = await db.execute(v_stmt)
    venue = v_res.scalar_one_or_none()
    if not venue:
        raise HTTPException(status_code=404, detail="El local no existe")

    if invitation.friend_id:
        # Verificar si son amigos
        f_stmt = select(Friendship).where(
            or_(
                and_(Friendship.user_id == current_user.id, Friendship.friend_id == invitation.friend_id),
                and_(Friendship.user_id == invitation.friend_id, Friendship.friend_id == current_user.id)
            ),
            Friendship.status == 'accepted'
        )
        f_res = await db.execute(f_stmt)
        if not f_res.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Solo puedes invitar a tus amigos aceptados")

    if invitation.group_id:
        # Verificar que el grupo existe y que el usuario es miembro
        from app.models.groups import GroupMember
        g_stmt = select(GroupMember).where(
            and_(GroupMember.group_id == invitation.group_id, GroupMember.user_id == current_user.id)
        )
        g_res = await db.execute(g_stmt)
        if not g_res.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Debes ser miembro del grupo para invitarlo")

    # 2. Crear invitación
    new_invite = VenueInvitation(
        user_id=current_user.id,
        friend_id=invitation.friend_id,
        group_id=invitation.group_id,
        venue_id=invitation.venue_id,
        message=invitation.message,
        status='pending'
    )
    db.add(new_invite)
    
    # 3. Otorgar puntos por invitar (Gamificación)
    await gamification_service.register_event(
        db=db,
        user_id=current_user.id,
        event_code="FRIEND_INVITE_VENUE",
        venue_id=invitation.venue_id,
        details={"target": "group" if invitation.group_id else "friend", "id": str(invitation.group_id or invitation.friend_id)}
    )

    await db.commit()

    # 4. Enviar Notificación Push
    if invitation.group_id:
        from app.models.groups import GroupMember
        # Notificar a todos los miembros excepto al invitador
        members_stmt = select(GroupMember.user_id).where(
            and_(GroupMember.group_id == invitation.group_id, GroupMember.user_id != current_user.id)
        )
        members_res = await db.execute(members_stmt)
        member_ids = members_res.scalars().all()
        
        for member_id in member_ids:
            background_tasks.add_task(
                send_venue_invitation_push,
                db=db,
                target_user_id=member_id,
                current_user=current_user,
                venue_id=invitation.venue_id,
                venue_name=venue.name
            )
    else:
        background_tasks.add_task(
            send_venue_invitation_push,
            db=db,
            target_user_id=invitation.friend_id,
            current_user=current_user,
            venue_id=invitation.venue_id,
            venue_name=venue.name
        )

    return {"message": "Invitación enviada con éxito"}

async def send_venue_invitation_push(db, target_user_id, current_user, venue_id, venue_name):
    """Helper para enviar push en segundo plano."""
    try:
        await notification_service.send_in_app_notification(
            db=db,
            user_id=target_user_id,
            title="¡Tienes una invitación! 🍹",
            body=f"{current_user.username} te invita a {venue_name}",
            type="info",
            data={
                "type": "VENUE_INVITATION",
                "sender_id": str(current_user.id),
                "venue_id": str(venue_id),
                "screen": "venue-invitations" 
            }
        )
    except Exception as e:
        print(f"Error enviando push de invitación en background: {e}")

@router.get("/venue-invitations", response_model=List[VenueInvitationResponse])
async def get_venue_invitations(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista las invitaciones a locales recibidas y pendientes."""
    stmt = (
        select(VenueInvitation, Profile.username, Venue.name)
        .join(Profile, VenueInvitation.user_id == Profile.id)
        .join(Venue, VenueInvitation.venue_id == Venue.id)
        .where(VenueInvitation.friend_id == current_user.id)
        .where(VenueInvitation.status == 'pending')
    )
    
    result = await db.execute(stmt)
    invites = []
    for row in result.all():
        inv, sender_name, v_name = row
        inv_resp = VenueInvitationResponse.model_validate(inv)
        inv_resp.sender_username = sender_name
        inv_resp.venue_name = v_name
        invites.append(inv_resp)
        
    return invites

@router.patch("/venue-invitations/{invitation_id}/action")
async def handle_venue_invitation(
    invitation_id: UUID,
    action: VenueInvitationAction,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Acepta o rechaza una invitación a un local."""
    stmt = select(VenueInvitation).where(VenueInvitation.id == invitation_id)
    res = await db.execute(stmt)
    invitation = res.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")
    
    if invitation.friend_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso para gestionar esta invitación")
    
    if action.action == 'accept':
        invitation.status = 'accepted'
        # Notificar al invitador que aceptaron
        await notification_service.send_in_app_notification(
            db=db,
            user_id=invitation.user_id,
            title="¡Invitación aceptada! 🙌",
            body=f"{current_user.username} ha aceptado tu invitación",
            type="success",
            data={"type": "VENUE_INVITATION_ACCEPTED", "friend_id": str(current_user.id)}
        )
    elif action.action == 'reject':
        invitation.status = 'rejected'
    else:
        raise HTTPException(status_code=400, detail="Acción no válida")
    
    await db.commit()
    return {"message": f"Invitación {action.action}ada"}

@router.get("/venue-invitations/sent", response_model=List[VenueInvitationResponse])
async def get_sent_venue_invitations(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista las invitaciones a locales enviadas por el usuario."""
    stmt = (
        select(VenueInvitation, Profile.username, Venue.name)
        .join(Profile, VenueInvitation.friend_id == Profile.id)
        .join(Venue, VenueInvitation.venue_id == Venue.id)
        .where(VenueInvitation.user_id == current_user.id)
        .order_by(desc(VenueInvitation.created_at))
    )
    
    result = await db.execute(stmt)
    invites = []
    for row in result.all():
        inv, friend_name, v_name = row
        inv_resp = VenueInvitationResponse.model_validate(inv)
        inv_resp.sender_username = friend_name # Reusamos este campo para el nombre del invitado en este caso
        inv_resp.venue_name = v_name
        invites.append(inv_resp)
        
    return invites

@router.get("/venue-invitations/received", response_model=List[VenueInvitationResponse])
async def get_received_venue_invitations(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista todas las invitaciones a locales recibidas (historial completo)."""
    stmt = (
        select(VenueInvitation, Profile.username, Venue.name)
        .join(Profile, VenueInvitation.user_id == Profile.id)
        .join(Venue, VenueInvitation.venue_id == Venue.id)
        .where(VenueInvitation.friend_id == current_user.id)
        .order_by(desc(VenueInvitation.created_at))
    )
    
    result = await db.execute(stmt)
    invites = []
    for row in result.all():
        inv, sender_name, v_name = row
        inv_resp = VenueInvitationResponse.model_validate(inv)
        inv_resp.sender_username = sender_name
        inv_resp.venue_name = v_name
        invites.append(inv_resp)
        
    return invites
