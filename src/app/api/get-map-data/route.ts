import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'data', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      return NextResponse.json({ features: [] });
    }

    const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.geojson') || f.endsWith('.json'));
    
    let allFeatures: any[] = [];

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      const features = content.type === 'FeatureCollection' ? content.features : [content];
      
      const featuresWithSource = features.map((f: any) => ({
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
