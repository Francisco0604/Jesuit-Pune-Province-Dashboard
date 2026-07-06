import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GeoJSONFeature } from '@/types';
import { processData } from '@/utils/dataProcessor';

export async function GET() {
  try {
    // 1. Get all villages from uploads (GeoJSON files)
    const uploadDir = path.join(process.cwd(), 'public', 'data', 'uploads');
    let rawCenters: any[] = [];
    
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.geojson') || f.endsWith('.json'));
      let allFeatures: GeoJSONFeature[] = [];

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          const features: GeoJSONFeature[] = content.type === 'FeatureCollection' ? content.features : [content];
          const featuresWithSource = features.map((f: GeoJSONFeature) => ({
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

      // Convert GeoJSON features into normalized Center structures
      rawCenters = processData({
        type: 'FeatureCollection',
        features: allFeatures
      } as any);
    }

    // 2. Get all detailed profiles from Village_details
    const baseDir = path.join(process.cwd(), 'public', 'data', 'Village_details');
    const detailedProfilesMap = new Map<string, any>();

    if (fs.existsSync(baseDir)) {
      const traverse = (dir: string) => {
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

    // 3. Merge profiles
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

    // 4. Also add any detailed profiles that might not have been in the GeoJSON uploads
    detailedProfilesMap.forEach((detail, key) => {
      const exists = mergedVillages.some(v => `${v.name.trim().toLowerCase()}_${v.type.trim().toLowerCase()}` === key);
      if (!exists) {
        mergedVillages.push(detail);
      }
    });

    return NextResponse.json(mergedVillages);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
