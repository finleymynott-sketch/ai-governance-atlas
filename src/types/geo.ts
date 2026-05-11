import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * GeoJSON / TopoJSON types for the world-110m map.
 *
 * Natural Earth's 110m TopoJSON keys features by ISO 3166-1 numeric code
 * (zero-padded three digits). The Atlas's data is keyed by alpha-3, so the
 * map renderer translates numeric → alpha-3 via ISO_NUMERIC_TO_ALPHA3.
 */

export interface TopoJSONTopology {
  type: 'Topology';
  objects: {
    countries: TopoJSONGeometryCollection;
  };
  arcs: number[][][];
  bbox?: number[];
  transform?: {
    scale: [number, number];
    translate: [number, number];
  };
}

export interface TopoJSONGeometryCollection {
  type: 'GeometryCollection';
  geometries: TopoJSONGeometry[];
}

export interface TopoJSONGeometry {
  type: string;
  id?: string | number;
  properties?: Record<string, unknown>;
  arcs?: number[][] | number[][][];
}

export interface CountryFeature extends Feature<Geometry> {
  id: string;
  properties: {
    name: string;
  };
}

export type CountryFeatureCollection = FeatureCollection<Geometry, { name: string }>;

/**
 * ISO 3166-1 numeric → alpha-3. Covers every country in the dissertation
 * sample plus a few extras that exist on the map but aren't scored, so they
 * render as "no data" rather than going blank.
 */
export const ISO_NUMERIC_TO_ALPHA3: Record<string, string> = {
  '004': 'AFG',
  '008': 'ALB',
  '032': 'ARG',
  '036': 'AUS',
  '040': 'AUT',
  '050': 'BGD',
  '056': 'BEL',
  '076': 'BRA',
  '100': 'BGR',
  '124': 'CAN',
  '152': 'CHL',
  '156': 'CHN',
  '158': 'TWN',
  '170': 'COL',
  '191': 'HRV',
  '203': 'CZE',
  '208': 'DNK',
  '218': 'ECU',
  '231': 'ETH',
  '246': 'FIN',
  '250': 'FRA',
  '268': 'GEO',
  '276': 'DEU',
  '288': 'GHA',
  '300': 'GRC',
  '348': 'HUN',
  '352': 'ISL',
  '356': 'IND',
  '360': 'IDN',
  '364': 'IRN',
  '368': 'IRQ',
  '372': 'IRL',
  '376': 'ISR',
  '380': 'ITA',
  '388': 'JAM',
  '392': 'JPN',
  '398': 'KAZ',
  '404': 'KEN',
  '410': 'KOR',
  '414': 'KWT',
  '422': 'LBN',
  '428': 'LVA',
  '440': 'LTU',
  '442': 'LUX',
  '458': 'MYS',
  '484': 'MEX',
  '498': 'MDA',
  '504': 'MAR',
  '528': 'NLD',
  '554': 'NZL',
  '566': 'NGA',
  '578': 'NOR',
  '586': 'PAK',
  '604': 'PER',
  '608': 'PHL',
  '616': 'POL',
  '620': 'PRT',
  '630': 'PRI',
  '634': 'QAT',
  '642': 'ROU',
  '643': 'RUS',
  '646': 'RWA',
  '682': 'SAU',
  '688': 'SRB',
  '702': 'SGP',
  '703': 'SVK',
  '705': 'SVN',
  '710': 'ZAF',
  '724': 'ESP',
  '752': 'SWE',
  '756': 'CHE',
  '764': 'THA',
  '784': 'ARE',
  '792': 'TUR',
  '804': 'UKR',
  '818': 'EGY',
  '826': 'GBR',
  '840': 'USA',
  '858': 'URY',
  '862': 'VEN',
  '887': 'YEM',
  '894': 'ZMB',
  '704': 'VNM',
};

/**
 * Centroids (lon, lat) for sample units without a polygon in Natural Earth
 * world-110m. EU is supranational; Singapore is a city-state too small for the
 * 110m simplification. Both are rendered as overlay markers on the map.
 */
export const EU_CENTROID: [number, number] = [4.3517, 50.8503];
export const SGP_CENTROID: [number, number] = [103.8198, 1.3521];

export const MISSING_POLYGON_UNITS: { id: string; centroid: [number, number] }[] = [
  { id: 'SGP', centroid: SGP_CENTROID },
  { id: 'EU', centroid: EU_CENTROID },
];
