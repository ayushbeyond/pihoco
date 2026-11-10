// Nearby places from OpenStreetMap: free, no key. Data © OpenStreetMap contributors,
// ODbL. Show that attribution wherever results appear.
// Fair use: Nominatim allows ~1 request/second and needs an identifying referrer;
// call these only on a user action and cache results.

export interface NearbyPlace {
  id: string; name: string; kind: string; cuisine: string[]; website?: string;
  lat: number; lon: number; distanceM: number; address?: string;
}

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OVERPASS = "https://overpass-api.de/api/interpreter";

export async function geocode(query: string): Promise<{ lat: number; lon: number; label: string } | null> {
  const url = `${NOMINATIM}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) return null;
  const [hit] = await res.json();
  return hit ? { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon), label: hit.display_name } : null;
}

export function overpassQuery(lat: number, lon: number, radiusM: number): string {
  const sel = `["amenity"~"^(restaurant|cafe|fast_food|bar|pub|food_court)$"]["name"]`;
  return `[out:json][timeout:25];(node${sel}(around:${radiusM},${lat},${lon});way${sel}(around:${radiusM},${lat},${lon}););out center tags 200;`;
}

export function haversine(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseOverpass(json: any, lat: number, lon: number): NearbyPlace[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json?.elements ?? []).map((e: any) => {
    const t = e.tags ?? {};
    const plat = e.lat ?? e.center?.lat, plon = e.lon ?? e.center?.lon;
    const addr = [t["addr:housenumber"], t["addr:street"], t["addr:suburb"] ?? t["addr:city"]].filter(Boolean).join(" ");
    return {
      id: `${e.type}/${e.id}`, name: t.name, kind: t.amenity,
      cuisine: (t.cuisine ?? "").split(/[;,]/).map((s: string) => s.trim()).filter(Boolean),
      website: t.website ?? t["contact:website"] ?? undefined,
      lat: plat, lon: plon, distanceM: Math.round(haversine(lat, lon, plat, plon)), address: addr || undefined,
    } as NearbyPlace;
  }).filter((p: NearbyPlace) => p.name && isFinite(p.distanceM)).sort((a: NearbyPlace, b: NearbyPlace) => a.distanceM - b.distanceM);
}

/** Similar places near an address. `cuisine` filters loosely (e.g. "indian"). */
export async function nearbyCompetitors(address: string, opts: { radiusM?: number; cuisine?: string; kinds?: string[]; limit?: number } = {}) {
  const at = await geocode(address);
  if (!at) return { origin: null, places: [] as NearbyPlace[] };
  const res = await fetch(OVERPASS, { method: "POST", body: "data=" + encodeURIComponent(overpassQuery(at.lat, at.lon, opts.radiusM ?? 1500)) });
  if (!res.ok) return { origin: at, places: [] as NearbyPlace[] };
  let places = parseOverpass(await res.json(), at.lat, at.lon);
  if (opts.kinds?.length) places = places.filter((p) => opts.kinds!.includes(p.kind));
  if (opts.cuisine) {
    const c = opts.cuisine.toLowerCase().split(/[\s,/]+/).filter((w) => w.length > 2);
    const hit = places.filter((p) => p.cuisine.some((pc) => c.some((w) => pc.toLowerCase().includes(w))));
    places = hit.length >= 3 ? hit : places; // fall back to all nearby if too few are tagged
  }
  return { origin: at, places: places.slice(0, opts.limit ?? 25) };
}

export const OSM_ATTRIBUTION = "© OpenStreetMap contributors";
