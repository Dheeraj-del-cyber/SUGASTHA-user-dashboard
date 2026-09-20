import { Hospital } from '../types';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

const haversineKm = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
) => {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(latitude2 - latitude1);
  const deltaLon = toRadians(longitude2 - longitude1);
  const lat1 = toRadians(latitude1);
  const lat2 = toRadians(latitude2);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const buildAddress = (tags: Record<string, string | undefined>) => {
  const parts = [
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'],
    tags['addr:district'],
    tags['addr:state'],
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'Hospital location';
};

const toHospital = (item: any, userLocation: UserLocation): Hospital | null => {
  const lat = item?.lat ?? item?.center?.lat;
  const lon = item?.lon ?? item?.center?.lon;
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return null;
  }

  const tags = item?.tags ?? {};
  const name = tags.name || tags['name:en'] || 'Hospital';
  const distanceKm = haversineKm(userLocation.latitude, userLocation.longitude, lat, lon);

  return {
    id: `osm-${item.id ?? `${lat}-${lon}`}`,
    name,
    type: 'GOVERNMENT_TERTIARY',
    address: buildAddress(tags),
    district: tags['addr:district'] || tags['addr:city'] || 'Local area',
    pincode: tags['addr:postcode'] || 'N/A',
    latitude: lat,
    longitude: lon,
    distanceKm: Number(distanceKm.toFixed(1)),
    estimatedTravelTimeMinutes: Math.max(5, Math.round(distanceKm * 4.5)),
    fareEstimates: {
      autoFare: 0,
      cabFare: 0,
      transitFare: 0,
    },
    bedAvailabilityStatus: 'AVAILABLE',
    emergencyQueueStatus: 'NORMAL',
    nabhAccredited: false,
    doctors: [],
    contactPhone: 'Not available from live source',
    ambulanceHotline: 'Not available from live source',
    source: 'LIVE_OSM',
    availabilityNote: 'Live hospital registry data; real-time crowding and doctor availability are not provided by this source.',
  };
};

export const hospitalSearchService = {
  async searchNearbyHospitals(
    userLocation: UserLocation,
    maxResults = 8,
    radiusKm = 5
  ): Promise<Hospital[]> {
    const radii = [radiusKm, 15, 30, 60, 100];

    for (const currentRadius of radii) {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${Math.round(currentRadius * 1000)},${userLocation.latitude},${userLocation.longitude});
          way["amenity"="hospital"](around:${Math.round(currentRadius * 1000)},${userLocation.latitude},${userLocation.longitude});
          node["healthcare"="hospital"](around:${Math.round(currentRadius * 1000)},${userLocation.latitude},${userLocation.longitude});
          way["healthcare"="hospital"](around:${Math.round(currentRadius * 1000)},${userLocation.latitude},${userLocation.longitude});
        );
        out center;`;

      try {
        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          continue;
        }

        const payload = await response.json();
        const hospitals = (payload.elements ?? [])
          .map((element: any) => toHospital(element, userLocation))
          .filter(Boolean) as Hospital[];

        if (hospitals.length) {
          return hospitals
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, maxResults);
        }
      } catch {
        continue;
      }
    }

    return [];
  },
};
