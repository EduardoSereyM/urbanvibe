import asyncio
import logging
from sqlalchemy import select, func
from app.db.session import engine, AsyncSessionLocal
from app.models.profiles import Profile
from app.models.gamification import GamificationLog

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_missing_logs():
    logger.info("Starting Log Backfill...")
    
    async with AsyncSessionLocal() as db:
        # 1. Encontrar usuarios con puntos > 0 pero SIN logs
        logger.info("Scanning users...")
        
        stmt = select(Profile).where(Profile.points_lifetime > 0)
        result = await db.execute(stmt)
        profiles = result.scalars().all()
        
        count = 0
        for p in profiles:
            # Check logs
            log_stmt = select(func.count(GamificationLog.id)).where(GamificationLog.user_id == p.id)
            log_res = await db.execute(log_stmt)
            log_count = log_res.scalar() or 0
            
            if log_count == 0:
                logger.info(f"Fixing user {p.username} (ID: {p.id}) - Points: {p.points_lifetime}")
                
                # Crear log inicial
                new_log = GamificationLog(
                    user_id=p.id,
                    event_code="INITIAL_BALANCE",
                    points=p.points_lifetime,
                    details={"reason": "Backfill de historial para usuarios antiguos"}
                )
                db.add(new_log)
                count += 1
        
        await db.commit()
        logger.info(f"Fixed {count} users.")

if __name__ == "__main__":
    asyncio.run(fix_missing_logs())
