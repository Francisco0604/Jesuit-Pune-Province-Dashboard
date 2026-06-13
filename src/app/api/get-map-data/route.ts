import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

import { GeoJSONFeature } from '@/types';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'data', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ features: [] });
    }

    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.geojson') || f.endsWith('.json'));
    
    let allFeatures: GeoJSONFeature[] = [];

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const features: GeoJSONFeature[] = content.type === 'FeatureCollection' ? content.features : [content];
      
      const featuresWithSource = features.map((f: GeoJSONFeature) => ({
        ...f,
        properties: {
          ...f.properties,
          _source_file: file // Inject filename for automatic categorization
        }
      }));

      allFeatures = [...allFeatures, ...featuresWithSource];
    }

    return NextResponse.json({
      type: 'FeatureCollection',
      features: allFeatures
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
