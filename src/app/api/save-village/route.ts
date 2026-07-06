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

    // Read existing file if it exists, to merge rather than overwrite
    let existingData: any = {};
    if (fs.existsSync(filePath)) {
      try {
        existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse existing village JSON:', e);
      }
    }

    // Default template for village data, merging with existing values
    const jsonData = {
      name: name,
      type: type,
      cluster: cluster || existingData.cluster || 'General',
      district: rest.district || existingData.district || '',
      tehsil: rest.tehsil || existingData.tehsil || '',
      lat: rest.lat || existingData.lat || 0,
      lng: rest.lng || existingData.lng || 0,
      families: rest.families !== undefined && rest.families !== 0 ? rest.families : (existingData.families || 0),
      individuals: rest.individuals !== undefined && rest.individuals !== 0 ? rest.individuals : (existingData.individuals || 0),
      catechists_count: rest.catechists_count !== undefined && rest.catechists_count !== 0 ? rest.catechists_count : (existingData.catechists_count || 0),
      established_year: rest.established_year !== undefined && rest.established_year !== 0 ? rest.established_year : (existingData.established_year || 0),
      description: rest.description || existingData.description || '',
      last_verified: rest.last_verified || existingData.last_verified || new Date().toISOString(),
      last_updated: new Date().toISOString(),
      geometry: rest.geometry || existingData.geometry || null,
      metadata: {
        source: rest.source || existingData.metadata?.source || 'upload',
        ...existingData.metadata,
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
