'use client';

import { useState, useEffect } from 'react';
import { processData, parseCSV } from '@/utils/dataProcessor';
import { getApiUrl } from '@/utils/paths';
import { Upload, Plus, Edit2, Trash2, Loader2, Save, Shield, Map, BookOpen, Users, Download, GraduationCap } from 'lucide-react';
import { Center, RawData } from '@/types';

export default function AdminPage() {
  const [isImporting, setIsImporting] = useState(false);
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isReadOnly = process.env.NODE_ENV === 'production';

  // Load existing centers from public/data
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const response = await fetch(getApiUrl('/api/get-all-villages'));
        if (response.ok) {
          const data = await response.json();
          setCenters(data);
        } else {
          // Fallback if get-all-villages fails
          const mapResponse = await fetch(getApiUrl('/api/get-map-data'));
          if (mapResponse.ok) {
            const data = await mapResponse.json();
            setCenters(processData(data));
          }
        }
      } catch (error) {
        console.error('Failed to load local data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadLocalData();
  }, []);

  const exportAllToJson = async () => {
    if (isReadOnly) {
      alert('This portal is in read-only mode on GitHub Pages. Database updates are disabled.');
      return;
    }
    if (!centers || centers.length === 0) return;
    setIsImporting(true);
    let successCount = 0;
    for (const center of centers) {
      try {
        await fetch('/api/save-village', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(center),
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to export JSON for ${center.name}:`, e);
      }
    }
    setIsImporting(false);
    alert(`Exported ${successCount} centers to JSON files.`);
  };

  const downloadAllAsCsv = async () => {
    setIsImporting(true);
    try {
      const response = await fetch(getApiUrl('/api/get-all-villages'));
      if (!response.ok) throw new Error('Failed to fetch villages');
      const villages: Center[] = await response.json();

      const headers = [
        'VILLAGE',
        'type',
        'cluster',
        'families',
        'individuals',
        'catechists_count',
        'established_year',
        'tehsil',
        'description'
      ];

      const escapeField = (val: any) => {
        if (val === undefined || val === null) return '';
        const str = String(val).trim();
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = villages.map(v => [
        escapeField(v.name),
        escapeField(v.type),
        escapeField(v.cluster),
        escapeField(v.families),
        escapeField(v.individuals),
        escapeField(v.catechists_count),
        escapeField(v.established_year),
        escapeField(v.tehsil),
        escapeField(v.description)
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `village_data_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to generate CSV export. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) {
      alert('This portal is in read-only mode on GitHub Pages. File imports are disabled.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let data;
        if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
          data = JSON.parse(text);
        } else {
          data = parseCSV(text);
        }

        const processed = processData(data, file.name);
        if (processed.length > 0) {
          // Save each processed center to its JSON file
          for (const center of processed) {
            await fetch('/api/save-village', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(center),
            });
          }
          setCenters(prev => [...prev, ...processed]);
          alert('Data imported and JSON files created successfully!');
        } else {
          alert('No valid center data found in file.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert('Failed to process file. Ensure it is valid JSON or CSV.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-parchment p-12">
      <div className="max-w-6xl mx-auto">
        {isReadOnly && (
          <div className="mb-8 p-5 bg-terracotta/10 border border-terracotta/20 text-terracotta flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 animate-pulse" />
              <p className="text-sm font-serif italic">
                Note: The administrative portal is read-only when hosted on GitHub Pages. Changes cannot be synced back to the database.
              </p>
            </div>
            <span className="font-bold uppercase tracking-widest text-[9px] px-3 py-1 bg-terracotta text-white">Read Only Mode</span>
          </div>
        )}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-charcoal flex items-center justify-center">
                <Shield className="text-white w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta">Administrative Portal</span>
            </div>
            <h1 className="text-5xl font-serif font-bold text-charcoal">Province Records</h1>
            <p className="text-charcoal/40 font-serif italic mt-2 text-lg">Managing the legacy and mission of Pune Province.</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={downloadAllAsCsv}
              disabled={isImporting}
              className="flex items-center gap-3 bg-white text-charcoal border border-charcoal/10 px-6 py-3 rounded-none hover:bg-parchment transition-all shadow-lg shadow-charcoal/5 disabled:opacity-50 font-bold uppercase tracking-widest text-[10px]"
            >
              <Download size={16} />
              <span>Download Template (CSV)</span>
            </button>
            <button 
              onClick={exportAllToJson}
              disabled={isImporting || isReadOnly}
              className={`flex items-center gap-3 border px-6 py-3 rounded-none font-bold uppercase tracking-widest text-[10px] ${
                isReadOnly 
                  ? 'bg-white/50 text-charcoal/30 border-charcoal/5 cursor-not-allowed'
                  : 'bg-white text-charcoal border-charcoal/10 hover:bg-parchment transition-all shadow-lg shadow-charcoal/5'
              }`}
            >
              <Save size={16} />
              <span>Sync All Data</span>
            </button>
            {isReadOnly ? (
              <button 
                disabled={true}
                className="flex items-center gap-3 bg-charcoal/10 text-charcoal/30 px-6 py-3 rounded-none cursor-not-allowed font-bold uppercase tracking-widest text-[10px]"
              >
                <Upload size={16} />
                <span>Import GeoJSON/CSV</span>
              </button>
            ) : (
              <label className="flex items-center gap-3 bg-charcoal text-parchment px-6 py-3 rounded-none cursor-pointer hover:bg-terracotta transition-all shadow-xl shadow-charcoal/20 font-bold uppercase tracking-widest text-[10px]">
                <Upload size={16} />
                <span>Import GeoJSON/CSV</span>
                <input type="file" className="hidden" accept=".json,.geojson,.csv" onChange={handleFileUpload} />
              </label>
            )}
            <button 
              disabled={isReadOnly}
              className={`flex items-center gap-3 px-6 py-3 rounded-none font-bold uppercase tracking-widest text-[10px] ${
                isReadOnly
                  ? 'bg-gold/20 text-charcoal/40 cursor-not-allowed'
                  : 'bg-gold text-charcoal hover:bg-white transition-all shadow-xl shadow-gold/20'
              }`}
            >
              <Plus size={16} />
              <span>New Entry</span>
            </button>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'Total Centers', value: centers?.length || 0, icon: Map, color: 'text-charcoal' },
            { label: 'Parishes', value: centers?.filter(c => c.type === 'Parish').length || 0, icon: Shield, color: 'text-terracotta' },
            { label: 'NFE Centres', value: centers?.filter(c => c.type === 'NFE Centres').length || 0, icon: BookOpen, color: 'text-[#9333ea]' },
            { label: 'TDSS', value: centers?.filter(c => c.type === 'TDSS').length || 0, icon: Users, color: 'text-[#16a34a]' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-8 shadow-xl shadow-charcoal/5 border-b-2 border-charcoal/5 group hover:border-gold transition-all">
              <stat.icon className={`${stat.color} mb-4 opacity-40`} size={24} />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/30 mb-2">{stat.label}</p>
              <p className="text-4xl font-serif font-bold text-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Centers Table */}
        <div className="bg-white shadow-2xl overflow-hidden border border-charcoal/5">
          <div className="p-6 border-b border-charcoal/5 bg-white/50 flex justify-between items-center">
            <h3 className="font-serif font-bold text-xl">Active Village Records</h3>
            <div className="text-[10px] font-bold uppercase tracking-widest text-charcoal/30">Showing {centers?.length} entries</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-parchment/30 text-charcoal/40 text-[9px] font-bold uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Village Identity</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Geography</th>
                  <th className="px-8 py-5">Metrics</th>
                  {!isReadOnly && <th className="px-8 py-5 text-right">Management</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={isReadOnly ? 4 : 5} className="px-8 py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-gold mb-4" size={40} />
                      <p className="text-lg text-charcoal/40 italic font-serif tracking-wide">Consulting archives...</p>
                    </td>
                  </tr>
                ) : centers?.map((center) => (
                  <tr key={center.id} className="hover:bg-parchment/20 transition-all group">
                    <td className="px-8 py-6">
                      <div className="font-serif font-bold text-charcoal text-lg group-hover:text-terracotta transition-colors">{center.name}</div>
                      <div className="text-[10px] text-charcoal/30 uppercase tracking-widest font-bold">{center.district || 'Pune Province'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 border ${
                        center.type === 'Parish' ? 'border-terracotta/20 text-terracotta bg-terracotta/5' :
                        center.type === 'NFE Centres' ? 'border-[#9333ea]/20 text-[#9333ea] bg-[#9333ea]/5' : 
                        'border-charcoal/20 text-charcoal bg-charcoal/5'
                      }`}>
                        {center.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-mono text-charcoal/40 mb-1">{center.lat.toFixed(4)}N</div>
                      <div className="text-xs font-mono text-charcoal/40">{center.lng.toFixed(4)}E</div>
                    </td>
                    <td className="px-8 py-6">
                      {center.type === 'NFE Centres' ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Users size={12} className="text-[#9333ea]" />
                            <span className="text-sm font-serif font-bold">{center.families || 0} Students</span>
                          </div>
                          <div className="flex items-center gap-2 text-charcoal/40 text-[10px]">
                            <GraduationCap size={11} />
                            <span>{center.catechists_count || 0} Teachers</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Users size={12} className="text-gold" />
                          <span className="text-sm font-serif font-bold">{center.families || 0} Families</span>
                        </div>
                      )}
                    </td>
                    {!isReadOnly && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-charcoal/20 hover:text-gold transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 text-charcoal/20 hover:text-terracotta transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
