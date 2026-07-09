import * as ExpoLocation from 'expo-location';

export interface LocationResult {
  lat: number;
  lng: number;
  label: string | null;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  return status === ExpoLocation.PermissionStatus.GRANTED;
}

export async function getCurrentLocation(): Promise<LocationResult> {
  const position = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.High,
  });

  const { latitude, longitude } = position.coords;
  const label = await reverseGeocode(latitude, longitude);

  return { lat: latitude, lng: longitude, label };
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  // Try Apple Maps native first — gives street number when near an address
  try {
    const results = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (results.length) {
      const place = results[0];
      const parts = [place.streetNumber, place.street, place.city, place.region, place.postalCode].filter(Boolean);
      if (parts.length >= 2) return parts.join(', ');
    }
  } catch {}

  // Fallback: Nominatim reverse geocode (more granular on open roads)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`;
    const res = await fetch(url, { headers: { 'User-Agent': 'CrashSafe/1.0' } });
    const data = await res.json() as {
      display_name: string;
      address: Record<string, string>;
    };
    const a = data.address;
    const street = [a.house_number, a.road].filter(Boolean).join(' ');
    const city = a.city ?? a.town ?? a.village ?? a.county ?? '';
    const parts = [street, city, a.state, a.postcode].filter(Boolean);
    if (parts.length >= 2) return parts.join(', ');
    return data.display_name.replace(/, United States$/, '') || null;
  } catch {}

  return null;
}
