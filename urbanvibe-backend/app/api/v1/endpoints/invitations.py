from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.models.profiles import Profile
from app.models.venues import Venue

router = APIRouter()

class ValidationResponse(BaseModel):
    valid: bool
    type: Optional[str] = None # 'user', 'venue'
    owner_name: Optional[str] = None
    message: Optional[str] = None

@router.get("/validate/{code}", response_model=ValidationResponse)
async def validate_invitation_code(
    code: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Verifica si un código de invitación es válido (existe en usuarios o venues).
    """
    code = code.strip().upper() # Asumiendo códigos case-insensitive o mayúsculas
    print(f"------------> VALIDATING CODE: '{code}' <------------")

    # 1. Buscar en Perfiles
    query = select(Profile).where(Profile.referral_code == code)
    result_user = await db.execute(query)
    user = result_user.scalars().first()
    print(f"User Search Result: {user}")

    if user:
        return ValidationResponse(
            valid=True,
            type="user",
            owner_name=user.username or user.display_name or "Usuario UrbanVibe",
            message="Código de usuario válido"
        )

    # 2. Buscar en Venues
    result_venue = await db.execute(select(Venue).where(Venue.referral_code == code))
    venue = result_venue.scalars().first()
    print(f"Venue Search Result: {venue}")

    if venue:
        return ValidationResponse(
            valid=True,
            type="venue",
            owner_name=venue.name,
            message="Código de partner válido"
        )

    # 3. No encontrado
    return ValidationResponse(
        valid=False,
        message="Código no encontrado o expirado"
    )
