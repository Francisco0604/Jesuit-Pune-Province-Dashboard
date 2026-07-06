# Jesuit Pune Province Map - Developer Instructions

This project is a Next.js application for visualizing Jesuit activities across the Pune Province. It uses Leaflet for mapping and handles dynamic data via GeoJSON and JSON files.

## 1. Adding New Data Clusters

### Method A: Filename-Based (Easiest)
Drop any `.geojson` or `.json` file into `public/data/uploads/`.
The system will automatically categorize all villages in the file based on the filename:
- Include `nfe` in the name -> **Purple (NFE Centres)**
- Include `social` in the name -> **Charcoal (Social Justice)**
- Include `tdss` in the name -> **Green (TDSS)**
- Default or include `parish` -> **Terracotta (Parish)**

### Method B: Admin Dashboard
1. Go to `/admin`.
2. Click **Import Data** and upload a CSV or GeoJSON.
3. The system will normalize the data and save individual JSON files into organized folders:
   - Path: `public/data/Village_details/[Category]/[ClusterName]/[VillageName].json`
   - Cluster Name is automatically extracted from the filename (e.g., `nfe_Sangamner.geojson` -> Cluster: `Sangamner`).

---

## 2. File Naming Convention
For automatic categorization and clustering, name your upload files as follows:
`[Category]_[ClusterName].geojson`

Examples:
- `nfe_Sangamner.geojson` -> Category: **NFE Centres**, Cluster: **Sangamner**
- `tdss_Beed.geojson` -> Category: **TDSS**, Cluster: **Beed**
- `parish_Ahmednagar.geojson` -> Category: **Parish**, Cluster: **Ahmednagar**

---

## 3. How to Add a New Category (e.g., "Health")

To add a new category, follow these 4 steps:

### Step 1: Update Types
In `src/types/index.ts`, add the new category to the `CenterType` union:
```typescript
export type CenterType = 'Parish' | 'NFE Centres' | 'Social Justice' | 'TDSS' | 'Health';
```

### Step 2: Set Map Color
In `src/components/MapComponent.tsx`, add the category and a HEX color to the `colorMap`:
```typescript
const colorMap: Record<string, string> = {
  // ... existing
  'Health': '#3498db', // Blue
};
```

### Step 3: Enable Auto-Detection
In `src/utils/dataProcessor.ts`, add a keyword check for filenames:
```typescript
else if (filename.includes('health')) rawType = 'Health';
```

### Step 4: Update API Folders
In `src/app/api/save-village/route.ts`, add the folder mapping:
```typescript
const folderMap: Record<string, string> = {
  // ... existing
  'Health': 'Health'
};
```

---

## 3. Data Schema
Villages are normalized using `src/utils/dataProcessor.ts`. The system looks for these fields in your raw data:
- **Name:** `VILLAGE`, `NAME`, or `village_na`.
- **Location:** `lat`/`lng` coordinates or GeoJSON `geometry` (polygons/points).
- **Metadata:** `district`, `tehsil`, `families`, `individuals`.

## 4. Running the Project
- Development: `npm run dev`
- Build: `npm run build`
- Port: `http://localhost:3000`

---

## 5. Team Roles & Workflow
- **Jaunita**: Information Manager. Responsible for gathering, verifying, and importing village statistics (Families, Students, Active Teachers, descriptions) via the Excel/CSV importer.
- **Juhi**: GIS Specialist. Responsible for generating, mapping, and uploading all GeoJSON boundary/point coordinate files into `public/data/uploads`.
- **Francisco**: Web Developer. Responsible for Next.js website maintenance, API logic, UI improvements, authentication/security setup, and hosting deployments.
