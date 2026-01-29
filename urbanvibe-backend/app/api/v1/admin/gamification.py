from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from datetime import datetime

from app.api import deps
from app.models.levels import Level
from app.models.gamification import GamificationEvent
from app.models.gamification_advanced import Challenge, UserChallengeProgress, UserBadge, Badge, ChallengePeriodType

router = APIRouter()

# --- Schemas --- (Defined here for locality, or move to schemas.py)
class LevelCreate(BaseModel):
    name: str
    min_points: int
    benefits: List[str] = []

class LevelUpdate(BaseModel):
    name: Optional[str] = None
    min_points: Optional[int] = None
    benefits: Optional[List[str]] = None

class LevelResponse(BaseModel):
    id: UUID
    name: str
    min_points: int
    benefits: List[str]
    # updated_at: datetime
    
    class Config:
        from_attributes = True

class EventUpdate(BaseModel):
    points: Optional[int] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None

class EventCreate(BaseModel):
    event_code: str
    target_type: str = "user"
    points: int = 0
    is_active: bool = True
    description: Optional[str] = None

class EventResponse(BaseModel):
    event_code: str
    target_type: str
    description: Optional[str]
    points: int
    is_active: bool
    
    class Config:
        from_attributes = True

# --- Period Types ---
class PeriodTypeCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    rules: dict = {}
    is_active: bool = True

class PeriodTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[dict] = None
    is_active: Optional[bool] = None

class PeriodTypeResponse(BaseModel):
    code: str
    name: str
    description: Optional[str]
    rules: dict
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Endpoints ---

@router.get("/levels", response_model=List[LevelResponse])
async def list_levels(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
):
    """List all gamification levels."""
    result = await db.execute(select(Level).order_by(Level.min_points))
    return result.scalars().all()

@router.post("/levels", response_model=LevelResponse)
async def create_level(
    level_in: LevelCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
):
    """Create a new level."""
    # Check duplicate
    stmt = select(Level).where(Level.name == level_in.name)
    existing = await db.scalar(stmt)
    if existing:
        raise HTTPException(400, "Level name already exists")
    
    new_level = Level(
        name=level_in.name,
        min_points=level_in.min_points,
        benefits=level_in.benefits
    )
    db.add(new_level)
    await db.commit()
    await db.refresh(new_level)
    return new_level

@router.patch("/levels/{level_id}", response_model=LevelResponse)
async def update_level(
    level_id: UUID,
    level_in: LevelUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
):
    """Update a level."""
    level = await db.get(Level, level_id)
    if not level:
        raise HTTPException(404, "Level not found")
        
    update_data = level_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(level, field, value)
        
    await db.commit()
    await db.refresh(level)
    return level

@router.delete("/levels/{level_id}")
async def delete_level(
    level_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
):
    """Delete a level (Warning: may break users on this level)."""
    level = await db.get(Level, level_id)
    if not level:
        raise HTTPException(404, "Level not found")
    
    await db.delete(level)
    await db.commit()
    return {"message": "Level deleted"}

# --- Events ---

@router.get("/events", response_model=List[EventResponse])
async def list_events(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
):
    """List all gamification rules/events."""
    result = await db.execute(select(GamificationEvent).order_by(GamificationEvent.event_code))
    return result.scalars().all()

@router.patch("/events/{event_code}", response_model=EventResponse)
async def update_event(
    event_code: str,
    event_in: EventUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
):
    """Update event points/status."""
    stmt = select(GamificationEvent).where(GamificationEvent.event_code == event_code)
    event = await db.scalar(stmt)
    if not event:
        raise HTTPException(404, "Event not found")
        
    update_data = event_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
        
    await db.commit()
    await db.refresh(event)
    return event

@router.post("/events", response_model=EventResponse)
async def create_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_active_superuser),
):
    """Create a new point rule event."""
    # Check duplicate
    stmt = select(GamificationEvent).where(GamificationEvent.event_code == event_in.event_code)
    existing = await db.scalar(stmt)
    if existing:
        raise HTTPException(400, "Event code already exists")
    
    new_event = GamificationEvent(**event_in.model_dump())
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    return new_event

# --- BADGES ---

class BadgeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    category: str = "GENERAL"

class BadgeResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    icon_url: Optional[str]
    category: str
    class Config:
        from_attributes = True

