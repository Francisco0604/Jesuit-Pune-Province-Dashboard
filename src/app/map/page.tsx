'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import FilterSidebar from '@/components/FilterSidebar';
import CenterDrawer from '@/components/CenterDrawer';
import { Center, GeoJSONFeatureCollection } from '@/types';
import { processData } from '@/utils/dataProcessor';
import { Loader2, Compass } from 'lucide-react';

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
  const [rawGeoData, setRawGeoData] = useState<GeoJSONFeatureCollection | null>(null);
  const [districtsData, setDistrictsData] = useState<GeoJSONFeatureCollection | null>(null);

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
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 w-full pointer-events-none px-4">
          <div className="bg-parchment/90 backdrop-blur-xl px-10 py-3 shadow-2xl shadow-charcoal/20 border border-charcoal/10 pointer-events-auto flex items-center gap-6">
            <Link href="/" className="text-charcoal/40 hover:text-terracotta transition-colors group">
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </Link>
            <div className="w-px h-6 bg-charcoal/10" />
            <h2 className="text-sm font-serif font-bold text-charcoal tracking-[0.2em] uppercase whitespace-nowrap">
              Pune Province <span className="text-terracotta mx-2">|</span> Activity Map
            </h2>
          </div>
        </div>

        {/* Legend Overlay (Optional) */}
        <div className="absolute bottom-10 left-10 z-10 pointer-events-none hidden md:block">
          <div className="bg-parchment/80 backdrop-blur-md p-6 border border-charcoal/5 shadow-xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-4">Map Legend</h4>
            <div className="space-y-3">
              {[
                { name: 'Parishes', color: 'bg-terracotta' },
                { name: 'NFE Centres', color: 'bg-[#9333ea]' },
                { name: 'Social Justice', color: 'bg-charcoal' },
                { name: 'TDSS', color: 'bg-[#16a34a]' },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${item.color}`} />
                  <span className="text-[10px] font-bold uppercase tracking-tight text-charcoal/70">{item.name}</span>
                </div>
              ))}
            </div>
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
