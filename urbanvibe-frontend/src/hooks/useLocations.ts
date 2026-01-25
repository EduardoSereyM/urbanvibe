import { useState, useEffect } from 'react';
import { client } from '../api/client';

export interface LocationItem {
  id: number;
  name: string;
}

export interface CountryItem {
  code: string;
  name: string;
}

export const useLocations = () => {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [regions, setRegions] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const res = await client.get('/locations/countries');
      const data = res.data;
      setCountries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading countries", e);
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async (countryCode: string) => {
    if (!countryCode) {
      setRegions([]);
      return;
    }
    try {
      setLoading(true);
      console.log("Fetching regions for:", countryCode);
      const res = await client.get(`/locations/regions/${countryCode}`);
      const data = res.data;
      setRegions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading regions", e);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async (regionId: number) => {
    if (!regionId) {
      setCities([]);
      return;
    }
    try {
      setLoading(true);
      console.log("Fetching cities for region:", regionId);
      const res = await client.get(`/locations/cities/${regionId}`);
      const data = res.data;
      setCities(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error loading cities", e);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    countries,
    regions,
    cities,
    loadRegions,
    loadCities,
    loading
  };
};
