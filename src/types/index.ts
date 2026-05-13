export type CenterType = 'Parish' | 'Education' | 'Social Justice' | 'TDSS';

export interface Center {
  id: string;
  name: string;
  type: CenterType;
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
}

export interface RawData {
  [key: string]: any;
}
