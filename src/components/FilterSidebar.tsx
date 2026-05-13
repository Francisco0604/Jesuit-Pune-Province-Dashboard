'use client';

import { useState, useEffect } from 'react';
import { Center, CenterType } from '@/types';
import { Search, Filter, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FilterSidebarProps {
  centers: Center[];
  onCenterClick: (center: Center) => void;
  selectedCenterId: string | null;
}

export default function FilterSidebar({ centers, onCenterClick, selectedCenterId }: FilterSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<CenterType | 'All'>('All');
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({});
  const [expandedTehsils, setExpandedTehsils] = useState<Record<string, boolean>>({});

  // Auto-expand hierarchy when a village is selected (e.g., from map click)
  useEffect(() => {
    if (selectedCenterId) {
      const selectedCenter = centers.find(c => c.id === selectedCenterId);
      if (selectedCenter) {
        if (selectedCenter.district) {
          setExpandedDistricts(prev => ({ ...prev, [selectedCenter.district!]: true }));
        }
        if (selectedCenter.tehsil) {
          setExpandedTehsils(prev => ({ ...prev, [`${selectedCenter.district}-${selectedCenter.tehsil}`]: true }));
        }
      }
    }
  }, [selectedCenterId, centers]);

  const toggleDistrict = (district: string) => {
    setExpandedDistricts(prev => ({ ...prev, [district]: !prev[district] }));
  };

  const toggleTehsil = (tehsil: string) => {
    setExpandedTehsils(prev => ({ ...prev, [tehsil]: !prev[tehsil] }));
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || center.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Grouping logic
  const groupedData: Record<string, Record<string, Center[]>> = {};
  filteredCenters.forEach(center => {
    const district = center.district || 'Unknown District';
    const tehsil = center.tehsil || 'Unknown Area';
    
    if (!groupedData[district]) groupedData[district] = {};
    if (!groupedData[district][tehsil]) groupedData[district][tehsil] = [];
    
    groupedData[district][tehsil].push(center);
  });

  const categories: (CenterType | 'All')[] = ['All', 'Parish', 'Education', 'Social Justice', 'TDSS'];

  return (
    <aside className="w-80 h-full glass-sidebar flex flex-col shadow-2xl z-10 overflow-hidden">
      <div className="p-6 border-b border-charcoal/10 bg-parchment/50">
        <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">Pune Province</h1>
        <p className="text-xs text-charcoal/60 uppercase tracking-widest mb-6">Hierarchy Navigator</p>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" size={18} />
          <input
            type="text"
            placeholder="Search villages..."
            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-charcoal/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                activeFilter === cat 
                  ? "bg-gold text-white shadow-md" 
                  : "bg-white/50 text-charcoal/60 border border-charcoal/5 hover:bg-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([district, tehsils]) => {
            const isDistrictExpanded = expandedDistricts[district];
            return (
              <div key={district} className={cn(
                "mb-4 rounded-xl transition-all border",
                isDistrictExpanded ? "border-gold/30 bg-gold/5 shadow-sm" : "border-transparent"
              )}>
                <button 
                  onClick={() => toggleDistrict(district)}
                  className={cn(
                    "w-full flex items-center gap-2 p-3 hover:bg-charcoal/5 rounded-t-xl transition-colors text-left",
                    isDistrictExpanded ? "text-gold font-bold" : "text-charcoal"
                  )}
                >
                  {isDistrictExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span className="font-serif uppercase tracking-wider text-sm">{district}</span>
                </button>

                {isDistrictExpanded && (
                  <div className="mx-2 mb-2 space-y-2 border-l-2 border-gold/20 pl-4 mt-1">
                    {Object.entries(tehsils).map(([tehsil, villageList]) => {
                      const tehsilKey = `${district}-${tehsil}`;
                      const isTehsilExpanded = expandedTehsils[tehsilKey];
                      return (
                        <div key={tehsil} className={cn(
                          "rounded-lg transition-all",
                          isTehsilExpanded ? "bg-white/40 shadow-inner" : ""
                        )}>
                          <button 
                            onClick={() => toggleTehsil(tehsilKey)}
                            className={cn(
                              "w-full flex items-center gap-2 p-2 hover:bg-gold/5 rounded-lg transition-colors text-left",
                              isTehsilExpanded ? "text-gold" : "text-charcoal/70"
                            )}
                          >
                            {isTehsilExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            <span className="font-sans font-semibold text-xs uppercase tracking-tight">{tehsil}</span>
                          </button>

                          {isTehsilExpanded && (
                            <div className="ml-4 mt-1 space-y-1 pb-2">
                              {villageList.map((center) => (
                                <div
                                  key={center.id}
                                  onClick={() => onCenterClick(center)}
                                  className={cn(
                                    "p-3 rounded-lg cursor-pointer transition-all border group text-sm mr-2",
                                    selectedCenterId === center.id
                                      ? "bg-white border-gold shadow-md ring-1 ring-gold/10"
                                      : "bg-transparent border-transparent hover:bg-white/50 hover:border-charcoal/5"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full",
                                      center.type === 'Parish' && "bg-terracotta",
                                      center.type === 'Education' && "bg-gold",
                                      center.type === 'Social Justice' && "bg-charcoal",
                                      center.type === 'TDSS' && "bg-green-600",
                                      selectedCenterId === center.id && "animate-pulse"
                                    )} />
                                    <span className={cn(
                                      "transition-colors truncate",
                                      selectedCenterId === center.id ? "text-gold font-bold" : "text-charcoal group-hover:text-gold"
                                    )}>
                                      {center.name}
                                    </span>
                                  </div>
                                </div>
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
          <div className="text-center py-12">
            <Filter className="mx-auto text-charcoal/20 mb-2" size={32} />
            <p className="text-sm text-charcoal/40 italic">No villages found.</p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-charcoal/10 bg-parchment/30 text-[10px] text-charcoal/40 text-center uppercase tracking-tighter">
        © {new Date().getFullYear()} Jesuit Pune Province | Ad Maiorem Dei Gloriam
      </div>
    </aside>
  );
}
