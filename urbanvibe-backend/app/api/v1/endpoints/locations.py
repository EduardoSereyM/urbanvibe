from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.locations import Country, Region, City
from app.schemas.locations import CountryResponse, RegionResponse, CityResponse

router = APIRouter()

@router.get("/countries", response_model=List[CountryResponse])
async def get_countries(db: AsyncSession = Depends(get_db)):
    """
    Retorna lista de países disponibles.
    """
    result = await db.execute(select(Country).order_by(Country.name))
    return result.scalars().all()

@router.get("/regions/{country_code}", response_model=List[RegionResponse])
async def get_regions(country_code: str, db: AsyncSession = Depends(get_db)):
    """
    Retorna regiones para un país específico dado su código (ej: 'CL').
    """
    result = await db.execute(
        select(Region)
        .where(Region.country_code == country_code)
        .order_by(Region.name)
    )
    return result.scalars().all()

@router.get("/cities/{region_id}", response_model=List[CityResponse])
async def get_cities(region_id: int, db: AsyncSession = Depends(get_db)):
    """
    Retorna comunas/ciudades para una región específica.
    """
    result = await db.execute(
        select(City)
        .where(City.region_id == region_id)
        .order_by(City.name)
    )
    return result.scalars().all()
