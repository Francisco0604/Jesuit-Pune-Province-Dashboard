import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, type, cluster, ...rest } = data;

    if (!name || !type) {
      return NextResponse.json({ error: 'Missing name or type' }, { status: 400 });
    }

    // Normalize folder name (NFE_Centres, Parish, Social_Justice, TDSS)
    const folderMap: Record<string, string> = {
      'Parish': 'Parish',
      'NFE Centres': 'NFE_Centres',
      'Social Justice': 'Social_Justice',
      'TDSS': 'TDSS'
    };

    const sectionFolder = folderMap[type] || 'Parish';
    const clusterFolder = (cluster || 'General').replace(/[^a-z0-9]/gi, '_');
    
    // New path: public/data/Village_details/[Category]/[ClusterName]/[VillageName].json
    const targetDir = path.join(process.cwd(), 'public', 'data', 'Village_details', sectionFolder, clusterFolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileName = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const filePath = path.join(targetDir, fileName);

    // Default template for village data
    const jsonData = {
      name: name,
      type: type,
      cluster: cluster || 'General',
      district: rest.district || '',
      tehsil: rest.tehsil || '',
      lat: rest.lat || 0,
      lng: rest.lng || 0,
      families: rest.families || 0,
      individuals: rest.individuals || 0,
      catechists_count: rest.catechists_count || 0,
      established_year: rest.established_year || 0,
      description: rest.description || '',
      last_verified: rest.last_verified || new Date().toISOString(),
      last_updated: new Date().toISOString(),
      geometry: rest.geometry || null,
      metadata: {
        source: rest.source || 'upload',
        ...rest.metadata
      }
    };

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

    return NextResponse.json({ 
      success: true, 
      path: `/data/Village_details/${sectionFolder}/${clusterFolder}/${fileName}` 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving village JSON:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
