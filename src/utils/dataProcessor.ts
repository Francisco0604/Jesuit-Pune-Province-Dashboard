import { Center, CenterType, RawData, GeoJSONFeature, GeoJSONFeatureCollection } from '../types';

/**
 * DataProcessor Utility
 * Handles normalization of JSON, GeoJSON, and QGIS-exported formats.
 */

export const normalizeCenter = (raw: RawData): Center | null => {
  try {
    // 1. Extract Name (Prioritize specific fields to avoid duplicates in sample.geojson)
    const name = raw.VILLAGE || raw.CLEAN_NAME || raw.name || raw.village_na || raw.NAME || raw.VillageName || raw.village_names || 'Unknown Center';

    // 2. Extract Type and Cluster
    let rawType = raw.type || raw.category;
    let cluster = raw.cluster || 'General';
    
    // Auto-detect type and cluster from filename if not explicitly set
    if (raw._source_file) {
      const filename = raw._source_file.toLowerCase().replace(/\.(json|geojson)$/, '');
      const parts = filename.split('_');
      
      // If filename is "category_clustername"
      if (parts.length >= 2) {
        const fileType = parts[0];
        let fileCluster = parts.slice(1).join('_'); // Everything after the first underscore
        
        // Strip numeric suffixes like _1, _2, etc. for merging
        fileCluster = fileCluster.replace(/_\d+$/, '');
        
        if (!rawType) {
          if (fileType.includes('nfe')) rawType = 'NFE Centres';
          else if (fileType.includes('social')) rawType = 'Social Justice';
          else if (fileType.includes('parish')) rawType = 'Parish';
          else if (fileType.includes('tdss')) rawType = 'TDSS';
        }
        
        cluster = fileCluster.charAt(0).toUpperCase() + fileCluster.slice(1);
      } else {
        // Fallback for single-word filenames
        if (!rawType) {
          if (filename.includes('nfe')) rawType = 'NFE Centres';
          else if (filename.includes('social')) rawType = 'Social Justice';
          else if (filename.includes('parish')) rawType = 'Parish';
          else if (filename.includes('tdss')) rawType = 'TDSS';
        }
      }
    }

    if (!rawType) rawType = 'Parish'; // Default

    const typeMapping: Record<string, CenterType> = {
      'Parish': 'Parish',
      'NFE Centres': 'NFE Centres',
      'Social Justice': 'Social Justice',
      'TDSS': 'TDSS'
    };
    const type: CenterType = typeMapping[rawType] || 'Parish';

    // Special Case: Normalize names
    let district = raw.DISTRICT || raw.district || raw.district_n || raw.district_4 || cluster || '';
    if (district.toUpperCase() === 'AHAMADNAGAR') district = 'AHILYANAGAR';
    
    let tehsil = raw.TEHSIL || raw.tehsil || raw.taluka_nam || '';
    if (tehsil.toUpperCase() === 'SANGAMMER') tehsil = 'SANGAMNER';

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
      cluster,
      lat: lat || 0,
      lng: lng || 0,
      families: parseInt(raw.families || raw.Family || raw.family || '0'),
      individuals: parseInt(raw.individuals || raw.Individual || raw.individual || '0'),
      catechists_count: parseInt(raw.catechists_count || raw.Catechists || raw.catechists_of_project || '0'),
      description: raw.description || raw.history || '',
      established_year: parseInt(raw.established_year || raw.year || '0'),
      district,
      tehsil,
      last_verified: raw.last_verified || new Date().toISOString(),
      geometry: raw.geometry
    };
  } catch (error) {
    console.error('Normalization error:', error);
    return null;
  }
};

export const parseCSV = (csvText: string): RawData[] => {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = parseLine(line);
      const obj: RawData = { isCsvOnly: true };
      headers.forEach((header, i) => {
        obj[header] = values[i];
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

export const processData = (input: GeoJSONFeatureCollection | RawData[] | RawData | null, filename?: string): Center[] => {
  if (!input) return [];

  let rawItems: RawData[] = [];

  // Handle GeoJSON FeatureCollection
  if (typeof input === 'object' && 'type' in input && input.type === 'FeatureCollection' && Array.isArray(input.features)) {
    rawItems = input.features.map((f: GeoJSONFeature) => ({
      ...f.properties,
      geometry: f.geometry,
      _source_file: f.properties._source_file || filename // Use existing or provided filename
    }));
  } 
  // Handle Array of objects
  else if (Array.isArray(input)) {
    rawItems = input.map((item: RawData) => ({
      ...item,
      _source_file: item._source_file || filename
    }));
  } 
  // Handle single object
  else if (typeof input === 'object' && input !== null) {
    const item = input as RawData;
    rawItems = [{
      ...item,
      _source_file: item._source_file || filename
    }];
  }

  return rawItems
    .map(normalizeCenter)
    .filter((center): center is Center => center !== null);
};
