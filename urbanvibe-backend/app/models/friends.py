from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class Friendship(Base):
    __tablename__ = "friendships"
    __table_args__ = (
        UniqueConstraint('user_id', 'friend_id', name='unique_friendship'),
        {"schema": "public"}
    )

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    
    # user_id es quien envía la solicitud
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    # friend_id es quien recibe la solicitud
    friend_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    
    # pending, accepted, rejected, blocked
    status = Column(String, nullable=False, server_default="pending")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class VenueInvitation(Base):
    __tablename__ = "venue_invitations"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    
    # Quien invita
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=False)
    # Invitado (Individual o Grupo)
    friend_id = Column(UUID(as_uuid=True), ForeignKey("public.profiles.id"), nullable=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("public.groups.id"), nullable=True)
    
    # Local
    venue_id = Column(UUID(as_uuid=True), ForeignKey("public.venues.id"), nullable=False)
    
    message = Column(String, nullable=True)
    status = Column(String, nullable=False, server_default="pending") # pending, accepted, rejected
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
