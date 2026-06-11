'use client';

import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useEffect, useMemo, useState } from 'react';
import { Center } from '@/types';
import { MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Fix for default Leaflet icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  centers: Center[];
  onCenterClick: (center: Center) => void;
  selectedCenter: Center | null;
  rawGeoData: any; // The original GeoJSON FeatureCollection
  districtsData: any; // District boundaries
  activeFilter?: string;
}

const CreateCustomIcon = (type: string, isSelected: boolean) => {
  const colorMap: Record<string, string> = {
    'Parish': '#a34436', // Terracotta
    'NFE Centres': '#8e44ad', // Purple
    'Social Justice': '#2d2d2d', // Charcoal
    'TDSS': '#27ae60', // Green for partners
  };

  const color = colorMap[type] || '#a34436';
  
  const iconMarkup = renderToStaticMarkup(
    <div className={`${isSelected ? 'scale-125 transition-transform' : ''}`} style={{ color: isSelected ? '#c5a059' : color }}>
      <MapPin size={isSelected ? 40 : 32} fill="white" strokeWidth={isSelected ? 2.5 : 1.5} />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-map-marker',
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32],
  });
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ centers, onCenterClick, selectedCenter, rawGeoData, districtsData, activeFilter }: MapComponentProps) {
  const centerPosition: [number, number] = [19.1, 75.2]; // Maharashtra
  const selectedCenterId = selectedCenter?.id || null;

  const icons = useMemo(() => ({
    Parish: (sel: boolean) => CreateCustomIcon('Parish', sel),
    'NFE Centres': (sel: boolean) => CreateCustomIcon('NFE Centres', sel),
    'Social Justice': (sel: boolean) => CreateCustomIcon('Social Justice', sel),
    TDSS: (sel: boolean) => CreateCustomIcon('TDSS', sel),
  }), []);

  // Filter rawGeoData to find the selected feature's polygon
  const selectedFeature = useMemo(() => {
    if (!selectedCenter || !rawGeoData || rawGeoData.type !== 'FeatureCollection') return null;
    return rawGeoData.features.find((f: any) => 
      f.properties.VILLAGE === selectedCenter.name
    );
  }, [selectedCenter, rawGeoData]);

  // Filter rawGeoData to only show features that are in the filtered centers list
  const filteredGeoData = useMemo(() => {
    if (!rawGeoData || rawGeoData.type !== 'FeatureCollection') return null;
    
    // Create a set of visible village names for fast lookup
    const visibleNames = new Set(centers.map(c => c.name));
    
    return {
      ...rawGeoData,
      features: rawGeoData.features.filter((f: any) => {
        const props = f.properties;
        const name = props.VILLAGE || props.CLEAN_NAME || props.name || props.village_na || props.NAME || props.VillageName || props.village_names;
        return visibleNames.has(name);
      })
    };
  }, [rawGeoData, centers]);

  // Style for all village boundaries
  const villageBoundaryStyle = {
    color: "#a34436",
    weight: 1,
    opacity: 0.6,
    fillColor: "transparent",
    fillOpacity: 0,
  };

  // Style for the highlighted boundary
  const villageHighlightStyle = {
    color: "#c5a059", // Gold
    weight: 3,
    opacity: 1,
    fillColor: "#c5a059",
    fillOpacity: 0.4,
  };

  // Memoize the center points and names for all villages to avoid re-calculating on every render
  const villageLabels = useMemo(() => {
    const labels: any[] = [];
    const seenNames = new Set();

    // 1. Process from filteredGeoData
    if (filteredGeoData && filteredGeoData.type === 'FeatureCollection') {
      filteredGeoData.features.forEach((feature: any, index: number) => {
        const props = feature.properties;
        const name = props.VILLAGE || props.CLEAN_NAME || props.name || props.village_na || props.NAME || props.VillageName || props.village_names || 'Unknown';
        seenNames.add(name);
        
        try {
          const bounds = L.geoJSON(feature).getBounds();
          const center = bounds.getCenter();
          labels.push({ id: `raw-${index}`, name, lat: center.lat, lng: center.lng });
        } catch (e) {}
      });
    }

    // 2. Process from centers (for items that might not have geometry in GeoJSON but have points)
    centers.forEach((center) => {
      if (!seenNames.has(center.name)) {
        labels.push({ id: center.id, name: center.name, lat: center.lat, lng: center.lng });
        seenNames.add(center.name);
      }
    });
    
    return labels;
  }, [filteredGeoData, centers]);

  const districtStyle = (feature: any) => {
    const isSelected = selectedCenter && 
      (selectedCenter.district?.toUpperCase() === feature.properties.name || 
       (selectedCenter.district === '' && feature.properties.name === 'BEED')); // Default Beed for TDSS

    return {
      color: "#2d2d2d",
      weight: isSelected ? 2 : 1,
      opacity: isSelected ? 0.8 : 0.2,
      fillColor: "#c5a059",
      fillOpacity: isSelected ? 0.05 : 0, // Very faint highlight for the active district
      dashArray: isSelected ? '' : '5, 5'
    };
  };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={centerPosition}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <ZoomControl position="bottomright" />

        {/* District Boundaries */}
        {districtsData && (
          <GeoJSON 
            key={selectedCenter ? `districts-${selectedCenter.id}` : 'districts-static'}
            data={districtsData} 
            style={districtStyle}
          />
        )}

        {/* All Village Boundaries (Filtered) */}
        {filteredGeoData && (
          <GeoJSON 
            key={`villages-${centers.length}-${activeFilter}`} // Key includes centers length and filter to force re-render
            data={filteredGeoData} 
            style={villageBoundaryStyle}
          />
        )}

        {/* Village Labels (Points and Names) */}
        {villageLabels.map((label: any) => (
          <Marker
            key={`label-${label.id}`}
            position={[label.lat, label.lng]}
            interactive={false}
            icon={L.divIcon({
              className: 'village-label-container',
              html: `
                <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
                  <div style="width: 4px; height: 4px; background-color: #a34436; border-radius: 50%;"></div>
                  <div style="
                    font-size: 9px; 
                    font-weight: bold; 
                    color: #a34436; 
                    text-shadow: 1px 1px 0px white, -1px -1px 0px white, 1px -1px 0px white, -1px 1px 0px white;
                    white-space: nowrap;
                    margin-top: 2px;
                  ">${label.name}</div>
                </div>
              `,
              iconSize: [0, 0],
              iconAnchor: [0, 0]
            })}
          />
        ))}

        {selectedCenter && (
          <ChangeView 
            center={[selectedCenter.lat, selectedCenter.lng]} 
            zoom={selectedCenter.type === 'TDSS' ? 10 : 12} 
          />
        )}

        {/* Highlight Village Boundary Layer */}
        {selectedFeature && (
          <GeoJSON 
            key={`village-highlight-${selectedCenter?.id}`}
            data={selectedFeature} 
            style={villageHighlightStyle}
          />
        )}

        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {centers.map((center) => (
            <Marker
              key={center.id}
              position={[center.lat, center.lng]}
              icon={(icons[center.type] || icons.Parish)(selectedCenterId === center.id)}
              eventHandlers={{
                click: () => onCenterClick(center),
              }}
            >
              <Popup className="jesuit-popup">
                <div className="p-1">
                  <h3 className="font-serif font-bold text-lg">{center.name}</h3>
                  <p className="text-sm text-gray-600">{center.type}</p>
                  <button 
                    onClick={() => onCenterClick(center)}
                    className="mt-2 text-xs text-gold font-bold uppercase tracking-wider hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
