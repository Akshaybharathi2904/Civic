import api from '../../../shared/api/apiClient';

export interface GeocodedAddress {
  formattedAddress: string;
  road?: string;
  suburb?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface LocationSearchResult {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

export const mapsService = {
  /**
   * Reverse Geocoding using OpenStreetMap Nominatim API
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CivicSwarm-GovTech-Platform/2.6',
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed with status ${response.status}`);
      }

      const data = await response.json();
      const addr = data.address || {};

      const road = addr.road || addr.street || addr.pedestrian || addr.footway || '';
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '';
      const city = addr.city || addr.town || addr.municipality || addr.county || 'Coimbatore';
      const state = addr.state || 'Tamil Nadu';
      const postcode = addr.postcode || '';

      const parts = [road, suburb, city, state, postcode].filter(Boolean);
      const formattedAddress = parts.length > 0 ? parts.join(', ') : data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      return {
        formattedAddress,
        road,
        suburb,
        city,
        state,
        postcode,
        latitude: lat,
        longitude: lng,
      };
    } catch (err) {
      console.warn('[mapsService] Reverse geocoding API error, using coordinate string:', err);
      return {
        formattedAddress: `Location at (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
        latitude: lat,
        longitude: lng,
      };
    }
  },

  /**
   * Location Search using OpenStreetMap Nominatim API
   */
  async searchLocation(query: string): Promise<LocationSearchResult[]> {
    if (!query || !query.trim()) return [];

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CivicSwarm-GovTech-Platform/2.6',
        },
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.map((item: any) => ({
        placeId: item.place_id.toString(),
        displayName: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));
    } catch (err) {
      console.warn('[mapsService] Location search error:', err);
      return [];
    }
  },

  /**
   * Get device GPS position via browser Geolocation API
   */
  async getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },

  async getHeatmapPoints(params?: Record<string, any>): Promise<any[]> {
    const res = await api.get<any[]>('/analytics/heatmap', { params });
    return Array.isArray(res) ? res : (res as any).data || [];
  },
};

export default mapsService;
