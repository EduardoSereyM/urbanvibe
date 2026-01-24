from sqlalchemy import Column, String, BigInteger, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Country(Base):
    __tablename__ = "countries"
    __table_args__ = {"schema": "public"}

    # id is code (char PK)
    code = Column(String, primary_key=True)
    name = Column(String, nullable=False)

    regions = relationship("Region", back_populates="country")

class Region(Base):
    __tablename__ = "regions"
    __table_args__ = {"schema": "public"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    country_code = Column(String, ForeignKey("public.countries.code"))
    name = Column(String, nullable=False)

    country = relationship("Country", back_populates="regions")
    cities = relationship("City", back_populates="region")

class City(Base):
    __tablename__ = "cities"
    __table_args__ = {"schema": "public"}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    region_id = Column(BigInteger, ForeignKey("public.regions.id"))
    name = Column(String, nullable=False)

    region = relationship("Region", back_populates="cities")
