'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCenters, insertCenters, updateCenter } from '@/lib/supabase';
import { processData } from '@/utils/dataProcessor';
import { Upload, Plus, Edit2, Trash2, Check, X, Loader2, Save } from 'lucide-react';
import { Center } from '@/types';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: centers, isLoading } = useQuery({
    queryKey: ['centers'],
    queryFn: getCenters,
  });

  const importMutation = useMutation({
    mutationFn: insertCenters,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      alert('Data imported successfully!');
    },
    onError: (error) => {
      alert(`Import failed: ${error.message}`);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          // Basic CSV to JSON conversion (simplified)
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj: any, header, i) => {
              obj[header.trim()] = values[i]?.trim();
              return obj;
            }, {});
          });
        }

        const processed = processData(data);
        if (processed.length > 0) {
          // Remove ID from processed data for insertion (let DB handle it or use generated ones)
          const toInsert = processed.map(({ id, ...rest }) => rest);
          importMutation.mutate(toInsert);
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
    <div className="min-h-screen bg-parchment p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Admin Dashboard</h1>
            <p className="text-charcoal/60 uppercase tracking-widest text-xs mt-2">Manage Province Centers</p>
          </div>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 bg-charcoal text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-charcoal/90 transition-colors shadow-md">
              <Upload size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Import Data</span>
              <input type="file" className="hidden" accept=".json,.geojson,.csv" onChange={handleFileUpload} />
            </label>
            <button className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors shadow-md">
              <Plus size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Add Center</span>
            </button>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Centers', value: centers?.length || 0, color: 'border-charcoal' },
            { label: 'Parishes', value: centers?.filter(c => c.type === 'Parish').length || 0, color: 'border-terracotta' },
            { label: 'Educational', value: centers?.filter(c => c.type === 'Education').length || 0, color: 'border-gold' },
            { label: 'Social Justice', value: centers?.filter(c => c.type === 'Social Justice').length || 0, color: 'border-charcoal' },
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${stat.color}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">{stat.label}</p>
              <p className="text-3xl font-serif font-bold text-charcoal">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Centers Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-charcoal/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-charcoal/5 text-charcoal/60 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Center Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location (Lat/Lng)</th>
                <th className="px-6 py-4">Verified</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-gold mb-2" size={32} />
                    <p className="text-sm text-charcoal/40 italic font-serif">Loading centers...</p>
                  </td>
                </tr>
              ) : centers?.map((center) => (
                <tr key={center.id} className="hover:bg-parchment/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-serif font-bold text-charcoal">{center.name}</div>
                    <div className="text-[10px] text-charcoal/40 uppercase tracking-tighter">{center.district}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      center.type === 'Parish' ? 'bg-terracotta/10 text-terracotta' :
                      center.type === 'Education' ? 'bg-gold/10 text-gold' : 'bg-charcoal/10 text-charcoal'
                    }`}>
                      {center.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-charcoal/60">
                    {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                  </td>
                  <td className="px-6 py-4">
                    <Check className="text-green-600" size={16} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-charcoal/40 hover:text-gold transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-charcoal/40 hover:text-terracotta transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
