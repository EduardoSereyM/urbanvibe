from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import uuid

class Group(Base):
    __tablename__ = "groups"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    avatar_url = Column(String)
    
    # Creador del grupo (Super Admin de este grupo)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class GroupMember(Base):
    __tablename__ = "group_members"
    __table_args__ = (
        UniqueConstraint('group_id', 'user_id', name='unique_group_membership'),
        {"schema": "public"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("public.groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    
    # role: 'admin', 'member'
    role = Column(String, nullable=False, server_default="member")
    
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

class GroupInvitation(Base):
    __tablename__ = "group_invitations"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("public.groups.id", ondelete="CASCADE"), nullable=False)
    
    # Quien invita
    inviter_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    # Invitado
    invitee_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    
    # pending, accepted, rejected, cancelled
    status = Column(String, nullable=False, server_default="pending")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
