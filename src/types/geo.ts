import type { Feature, FeatureCollection, Geometry } from 'geojson';

/**
 * GeoJSON and TopoJSON types for map rendering
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

/** ISO numeric to alpha-3 code mapping for common countries */
export const ISO_NUMERIC_TO_ALPHA3: Record<string, string> = {
  '840': 'USA',
  '156': 'CHN',
  '826': 'GBR',
  '276': 'DEU',
  '250': 'FRA',
  '392': 'JPN',
  '410': 'KOR',
  '124': 'CAN',
  '036': 'AUS',
  '356': 'IND',
  '076': 'BRA',
  '528': 'NLD',
  '752': 'SWE',
  '578': 'NOR',
  '208': 'DNK',
  '246': 'FIN',
  '756': 'CHE',
  '702': 'SGP',
  '376': 'ISR',
  '784': 'ARE',
  '682': 'SAU',
  '372': 'IRL',
  '724': 'ESP',
  '380': 'ITA',
  '616': 'POL',
  '643': 'RUS',
  '484': 'MEX',
  '360': 'IDN',
  '792': 'TUR',
  '710': 'ZAF',
  '554': 'NZL',
  '158': 'TWN',
  '704': 'VNM',
  '764': 'THA',
  '458': 'MYS',
};

