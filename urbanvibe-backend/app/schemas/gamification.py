from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class GamificationLogResponse(BaseModel):
    id: UUID
    event_code: str
    points: int
    source_entity: Optional[str] = None
    source_id: Optional[UUID] = None
    details: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True

class PointStatsResponse(BaseModel):
    points_current: int
    points_lifetime: int
    reputation_score: int
    level_name: str
    next_level_name: Optional[str] = None
    next_level_points: Optional[int] = None
    progress_to_next_level: float # 0.0 to 1.0

    class Config:
        from_attributes = True
