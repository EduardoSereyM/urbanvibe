from pydantic import BaseModel, ConfigDict
from typing import List

class CityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    region_id: int

class RegionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    country_code: str
    # cities: List[CityResponse] = [] # Optional, avoid heavy nesting by default

class CountryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    name: str
    # regions: List[RegionResponse] = [] # Optional
