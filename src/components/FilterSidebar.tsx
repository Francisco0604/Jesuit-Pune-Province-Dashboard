'use client';

import { useState, useEffect, useMemo } from 'react';
import { Center } from '@/types';
import { Search, Filter, ChevronRight, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterSidebarProps {
  centers: Center[];
  onCenterClick: (center: Center) => void;
  selectedCenterId: string | null;
  onFilterChange?: (filtered: Center[]) => void;
  activeFilter?: string;
  onFilterTypeChange?: (filter: string) => void;
}

export default function FilterSidebar({ 
  centers, 
  onCenterClick, 
  selectedCenterId, 
  onFilterChange,
  activeFilter = 'All',
  onFilterTypeChange
}: FilterSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({});
  const [expandedTehsils, setExpandedTehsils] = useState<Record<string, boolean>>({});
  const [prevSelectedCenterId, setPrevSelectedCenterId] = useState<string | null>(null);

  // Auto-expand hierarchy when a village is selected (e.g., from map click)
  if (selectedCenterId !== prevSelectedCenterId) {
    setPrevSelectedCenterId(selectedCenterId);
    if (selectedCenterId) {
      const selectedCenter = centers.find(c => c.id === selectedCenterId);
      if (selectedCenter) {
        if (selectedCenter.district && !expandedDistricts[selectedCenter.district]) {
          setExpandedDistricts(prev => ({ ...prev, [selectedCenter.district!]: true }));
        }
        const tehsilKey = `${selectedCenter.district}-${selectedCenter.tehsil}`;
        if (selectedCenter.tehsil && !expandedTehsils[tehsilKey]) {
          setExpandedTehsils(prev => ({ ...prev, [tehsilKey]: true }));
        }
      }
    }
  }

  // Filter centers based on search and category
  const filteredCenters = useMemo(() => {
    return centers.filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'All' || center.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [centers, searchTerm, activeFilter]);

  // Notify parent when filtered centers change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filteredCenters);
    }
  }, [filteredCenters, onFilterChange]);

  const toggleDistrict = (district: string) => {
    setExpandedDistricts(prev => ({ ...prev, [district]: !prev[district] }));
  };

  const toggleTehsil = (tehsil: string) => {
    setExpandedTehsils(prev => ({ ...prev, [tehsil]: !prev[tehsil] }));
  };

  // Grouping logic
  const groupedData: Record<string, Record<string, Center[]>> = {};
  filteredCenters.forEach(center => {
    let district = center.district || 'Unknown District';
    let tehsil = center.tehsil || 'Unknown Area';

    // SPECIAL CASE: Move Beed to its own section (BEED) and FLATTEN hierarchy (Direct Villages)
    if (district.toLowerCase() === 'beed' || district.toLowerCase() === 'bid' || center.type === 'TDSS') {
      district = 'BEED';
      tehsil = ''; // Empty string indicates "Direct Villages" (No sub-dropdown)
    }
    
    if (!groupedData[district]) groupedData[district] = {};
    if (!groupedData[district][tehsil]) groupedData[district][tehsil] = [];
    
    groupedData[district][tehsil].push(center);
  });

  const categories = [
    { name: 'All', color: 'bg-charcoal' },
    { name: 'Parish', color: 'bg-terracotta' },
    { name: 'NFE Centres', color: 'bg-[#9333ea]' },
    { name: 'Social Justice', color: 'bg-[#2d2d2d]' },
    { name: 'TDSS', color: 'bg-[#16a34a]' }
  ];

  return (
    <aside className="w-80 h-full glass-sidebar flex flex-col shadow-2xl z-10 overflow-hidden border-r border-charcoal/5">
      <div className="p-8 border-b border-charcoal/10 bg-parchment/80 backdrop-blur-md">
        <h1 className="text-2xl font-serif font-bold text-charcoal tracking-tight mb-1">Pune Province</h1>
        <p className="text-[10px] text-terracotta uppercase tracking-[0.2em] font-bold mb-8">Activity Navigator</p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
          <input
            type="text"
            placeholder="Find a village..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/40 border border-charcoal/10 rounded-none focus:outline-none focus:border-gold transition-colors text-sm placeholder:text-charcoal/30 placeholder:italic font-serif"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => onFilterTypeChange?.(cat.name)}
              className={cn(
                "px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all border",
                activeFilter === cat.name 
                  ? `${cat.color} text-white border-transparent shadow-lg shadow-charcoal/10`
                  : "bg-transparent text-charcoal/40 border-charcoal/10 hover:border-charcoal/30 hover:text-charcoal"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-2">
        {Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([district, tehsils]) => {
            const isDistrictExpanded = expandedDistricts[district];
            return (
              <div key={district} className="mb-2">
                <button 
                  onClick={() => toggleDistrict(district)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 transition-colors text-left group",
                    isDistrictExpanded ? "bg-charcoal text-parchment" : "bg-white/30 text-charcoal hover:bg-white/60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-sm tracking-wide">{district}</span>
                    <span className="text-[10px] opacity-40 font-sans">
                      ({Object.values(tehsils).flat().length})
                    </span>
                  </div>
                  {isDistrictExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} className="opacity-40" />}
                </button>

                {isDistrictExpanded && (
                  <div className="mt-1 space-y-1">
                    {Object.entries(tehsils).map(([tehsil, villageList]) => {
                      // Handle Direct Villages (Skip Taluka Header)
                      if (tehsil === '') {
                        return (
                          <div key="direct-villages" className="space-y-px">
                            {villageList.map((center) => (
                              <button
                                key={center.id}
                                onClick={() => onCenterClick(center)}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 transition-all text-left text-xs",
                                  selectedCenterId === center.id
                                    ? "bg-gold/10 text-charcoal font-bold border-l-2 border-gold shadow-sm"
                                    : "bg-transparent text-charcoal/60 hover:bg-white/40 hover:text-charcoal border-l-2 border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "w-1.5 h-1.5 rounded-full shrink-0",
                                  center.type === 'Parish' && "bg-terracotta",
                                  center.type === 'NFE Centres' && "bg-[#9333ea]",
                                  center.type === 'Social Justice' && "bg-charcoal",
                                  center.type === 'TDSS' && "bg-[#16a34a]",
                                  selectedCenterId === center.id && "ring-4 ring-gold/20"
                                )} />
                                <span className="truncate">{center.name}</span>
                              </button>
                            ))}
                          </div>
                        );
                      }

                      const tehsilKey = `${district}-${tehsil}`;
                      const isTehsilExpanded = expandedTehsils[tehsilKey];
                      return (
                        <div key={tehsil} className="mt-0.5">
                          <button 
                            onClick={() => toggleTehsil(tehsilKey)}
                            className={cn(
                              "w-full flex items-center justify-between p-2 pl-4 transition-colors text-left",
                              isTehsilExpanded ? "bg-gold/5 text-gold" : "text-charcoal/50 hover:text-charcoal"
                            )}
                          >
                            <span className="font-sans font-bold text-[10px] uppercase tracking-wider">{tehsil}</span>
                            {isTehsilExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} className="opacity-30" />}
                          </button>

                          {isTehsilExpanded && (
                            <div className="space-y-px">
                              {villageList.map((center) => (
                                <button
                                  key={center.id}
                                  onClick={() => onCenterClick(center)}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-2.5 pl-8 transition-all text-left text-[11px]",
                                    selectedCenterId === center.id
                                      ? "bg-gold/10 text-charcoal font-bold border-l-2 border-gold"
                                      : "bg-transparent text-charcoal/60 hover:bg-white/40 hover:text-charcoal border-l-2 border-transparent"
                                  )}
                                >
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    center.type === 'Parish' && "bg-terracotta",
                                    center.type === 'NFE Centres' && "bg-[#9333ea]",
                                    center.type === 'Social Justice' && "bg-charcoal",
                                    selectedCenterId === center.id && "ring-4 ring-gold/20"
                                    )} />
                                  <span className="truncate">{center.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 px-4">
            <Filter className="mx-auto text-charcoal/10 mb-4" size={40} strokeWidth={1} />
            <p className="text-sm text-charcoal/40 font-serif italic">No villages match your search.</p>
          </div>
        )}
      </div>
      
      <div className="p-6 border-t border-charcoal/5 bg-parchment/50 text-[9px] text-charcoal/30 text-center uppercase tracking-[0.2em] font-bold">
        Ad Maiorem Dei Gloriam
      </div>
    </aside>
  );
}

