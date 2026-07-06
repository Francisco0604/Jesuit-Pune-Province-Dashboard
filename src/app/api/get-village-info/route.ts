import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const type = searchParams.get('type') || 'Parish';

    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const folderMap: Record<string, string> = {
      'Parish': 'Parish',
      'NFE Centres': 'NFE_Centres',
      'Social Justice': 'Social_Justice',
      'TDSS': 'TDSS'
    };

    const sectionFolder = folderMap[type] || 'Parish';
    const fileName = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;

    // 1. Try with cluster parameter if provided
    const cluster = searchParams.get('cluster');
    if (cluster) {
      const clusterFolder = cluster.replace(/[^a-z0-9]/gi, '_');
      const filePath = path.join(process.cwd(), 'public', 'data', 'Village_details', sectionFolder, clusterFolder, fileName);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return NextResponse.json(data);
      }
    }

    // 2. Scan all subdirectories in public/data/Village_details/[Category]/
    const categoryDir = path.join(process.cwd(), 'public', 'data', 'Village_details', sectionFolder);
    if (fs.existsSync(categoryDir)) {
      const clusters = fs.readdirSync(categoryDir).filter(f => {
        try {
          return fs.statSync(path.join(categoryDir, f)).isDirectory();
        } catch {
          return false;
        }
      });
      for (const cFolder of clusters) {
        const filePath = path.join(categoryDir, cFolder, fileName);
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          return NextResponse.json(data);
        }
      }
    }

    // Default template if file doesn't exist
    return NextResponse.json({
      name,
      type,
      description: 'No detailed information found for this village.',
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
