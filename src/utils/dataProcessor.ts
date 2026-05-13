import { Center, CenterType, RawData } from '../types';

/**
 * DataProcessor Utility
 * Handles normalization of JSON, GeoJSON, and QGIS-exported formats.
 */

export const normalizeCenter = (raw: RawData): Center | null => {
  try {
    // 1. Extract Name (Prioritize specific fields to avoid duplicates in sample.geojson)
    const name = raw.Sangammer_ || raw.VILLAGE || raw.CLEAN_NAME || raw.name || raw.village_na || raw.NAME || raw.VillageName || raw.village_names || 'Unknown Center';

    // 2. Extract Type
    const rawType = raw.type || raw.category || 'Parish';
    const typeMapping: Record<string, CenterType> = {
      'Parish': 'Parish',
      'Education': 'Education',
      'Social Justice': 'Social Justice',
      'TDSS': 'TDSS'
    };
    const type: CenterType = typeMapping[rawType] || 'Parish';

    // 3. Extract Coordinates
    let lat: number | undefined;
    let lng: number | undefined;

    // Check for direct lat/lng fields
    const latField = raw.lat || raw.latitude || raw.LAT || raw.Y;
    const lngField = raw.lng || raw.longitude || raw.LNG || raw.X;

    if (latField && lngField) {
      lat = parseFloat(latField);
      lng = parseFloat(lngField);
    } 
    // Check for GeoJSON geometry
    else if (raw.geometry) {
      if (raw.geometry.type === 'Point') {
        [lng, lat] = raw.geometry.coordinates;
      } else if (raw.geometry.type === 'Polygon' || raw.geometry.type === 'MultiPolygon') {
        // Simplified centroid calculation for polygons
        const coords = raw.geometry.type === 'Polygon' 
          ? raw.geometry.coordinates[0] 
          : raw.geometry.coordinates[0][0];
        
        let sumLat = 0, sumLng = 0;
        coords.forEach((c: number[]) => {
          sumLng += c[0];
          sumLat += c[1];
        });
        lat = sumLat / coords.length;
        lng = sumLng / coords.length;
      }
    }

    // 4. CRS Handling / Validation
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      // If it's CSV data without coords, it will be merged later, so we might return it without coords
      // but the Center type requires them. For now, let's keep the warning.
      if (!raw.isCsvOnly) {
        console.warn(`Missing or invalid coordinates for: ${name}`);
        return null;
      }
    }

    return {
      id: raw.id || crypto.randomUUID(),
      name,
      type,
      lat: lat || 0,
      lng: lng || 0,
      families: parseInt(raw.families || raw.Family || raw.family || '0'),
      individuals: parseInt(raw.individuals || raw.Individual || raw.individual || '0'),
      catechists_count: parseInt(raw.catechists_count || raw.Catechists || raw.catechists_of_project || '0'),
      description: raw.description || raw.history || '',
      established_year: parseInt(raw.established_year || raw.year || '0'),
      district: raw.DISTRICT || raw.district || '',
      tehsil: raw.TEHSIL || raw.tehsil || '',
      last_verified: raw.last_verified || new Date().toISOString()
    };
  } catch (error) {
    console.error('Normalization error:', error);
    return null;
  }
};

export const parseCSV = (csvText: string): RawData[] => {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      const obj: RawData = { isCsvOnly: true };
      headers.forEach((header, i) => {
        obj[header] = values[i]?.trim();
      });
      return obj;
    });
};

export const mergeData = (geoData: Center[], csvData: RawData[]): Center[] => {
  return geoData.map(center => {
    // Try to find matching CSV data by name (fuzzy match)
    const match = csvData.find(d => {
      const csvName = d.village_names?.toLowerCase() || '';
      const centerName = center.name.toLowerCase();
      return csvName.includes(centerName) || centerName.includes(csvName);
    });

    if (match) {
      return {
        ...center,
        families: parseInt(match.family || '0') || center.families,
        individuals: parseInt(match.individual || '0') || center.individuals,
        catechists_count: parseInt(match.catechists_of_project || '0') || center.catechists_count,
      };
    }
    return center;
  });
};

export const processData = (input: any): Center[] => {
  if (!input) return [];

  let rawItems: RawData[] = [];

  // Handle GeoJSON FeatureCollection
  if (input.type === 'FeatureCollection' && Array.isArray(input.features)) {
    rawItems = input.features.map((f: any) => ({
      ...f.properties,
      geometry: f.geometry
    }));
  } 
  // Handle Array of objects
  else if (Array.isArray(input)) {
    rawItems = input;
  } 
  // Handle single object
  else if (typeof input === 'object') {
    rawItems = [input];
  }

  return rawItems
    .map(normalizeCenter)
    .filter((center): center is Center => center !== null);
};