@router.get("/badges", response_model=List[BadgeResponse])
async def list_badges(db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    from app.models.gamification_advanced import Badge
    result = await db.execute(select(Badge).order_by(Badge.name))
    return result.scalars().all()

@router.post("/badges", response_model=BadgeResponse)
async def create_badge(badge_in: BadgeCreate, db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    from app.models.gamification_advanced import Badge
    # Check duplicate
    if await db.scalar(select(Badge).where(Badge.name == badge_in.name)):
        raise HTTPException(400, "Badge name exists")
        
    new_badge = Badge(**badge_in.model_dump())
    db.add(new_badge)
    await db.commit()
    await db.refresh(new_badge)
    return new_badge

# --- CHALLENGES ---

class ChallengeCreate(BaseModel):
    code: str
    title: str
    description: Optional[str] = None
    challenge_type: str
    target_value: int = 1
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    period_type_code: str = "all_time"
    reward_points: int = 0
    reward_badge_id: Optional[UUID] = None
    reward_promotion_id: Optional[UUID] = None
    filters: dict = {}

class ChallengeResponse(BaseModel):
    id: UUID
    code: str
    title: str
    challenge_type: str
    target_value: int
    is_active: bool
    period_type_code: str
    reward_points: int
    reward_promotion_id: Optional[UUID] = None
    class Config:
        from_attributes = True

@router.get("/challenges", response_model=List[ChallengeResponse])
async def list_challenges(db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    from app.models.gamification_advanced import Challenge
    result = await db.execute(select(Challenge).order_by(Challenge.created_at.desc()))
    return result.scalars().all()

@router.post("/challenges", response_model=ChallengeResponse)
async def create_challenge(item_in: ChallengeCreate, db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    # Check duplicate code
    if await db.scalar(select(Challenge).where(Challenge.code == item_in.code)):
        raise HTTPException(400, "Challenge code exists")
    
    new_challenge = Challenge(**item_in.model_dump())
    db.add(new_challenge)
    await db.commit()
    await db.refresh(new_challenge)
    return new_challenge

# --- PERIOD TYPES ENDPOINTS ---

@router.get("/periods", response_model=List[PeriodTypeResponse])
async def list_periods(db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    """List all period types for challenges."""
    result = await db.execute(select(ChallengePeriodType).order_by(ChallengePeriodType.name))
    return result.scalars().all()

@router.post("/periods", response_model=PeriodTypeResponse)
async def create_period(item_in: PeriodTypeCreate, db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    """Create a new period type."""
    if await db.get(ChallengePeriodType, item_in.code):
        raise HTTPException(400, "Period code exists")
        
    new_period = ChallengePeriodType(**item_in.model_dump())
    db.add(new_period)
    await db.commit()
    await db.refresh(new_period)
    return new_period

@router.patch("/periods/{code}", response_model=PeriodTypeResponse)
async def update_period(code: str, item_in: PeriodTypeUpdate, db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    """Update a period type."""
    period = await db.get(ChallengePeriodType, code)
    if not period:
        raise HTTPException(404, "Period not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(period, field, value)
        
    await db.commit()
    await db.refresh(period)
    return period

@router.delete("/periods/{code}")
async def delete_period(code: str, db: AsyncSession = Depends(deps.get_db), _: dict = Depends(deps.get_current_active_superuser)):
    """Delete a period type."""
    period = await db.get(ChallengePeriodType, code)
    if not period:
        raise HTTPException(404, "Period not found")
    
    await db.delete(period)
    await db.commit()
    return {"message": "Period deleted"}

# --- BADGES CRUD (PATCH/DELETE) ---

class BadgeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    category: Optional[str] = None

@router.patch("/badges/{badge_id}", response_model=BadgeResponse)
async def update_badge(
    badge_id: UUID,
    badge_in: BadgeUpdate,
    db: AsyncSession = Depends(deps.get_db),
    _: dict = Depends(deps.get_current_active_superuser)
):
    """Update a badge."""
    from app.models.gamification_advanced import Badge
    badge = await db.get(Badge, badge_id)
    if not badge:
        raise HTTPException(404, "Badge not found")
    
    update_data = badge_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(badge, field, value)
    
    await db.commit()
    await db.refresh(badge)
    return badge

@router.delete("/badges/{badge_id}")
async def delete_badge(
    badge_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    _: dict = Depends(deps.get_current_active_superuser)
):
    """Delete a badge (Warning: may affect users with this badge)."""
    from app.models.gamification_advanced import Badge
    badge = await db.get(Badge, badge_id)
    if not badge:
        raise HTTPException(404, "Badge not found")
    
    await db.delete(badge)
    await db.commit()
    return {"message": "Badge deleted"}

# --- CHALLENGES CRUD (PATCH/DELETE) ---

class ChallengeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    challenge_type: Optional[str] = None
    target_value: Optional[int] = None
    is_active: Optional[bool] = None
    reward_points: Optional[int] = None
    reward_badge_id: Optional[UUID] = None
    reward_promotion_id: Optional[UUID] = None
    filters: Optional[dict] = None
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    period_type_code: Optional[str] = None

@router.patch("/challenges/{challenge_id}", response_model=ChallengeResponse)
async def update_challenge(
    challenge_id: UUID,
    challenge_in: ChallengeUpdate,
    db: AsyncSession = Depends(deps.get_db),
    _: dict = Depends(deps.get_current_active_superuser)
):
    """Update a challenge."""
    from app.models.gamification_advanced import Challenge
    challenge = await db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    
    update_data = challenge_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(challenge, field, value)
    
    await db.commit()
    await db.refresh(challenge)
    return challenge

@router.delete("/challenges/{challenge_id}")
async def delete_challenge(
    challenge_id: UUID,
    db: AsyncSession = Depends(deps.get_db),
    _: dict = Depends(deps.get_current_active_superuser)
):
    """Delete a challenge (Warning: may affect user progress)."""
    from app.models.gamification_advanced import Challenge
    challenge = await db.get(Challenge, challenge_id)
    if not challenge:
        raise HTTPException(404, "Challenge not found")
    
    await db.delete(challenge)
    await db.commit()
    return {"message": "Challenge deleted"}

