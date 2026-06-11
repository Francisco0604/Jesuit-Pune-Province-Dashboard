export type CenterType = 'Parish' | 'NFE Centres' | 'Social Justice' | 'TDSS';

export interface Center {
  id: string;
  name: string;
  type: CenterType;
  cluster?: string; // New field for grouping
  lat: number;
  lng: number;
  families?: number;
  individuals?: number;
  catechists_count?: number;
  description?: string;
  established_year?: number;
  district?: string;
  tehsil?: string;
  last_verified?: string; // ISO string
  geometry?: any; // For GeoJSON boundaries
}

export interface RawData {
  [key: string]: any;
}
