export interface NearbyPlace {
    id: string;
    name: string;
    kind: string;
    cuisine: string[];
    website?: string;
    lat: number;
    lon: number;
    distanceM: number;
    address?: string;
}
export declare function geocode(query: string): Promise<{
    lat: number;
    lon: number;
    label: string;
} | null>;
export declare function overpassQuery(lat: number, lon: number, radiusM: number): string;
export declare function haversine(aLat: number, aLon: number, bLat: number, bLon: number): number;
export declare function parseOverpass(json: any, lat: number, lon: number): NearbyPlace[];
/** Similar places near an address. `cuisine` filters loosely (e.g. "indian"). */
export declare function nearbyCompetitors(address: string, opts?: {
    radiusM?: number;
    cuisine?: string;
    kinds?: string[];
    limit?: number;
}): Promise<{
    origin: null;
    places: NearbyPlace[];
} | {
    origin: {
        lat: number;
        lon: number;
        label: string;
    };
    places: NearbyPlace[];
}>;
export declare const OSM_ATTRIBUTION = "\u00A9 OpenStreetMap contributors";
