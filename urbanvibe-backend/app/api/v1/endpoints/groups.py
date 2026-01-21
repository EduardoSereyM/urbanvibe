from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func, desc
from sqlalchemy.orm import selectinload
from uuid import UUID
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.profiles import Profile
from app.models.groups import Group, GroupMember, GroupInvitation
from app.models.friends import Friendship
from app.schemas.groups import (
    GroupCreate, GroupResponse, GroupMemberResponse, 
    GroupInvitationCreate, GroupInvitationResponse, GroupInvitationAction
)
from app.services.notifications.core import notification_service

router = APIRouter()

@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    group_in: GroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Crea un nuevo grupo y añade al creador como ADMIN."""
    new_group = Group(
        **group_in.model_dump(),
        creator_id=current_user.id
    )
    db.add(new_group)
    await db.flush() # Para obtener el ID del grupo

    # Añadir creador como miembro admin
    creator_member = GroupMember(
        group_id=new_group.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(creator_member)
    
    await db.commit()
    await db.refresh(new_group)
    return new_group

@router.get("/my-groups", response_model=List[GroupResponse])
async def get_my_groups(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista los grupos a los que pertenece el usuario."""
    stmt = (
        select(Group)
        .join(GroupMember, Group.id == GroupMember.group_id)
        .where(GroupMember.user_id == current_user.id)
        .order_by(Group.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group_detail(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Obtiene detalles de un grupo específico (debe ser miembro o ser público)."""
    stmt = select(Group).where(Group.id == group_id)
    res = await db.execute(stmt)
    group = res.scalar_one_or_none()
    
    if not group:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
        
    # Verificar membresía si es privado
    if group.is_private:
        member_stmt = select(GroupMember).where(
            and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id)
        )
        is_member = await db.execute(member_stmt)
        if not is_member.scalar_one_or_none():
            raise HTTPException(status_code=403, detail="Este grupo es privado")
            
    return group

@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
async def get_group_members(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista los miembros de un grupo."""
    # Primero verificar que el usuario pertenece al grupo
    member_check = select(GroupMember).where(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id)
    )
    res_check = await db.execute(member_check)
    if not res_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="No eres miembro de este grupo")

    stmt = (
        select(GroupMember, Profile.username, Profile.full_name, Profile.avatar_url)
        .join(Profile, GroupMember.user_id == Profile.id)
        .where(GroupMember.group_id == group_id)
    )
    result = await db.execute(stmt)
    
    response = []
    for row in result.all():
        member, username, full_name, avatar = row
        member_resp = GroupMemberResponse.model_validate(member)
        member_resp.username = username
        member_resp.full_name = full_name
        member_resp.avatar_url = avatar
        response.append(member_resp)
        
    return response

@router.post("/{group_id}/invite", status_code=status.HTTP_201_CREATED)
async def invite_to_group(
    group_id: UUID,
    invitation_in: GroupInvitationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Invita a un amigo a un grupo."""
    # 1. Verificar que el invitador es miembro
    member_stmt = select(GroupMember).where(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == current_user.id)
    )
    res_member = await db.execute(member_stmt)
    if not res_member.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Debes ser miembro para invitar")

    # 2. Verificar que el invitado existe
    user_stmt = select(Profile).where(Profile.id == invitation_in.invitee_id)
    res_user = await db.execute(user_stmt)
    if not res_user.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 3. Verificar que no sea miembro ya
    already_member = select(GroupMember).where(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == invitation_in.invitee_id)
    )
    res_already = await db.execute(already_member)
    if res_already.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El usuario ya es miembro de este grupo")

    # 4. Crear invitación
    new_invitation = GroupInvitation(
        group_id=group_id,
        inviter_id=current_user.id,
        invitee_id=invitation_in.invitee_id,
        status="pending"
    )
    db.add(new_invitation)
    await db.commit()

    # 5. Notificar
    group_res = await db.execute(select(Group).where(Group.id == group_id))
    group = group_res.scalar_one()
    
    await notification_service.send_in_app_notification(
        db=db,
        user_id=invitation_in.invitee_id,
        title="¡Invitación a un grupo! 👥",
        body=f"{current_user.username} te ha invitado al grupo '{group.name}'",
        type="info",
        data={"type": "GROUP_INVITATION", "group_id": str(group_id), "screen": "community"}
    )

    return {"message": "Invitación enviada"}

@router.get("/invitations/received", response_model=List[GroupInvitationResponse])
async def get_received_group_invitations(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Lista invitaciones a grupos recibidas."""
    stmt = (
        select(GroupInvitation, Group.name, Profile.username)
        .join(Group, GroupInvitation.group_id == Group.id)
        .join(Profile, GroupInvitation.inviter_id == Profile.id)
        .where(and_(GroupInvitation.invitee_id == current_user.id, GroupInvitation.status == "pending"))
    )
    result = await db.execute(stmt)
    
    response = []
    for row in result.all():
        inv, group_name, inviter_username = row
        inv_resp = GroupInvitationResponse.model_validate(inv)
        inv_resp.group_name = group_name
        inv_resp.inviter_username = inviter_username
        response.append(inv_resp)
        
    return response

@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_200_OK)
async def remove_group_member(
    group_id: UUID,
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Elimina a un miembro del grupo. Solo el admin puede eliminar a otros, cualquier miembro puede salirse."""
    # 1. Obtener el grupo
    group_stmt = select(Group).where(Group.id == group_id)
    group_res = await db.execute(group_stmt)
    group = group_res.scalar_one_or_none()
    
    if not group:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")

    # 2. Obtener membresía del objetivo
    target_member_stmt = select(GroupMember).where(
        and_(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
    )
    res_target = await db.execute(target_member_stmt)
    target_member = res_target.scalar_one_or_none()
    
    if not target_member:
        raise HTTPException(status_code=404, detail="El usuario no es miembro de este grupo")

    # 3. Lógica de permisos
    if current_user.id == group.creator_id:
        # El creador puede eliminar a cualquiera excepto a sí mismo (debe borrar el grupo o transferir)
        if user_id == group.creator_id:
            raise HTTPException(status_code=400, detail="El creador no puede eliminarse a sí mismo. Borra el grupo si deseas salir.")
    elif current_user.id == user_id:
        # Un miembro normal puede salirse
        pass
    else:
        # Alguien más intenta borrar
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar a este miembro")

    await db.delete(target_member)
    await db.commit()
    
    return {"message": "Miembro eliminado con éxito"}

@router.get("/profile/{user_id}", response_model=List[GroupResponse])
async def get_user_public_groups(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Obtiene los grupos públicos a los que pertenece un usuario (visto desde un perfil)."""
    stmt = (
        select(Group)
        .join(GroupMember, Group.id == GroupMember.group_id)
        .where(and_(GroupMember.user_id == user_id, Group.is_private == False))
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.patch("/invitations/{invitation_id}/action")
async def handle_group_invitation(
    invitation_id: UUID,
    action: GroupInvitationAction,
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Acepta o rechaza una invitación a un grupo."""
    stmt = select(GroupInvitation).where(GroupInvitation.id == invitation_id)
    res = await db.execute(stmt)
    invitation = res.scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitación no encontrada")
    
    if invitation.invitee_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permiso")
        
    if action.action == 'accept':
        invitation.status = 'accepted'
        # Añadir al grupo
        new_member = GroupMember(
            group_id=invitation.group_id,
            user_id=current_user.id,
            role="member"
        )
        db.add(new_member)
    elif action.action == 'reject':
        invitation.status = 'rejected'
    else:
        raise HTTPException(status_code=400, detail="Acción no válida")
        
    await db.commit()
    return {"message": f"Invitación {action.action}ada"}
