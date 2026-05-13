# Jesuit Pune Province Activity Map - Handover Documentation

## 🚀 Getting Started

To get the website running locally, follow these steps:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Supabase Configuration:**
   - Create a project on [Supabase](https://supabase.com/).
   - Run the following SQL in the Supabase SQL Editor to create the `centers` table:
   ```sql
   create table centers (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     type text check (type in ('Parish', 'Education', 'Social Justice', 'TDSS')),
     lat decimal not null,
     lng decimal not null,
     families int default 0,
     individuals int default 0,
     catechists_count int default 0,
     description text,
     established_year int,
     district text,
     last_verified timestamp with time zone default now(),
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );

   -- Enable RLS
   alter table centers enable row level security;

   -- Public Read Policy
   create policy "Public centers are viewable by everyone." on centers
     for select using (true);

   -- Authenticated Write Policy (Simplified for setup)
   create policy "Authenticated users can modify centers." on centers
     for all using (auth.role() = 'authenticated');
   ```

3. **Environment Variables:**
   - Create a `.env.local` file in the root directory.
   - Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🛠 Features Implemented

- **Interactive Map:** Built with Next.js 15, React-Leaflet, and custom marker icons.
- **Ecclesiastical Theme:** A "Jesuit Modern" aesthetic with parchment background, charcoal text, and gold accents.
- **Data Normalization:** A robust `DataProcessor` utility that handles JSON, GeoJSON, and QGIS formats.
- **Searchable Sidebar:** Floating glassmorphism sidebar for quick navigation and filtering by category.
- **Detail Drawer:** Comprehensive view for center statistics and history, with mobile-first responsiveness.
- **Admin Dashboard:** Initial implementation of `/admin` route for data management and CSV/JSON imports.
- **Performance:** Lazy loading of the map component and optimized markers with React.memo.

## 📂 Data Sources & Location

### Sample GeoJSON
The primary data source for the map is `sample.geojson`. This file provides the hierarchical structure (District > Tehsil > Village) seen in the sidebar.

- **Location:** `public/data/sample.geojson`
- **Role:** If Supabase is not configured, the website automatically loads this file to populate the map and sidebar.
- **Customization:** You can replace this file with your own GeoJSON, ensuring it contains properties like `DISTRICT`, `TEHSIL`, and `VILLAGE`.

### PDF Extracted Data
The 40+ village records extracted from your PDF are stored in:
- **Location:** `public/data/sangamner_parish.json`
- **Usage:** This file can be imported via the **Admin Dashboard** (`/admin`) once your Supabase database is connected.

## ⛪ Jesuit Data Ethics & Standards

- **Historical Integrity:** All records include verification timestamps.
- **Accessibility:** High contrast ratios (WCAG AA) and mobile-responsive layouts.
- **Separation of Concerns:** Clean architecture separating data logic from UI.

*Ad Maiorem Dei Gloriam*
