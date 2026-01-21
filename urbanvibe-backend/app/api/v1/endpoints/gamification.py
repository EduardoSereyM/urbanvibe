from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.profiles import Profile
from app.models.gamification import GamificationLog
from app.models.levels import Level
from app.schemas.gamification import GamificationLogResponse, PointStatsResponse

router = APIRouter()

@router.get("/my-history", response_model=List[GamificationLogResponse])
async def get_my_points_history(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Retorna el historial de puntos (logs) del usuario actual."""
    stmt = (
        select(GamificationLog)
        .where(GamificationLog.user_id == current_user.id)
        .order_by(desc(GamificationLog.created_at))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/my-stats", response_model=PointStatsResponse)
async def get_my_point_stats(
    db: AsyncSession = Depends(get_db),
    current_user: Profile = Depends(get_current_user)
):
    """Retorna las estadísticas y progreso de nivel del usuario."""
    # 1. Obtener nivel actual
    stmt_level = select(Level).where(Level.id == current_user.current_level_id)
    res_level = await db.execute(stmt_level)
    current_level = res_level.scalar_one_or_none()
    
    if not current_level:
        raise HTTPException(status_code=404, detail="Nivel no encontrado")
        
    # 2. Obtener siguiente nivel
    stmt_next = (
        select(Level)
        .where(Level.min_points > current_level.min_points)
        .order_by(Level.min_points)
        .limit(1)
    )
    res_next = await db.execute(stmt_next)
    next_level = res_next.scalar_one_or_none()
    
    # 3. Calcular progreso
    points = current_user.reputation_score or 0
    progress = 1.0
    next_points = None
    
    if next_level:
        range_points = next_level.min_points - current_level.min_points
        user_relative_points = points - current_level.min_points
        progress = min(max(user_relative_points / range_points, 0.0), 1.0)
        next_points = next_level.min_points

    return {
        "points_current": current_user.points_current or 0,
        "points_lifetime": current_user.points_lifetime or 0,
        "reputation_score": points,
        "level_name": current_level.name,
        "next_level_name": next_level.name if next_level else None,
        "next_level_points": next_points,
        "progress_to_next_level": progress
    }
