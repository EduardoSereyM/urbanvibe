from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import List, Optional
from datetime import datetime

class UserSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    referral_code: Optional[str] = None
    current_level_name: Optional[str] = None
    # No incluimos email por privacidad

class FriendListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    friendship_id: UUID
    friend_id: UUID
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str # 'pending', 'accepted'
    is_sender: bool # Para saber si el usuario actual fue quien envió la solicitud
    created_at: datetime

class FriendRequestAction(BaseModel):
    action: str # 'accept' | 'reject'

class BadgeItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None

class PublicProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    username: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    current_level_name: Optional[str] = None
    reviews_count: int = 0
    verified_checkins_count: int = 0
    badges: List[BadgeItem] = []
    is_friend: bool = False

class VenueInvitationCreate(BaseModel):
    friend_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
    venue_id: UUID
    message: Optional[str] = None

class VenueInvitationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    friend_id: Optional[UUID] = None
    group_id: Optional[UUID] = None
    venue_id: UUID
    message: Optional[str] = None
    status: str
    created_at: datetime
    
    # Datos adicionales para la UI
    sender_username: Optional[str] = None
    venue_name: Optional[str] = None

class VenueInvitationAction(BaseModel):
    action: str # 'accept' | 'reject'
