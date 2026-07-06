const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function normalizeCenter(raw) {
  try {
    const name = raw.VILLAGE || raw.CLEAN_NAME || raw.name || raw.village_na || raw.NAME || raw.VillageName || raw.village_names || 'Unknown Center';
    let rawType = raw.type || raw.category;
    let cluster = raw.cluster || 'General';

    if (raw._source_file) {
      const filename = raw._source_file.toLowerCase().replace(/\.(json|geojson)$/, '');
      const parts = filename.split('_');
      if (parts.length >= 2) {
        const fileType = parts[0];
        let fileCluster = parts.slice(1).join('_').replace(/_\d+$/, '');
        fileCluster = fileCluster.replace(/_\d+$/, '');
        
        if (!rawType) {
          if (fileType.includes('nfe')) rawType = 'NFE Centres';
          else if (fileType.includes('social')) rawType = 'Social Justice';
          else if (fileType.includes('parish')) rawType = 'Parish';
          else if (fileType.includes('tdss')) rawType = 'TDSS';
        }
        cluster = fileCluster.charAt(0).toUpperCase() + fileCluster.slice(1);
      } else {
        if (!rawType) {
          if (filename.includes('nfe')) rawType = 'NFE Centres';
          else if (filename.includes('social')) rawType = 'Social Justice';
          else if (filename.includes('parish')) rawType = 'Parish';
          else if (filename.includes('tdss')) rawType = 'TDSS';
        }
      }
    }

    if (!rawType) rawType = 'Parish';
    const type = rawType;

    let district = raw.DISTRICT || raw.district || raw.district_n || raw.district_4 || cluster || '';
    if (district.toUpperCase() === 'AHAMADNAGAR') district = 'AHILYANAGAR';
    
    let tehsil = raw.TEHSIL || raw.tehsil || raw.taluka_nam || '';
    if (tehsil.toUpperCase() === 'SANGAMMER') tehsil = 'SANGAMNER';

    let lat, lng;
    const latField = raw.lat || raw.latitude || raw.LAT || raw.Y;
    const lngField = raw.lng || raw.longitude || raw.LNG || raw.X;

    if (latField && lngField) {
      lat = parseFloat(latField);
      lng = parseFloat(lngField);
    } else if (raw.geometry) {
      if (raw.geometry.type === 'Point') {
        [lng, lat] = raw.geometry.coordinates;
      } else if (raw.geometry.type === 'Polygon' || raw.geometry.type === 'MultiPolygon') {
        const coords = raw.geometry.type === 'Polygon' 
          ? raw.geometry.coordinates[0] 
          : raw.geometry.coordinates[0][0];
        let sumLat = 0, sumLng = 0;
        coords.forEach(c => {
          sumLng += c[0];
          sumLat += c[1];
        });
        lat = sumLat / coords.length;
        lng = sumLng / coords.length;
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
}

function processData(input, filename) {
  if (!input) return [];
  let rawItems = [];
  if (typeof input === 'object' && input.type === 'FeatureCollection' && Array.isArray(input.features)) {
    rawItems = input.features.map(f => ({
      ...f.properties,
      geometry: f.geometry,
      _source_file: f.properties._source_file || filename
    }));
  } else if (Array.isArray(input)) {
    rawItems = input.map(item => ({
      ...item,
      _source_file: item._source_file || filename
    }));
  } else if (typeof input === 'object' && input !== null) {
    rawItems = [{
      ...input,
      _source_file: input._source_file || filename
    }];
  }
  return rawItems
    .map(normalizeCenter)
    .filter(center => center !== null);
}

function run() {
  console.log('Running Next.js Pages static export data compiler...');
  
  const uploadDir = path.join(__dirname, '..', 'public', 'data', 'uploads');
  const baseDir = path.join(__dirname, '..', 'public', 'data', 'Village_details');
  const outputMapDataFile = path.join(__dirname, '..', 'public', 'data', 'get-map-data.json');
  const outputAllVillagesFile = path.join(__dirname, '..', 'public', 'data', 'get-all-villages.json');

  let allFeatures = [];
  let rawCenters = [];

  // 1. Build Map Data JSON (corresponds to /api/get-map-data)
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.geojson') || f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const features = content.type === 'FeatureCollection' ? content.features : [content];
        
        const featuresWithSource = features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            _source_file: file
          }
        }));

        allFeatures = [...allFeatures, ...featuresWithSource];
      } catch (e) {
        console.error(`Failed to read upload file ${file}:`, e);
      }
    }
  }

  const mapData = {
    type: 'FeatureCollection',
    features: allFeatures
  };

  fs.writeFileSync(outputMapDataFile, JSON.stringify(mapData, null, 2));
  console.log(`Successfully compiled map data features to ${outputMapDataFile}`);

  // 2. Build All Villages JSON (corresponds to /api/get-all-villages)
  rawCenters = processData(mapData);

  const detailedProfilesMap = new Map();

  if (fs.existsSync(baseDir)) {
    const traverse = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            traverse(fullPath);
          } else if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            if (data.name && data.type) {
              const key = `${data.name.trim().toLowerCase()}_${data.type.trim().toLowerCase()}`;
              detailedProfilesMap.set(key, data);
            }
          }
        } catch (e) {
          console.error(`Failed to read detail profile ${fullPath}:`, e);
        }
      }
    };
    traverse(baseDir);
  }

  const mergedVillages = rawCenters.map(center => {
    const key = `${center.name.trim().toLowerCase()}_${center.type.trim().toLowerCase()}`;
    const detail = detailedProfilesMap.get(key);
    if (detail) {
      return {
        ...center,
        ...detail,
        lat: detail.lat || center.lat || 0,
        lng: detail.lng || center.lng || 0,
        geometry: detail.geometry || center.geometry || null
      };
    }
    return center;
  });

  detailedProfilesMap.forEach((detail, key) => {
    const exists = mergedVillages.some(v => `${v.name.trim().toLowerCase()}_${v.type.trim().toLowerCase()}` === key);
    if (!exists) {
      mergedVillages.push(detail);
    }
  });

  fs.writeFileSync(outputAllVillagesFile, JSON.stringify(mergedVillages, null, 2));
  console.log(`Successfully compiled all merged village records to ${outputAllVillagesFile}`);
}

run();
