from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class GroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    is_private: bool = True

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    is_private: Optional[bool] = None

class GroupResponse(GroupBase):
    id: UUID
    creator_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class GroupMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True

class GroupInvitationCreate(BaseModel):
    invitee_id: UUID

class GroupInvitationResponse(BaseModel):
    id: UUID
    group_id: UUID
    group_name: Optional[str] = None
    inviter_id: UUID
    inviter_username: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class GroupInvitationAction(BaseModel):
    action: str # 'accept', 'reject'
