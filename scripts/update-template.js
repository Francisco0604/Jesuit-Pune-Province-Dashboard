const fs = require('fs');
const path = require('path');

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
    rawItems = [{ ...input, _source_file: input._source_file || filename }];
  }

  return rawItems.map(raw => {
    const name = raw.VILLAGE || raw.CLEAN_NAME || raw.name || raw.village_na || raw.NAME || raw.VillageName || raw.village_names || 'Unknown Center';
    let rawType = raw.type || raw.category;
    let cluster = raw.cluster || 'General';

    if (raw._source_file) {
      const fn = raw._source_file.toLowerCase().replace(/\.(json|geojson)$/, '');
      const parts = fn.split('_');
      if (parts.length >= 2) {
        const fileType = parts[0];
        let fileCluster = parts.slice(1).join('_').replace(/_\d+$/, '');
        if (!rawType) {
          if (fileType.includes('nfe')) rawType = 'NFE Centres';
          else if (fileType.includes('social')) rawType = 'Social Justice';
          else if (fileType.includes('parish')) rawType = 'Parish';
          else if (fileType.includes('tdss')) rawType = 'TDSS';
        }
        cluster = fileCluster.charAt(0).toUpperCase() + fileCluster.slice(1);
      } else {
        if (!rawType) {
          if (fn.includes('nfe')) rawType = 'NFE Centres';
          else if (fn.includes('social')) rawType = 'Social Justice';
          else if (fn.includes('parish')) rawType = 'Parish';
          else if (fn.includes('tdss')) rawType = 'TDSS';
        }
      }
    }

    if (!rawType) rawType = 'Parish';
    const type = rawType;

    let district = raw.DISTRICT || raw.district || raw.district_n || raw.district_4 || cluster || '';
    if (district.toUpperCase() === 'AHAMADNAGAR') district = 'AHILYANAGAR';
    
    let tehsil = raw.TEHSIL || raw.tehsil || raw.taluka_nam || '';
    if (tehsil.toUpperCase() === 'SANGAMMER') tehsil = 'SANGAMNER';

    return {
      name,
      type,
      cluster,
      families: parseInt(raw.families || raw.Family || raw.family || '0'),
      individuals: parseInt(raw.individuals || raw.Individual || raw.individual || '0'),
      catechists_count: parseInt(raw.catechists_count || raw.Catechists || raw.catechists_of_project || '0'),
      established_year: parseInt(raw.established_year || raw.year || '0'),
      district,
      tehsil,
      description: raw.description || raw.history || ''
    };
  }).filter(c => c !== null);
}

try {
  // 1. Load GeoJSON uploads
  const uploadDir = path.join(__dirname, '..', 'public', 'data', 'uploads');
  let rawCenters = [];
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.geojson') || f.endsWith('.json'));
    let allFeatures = [];
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
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
    }
    rawCenters = processData({ type: 'FeatureCollection', features: allFeatures });
  }

  // 2. Load detailed profiles
  const baseDir = path.join(__dirname, '..', 'public', 'data', 'Village_details');
  const detailedProfilesMap = new Map();
  if (fs.existsSync(baseDir)) {
    const traverse = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
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
      }
    };
    traverse(baseDir);
  }

  // 3. Merge profiles
  const merged = rawCenters.map(center => {
    const key = `${center.name.trim().toLowerCase()}_${center.type.trim().toLowerCase()}`;
    const detail = detailedProfilesMap.get(key);
    if (detail) {
      return {
        ...center,
        ...detail
      };
    }
    return center;
  });

  // Add remaining detail profiles
  detailedProfilesMap.forEach((detail, key) => {
    const exists = merged.some(v => `${v.name.trim().toLowerCase()}_${v.type.trim().toLowerCase()}` === key);
    if (!exists) {
      merged.push(detail);
    }
  });

  // 4. Generate CSV
  const headers = [
    'VILLAGE',
    'type',
    'cluster',
    'families',
    'individuals',
    'catechists_count',
    'established_year',
    'tehsil',
    'description'
  ];

  const escapeField = (val) => {
    if (val === undefined || val === null) return '';
    const str = String(val).trim();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = merged.map(v => [
    escapeField(v.name),
    escapeField(v.type),
    escapeField(v.cluster),
    escapeField(v.families),
    escapeField(v.individuals),
    escapeField(v.catechists_count),
    escapeField(v.established_year),
    escapeField(v.tehsil),
    escapeField(v.description)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const destPath = path.join(__dirname, '..', 'public', 'data', 'village_import_template.csv');
  fs.writeFileSync(destPath, csvContent, 'utf-8');
  console.log(`Successfully wrote ${merged.length} rows to ${destPath}`);
} catch (error) {
  console.error('Error executing update template:', error);
  process.exit(1);
}
