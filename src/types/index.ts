export type CenterType = 'Parish' | 'NFE Centres' | 'Social Justice' | 'TDSS';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  properties: {
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface Center {
  id: string;
  name: string;
  type: CenterType;
  cluster?: string;
  lat: number;
  lng: number;
  families?: number;
  individuals?: number;
  catechists_count?: number;
  description?: string;
  established_year?: number;
  district?: string;
  tehsil?: string;
  last_verified?: string;
  geometry?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface RawData {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  _source_file?: string;
  isCsvOnly?: boolean;
}
