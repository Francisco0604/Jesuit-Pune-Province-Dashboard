'use client';

import { Center } from '@/types';
import { X, Users, User, GraduationCap, History, Calendar, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CenterDrawerProps {
  center: Center | null;
  onClose: () => void;
}

export default function CenterDrawer({ center, onClose }: CenterDrawerProps) {
  if (!center) return null;

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-20 md:hidden"
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed right-0 bottom-0 md:top-0 h-[70vh] md:h-full w-full md:w-96 bg-parchment shadow-2xl z-30 transform transition-transform duration-300 ease-in-out border-t md:border-t-0 md:border-l border-charcoal/10 overflow-y-auto rounded-t-3xl md:rounded-t-none",
        center ? "translate-y-0 md:translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full"
      )}>
        <div className="relative">
          {/* Header Image / Pattern Area */}
          <div className="h-32 bg-charcoal relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 flex items-center justify-center">
              <History size={120} strokeWidth={1} className="text-white" />
            </div>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 -mt-6 relative bg-parchment rounded-t-3xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-widest mb-2">
                  {center.type}
                </span>
                <h2 className="text-3xl font-serif font-bold text-charcoal">{center.name}</h2>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/50 p-4 rounded-xl border border-charcoal/5 text-center">
                <Users size={18} className="mx-auto text-terracotta mb-2" />
                <p className="text-xl font-bold text-charcoal">{center.families || 0}</p>
                <p className="text-[10px] uppercase tracking-tighter text-charcoal/40">Families</p>
              </div>
              <div className="bg-white/50 p-4 rounded-xl border border-charcoal/5 text-center">
                <User size={18} className="mx-auto text-gold mb-2" />
                <p className="text-xl font-bold text-charcoal">{center.individuals || 0}</p>
                <p className="text-[10px] uppercase tracking-tighter text-charcoal/40">Individuals</p>
              </div>
              <div className="bg-white/50 p-4 rounded-xl border border-charcoal/5 text-center">
                <GraduationCap size={18} className="mx-auto text-charcoal/60 mb-2" />
                <p className="text-xl font-bold text-charcoal">{center.catechists_count || 0}</p>
                <p className="text-[10px] uppercase tracking-tighter text-charcoal/40">Catechists</p>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-gold" />
                  <h3 className="font-serif font-bold text-lg">Established</h3>
                </div>
                <p className="text-charcoal/70 text-sm leading-relaxed">
                  Founded in {center.established_year || 'Unknown Year'}. {center.district && `Located in the ${center.district} district.`}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-2">
                  <History size={16} className="text-gold" />
                  <h3 className="font-serif font-bold text-lg">History & Mission</h3>
                </div>
                <p className="text-charcoal/70 text-sm leading-relaxed">
                  {center.description || "No historical records available for this center yet. We are continuously documenting our mission's progress across the province."}
                </p>
              </section>

              <section className="pt-6 border-t border-charcoal/5">
                <div className="flex items-center justify-between bg-green-50/50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <span className="text-xs font-bold uppercase text-green-700 tracking-wide">Last Verified</span>
                  </div>
                  <span className="text-xs text-green-700/60">
                    {center.last_verified ? new Date(center.last_verified).toLocaleDateString() : 'Pending'}
                  </span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
