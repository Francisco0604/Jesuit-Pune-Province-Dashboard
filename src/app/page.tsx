'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FilterSidebar from '@/components/FilterSidebar';
import CenterDrawer from '@/components/CenterDrawer';
import { Center } from '@/types';
import { processData, parseCSV, mergeData } from '@/utils/dataProcessor';
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
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [rawGeoData, setRawGeoData] = useState<any>(null);
  const [districtsData, setDistrictsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data logic from dynamic API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load Districts (Static)
        const districtsResponse = await fetch('/data/districts.geojson');
        if (districtsResponse.ok) {
          const dData = await districtsResponse.json();
          setDistrictsData(dData);
        }

        // Load Dynamic Map Data from /data/uploads
        const mapResponse = await fetch('/api/get-map-data');
        if (mapResponse.ok) {
          const rawData = await mapResponse.json();
          setRawGeoData(rawData);
          
          const processed = processData(rawData);
          setCenters(processed);
          setFilteredCenters(processed); // Initialize filtered centers
        }
      } catch (error) {
        console.error('Data loading failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCenterClick = async (center: Center) => {
    try {
      // Fetch detailed info for the sidebar
      const response = await fetch(`/api/get-village-info?name=${encodeURIComponent(center.name)}&type=${encodeURIComponent(center.type)}`);
      if (response.ok) {
        const fullData = await response.json();
        setSelectedCenter({ ...center, ...fullData });
      } else {
        setSelectedCenter(center);
      }
    } catch (e) {
      console.error('Failed to fetch village info:', e);
      setSelectedCenter(center);
    }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-parchment">
      {/* Sidebar */}
      <FilterSidebar 
        centers={centers} 
        onCenterClick={handleCenterClick}
        selectedCenterId={selectedCenter?.id || null}
        onFilterChange={setFilteredCenters}
        activeFilter={activeFilter}
        onFilterTypeChange={setActiveFilter}
      />

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <MapComponent 
          centers={filteredCenters} 
          onCenterClick={handleCenterClick}
          selectedCenter={selectedCenter}
          rawGeoData={rawGeoData}
          districtsData={districtsData}
          activeFilter={activeFilter}
        />
        
        {/* Floating Header */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2">
          <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-charcoal/10 shadow-lg text-center">
            <h2 className="text-sm font-serif font-bold text-charcoal tracking-wide">
              Jesuit Pune Province Activity Map
            </h2>
          </div>
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
