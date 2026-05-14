'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FilterSidebar from '@/components/FilterSidebar';
import CenterDrawer from '@/components/CenterDrawer';
import { Center } from '@/types';
import { processData, parseCSV, mergeData } from '@/utils/dataProcessor';
import { useQuery } from '@tanstack/react-query';
import { getCenters } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-parchment">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-gold mx-auto mb-4" />
        <p className="font-serif text-charcoal/60 italic">Loading Province Map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [rawGeoData, setRawGeoData] = useState<any>(null);
  const [districtsData, setDistrictsData] = useState<any>(null);

  const [isSampleMode, setIsSampleMode] = useState(false);

  // 1. Try to fetch from Supabase
  const { data: dbCenters, isLoading: isDbLoading, isError: isDbError } = useQuery({
    queryKey: ['centers'],
    queryFn: getCenters,
    retry: false, // Don't retry if keys are missing
  });

  // 2. Load sample data logic
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isDbError || !dbCenters || dbCenters.length === 0) {
          console.info('Attempting to load local sample data...');
          setIsSampleMode(true);
          
          // Load CSV data first or in parallel
          const [csvResponse, districtsResponse] = await Promise.all([
            fetch('/data/parish_data.csv'),
            fetch('/data/districts.geojson')
          ]);

          let csvData: any[] = [];
          if (csvResponse.ok) {
            const csvText = await csvResponse.text();
            csvData = parseCSV(csvText);
          }

          if (districtsResponse.ok) {
            const dData = await districtsResponse.json();
            setDistrictsData(dData);
          }

          // Try .geojson first, then .json
          let response = await fetch('/data/sample.geojson');
          if (!response.ok) {
            response = await fetch('/data/sample.json');
          }
          
          if (!response.ok) {
            throw new Error('No sample data file found (.geojson or .json)');
          }

          const rawData = await response.json();
          setRawGeoData(rawData);
          
          const processedGeoData = processData(rawData);
          const mergedData = mergeData(processedGeoData, csvData);
          setCenters(mergedData);
        } else {
          setCenters(dbCenters);
          setIsSampleMode(false);
        }
      } catch (error) {
        console.error('Data loading failed:', error);
      }
    };

    if (!isDbLoading) {
      loadData();
    }
  }, [dbCenters, isDbLoading, isDbError]);

  const handleCenterClick = (center: Center) => {
    setSelectedCenter(center);
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-parchment">
      {/* Sidebar */}
      <FilterSidebar 
        centers={centers} 
        onCenterClick={handleCenterClick}
        selectedCenterId={selectedCenter?.id || null}
      />

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <MapComponent 
          centers={centers} 
          onCenterClick={handleCenterClick}
          selectedCenter={selectedCenter}
          rawGeoData={rawGeoData}
          districtsData={districtsData}
        />
        
        {/* Floating Header */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
          <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-charcoal/10 shadow-lg text-center">
            <h2 className="text-sm font-serif font-bold text-charcoal tracking-wide">
              Jesuit Pune Province Activity Map
            </h2>
          </div>
          
          {isSampleMode && (
            <div className="bg-gold/10 backdrop-blur-sm px-3 py-1 rounded-full border border-gold/20 shadow-sm text-center">
              <p className="text-[10px] font-bold text-gold uppercase tracking-widest">
                Viewing Presentation Data (CSV Integrated)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      <CenterDrawer 
        center={selectedCenter} 
        onClose={() => setSelectedCenter(null)} 
      />
    </main>
  );
}
