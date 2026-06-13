'use client';

import { Center } from '@/types';
import { X, Users, User, GraduationCap, History, CheckCircle2, MapPin } from 'lucide-react';
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
        "fixed right-0 bottom-0 md:top-0 h-[85vh] md:h-full w-full md:w-[400px] bg-parchment shadow-2xl z-30 transform transition-transform duration-500 ease-out border-t md:border-t-0 md:border-l border-charcoal/10 overflow-y-auto rounded-t-[2.5rem] md:rounded-t-none",
        center ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full"
      )}>
        <div className="relative pb-12">
          {/* Decorative Header Area */}
          <div className="h-40 bg-charcoal relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <History size={140} strokeWidth={0.5} className="text-white" />
            </div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>

            <div className="absolute bottom-0 left-0 w-full p-8 translate-y-1/2">
              <div className="w-16 h-16 bg-white shadow-xl flex items-center justify-center border border-charcoal/5">
                <MapPin size={32} className={cn(
                  center.type === 'Parish' && "text-terracotta",
                  center.type === 'NFE Centres' && "text-[#9333ea]",
                  center.type === 'Social Justice' && "text-charcoal",
                  center.type === 'TDSS' && "text-[#16a34a]"
                )} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 pt-12">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block px-3 py-1 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-[0.2em]">
                  {center.type}
                </span>
                <span className="text-[10px] text-charcoal/30 uppercase tracking-widest font-bold">
                  {center.district || 'Pune Province'}
                </span>
              </div>
              <h2 className="text-4xl font-serif font-bold text-charcoal leading-tight">{center.name}</h2>
              <div className="w-12 h-1 bg-terracotta mt-4" />
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-3 gap-3 mb-12">
              {[
                { label: 'Families', value: center.families || 0, icon: Users, color: 'text-terracotta' },
                { label: 'Individuals', value: center.individuals || 0, icon: User, color: 'text-gold' },
                { label: 'Catechists', value: center.catechists_count || 0, icon: GraduationCap, color: 'text-charcoal' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-4 border border-charcoal/5 text-center shadow-sm">
                  <stat.icon size={16} className={cn("mx-auto mb-3", stat.color)} />
                  <p className="text-2xl font-serif font-bold text-charcoal mb-0.5">{stat.value}</p>
                  <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Information Sections */}
            <div className="space-y-10">
              <section className="relative pl-6 border-l border-gold/30">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gold" />
                <h3 className="font-serif font-bold text-xl mb-3 flex items-center gap-2">
                  Mission History
                </h3>
                <p className="text-charcoal/70 text-sm leading-relaxed font-serif italic">
                  {center.description || "The mission in this village continues to serve as a beacon of hope and development, fostering community growth through the Jesuit commitment to service."}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-8">
                <section>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 mb-2">Established</h4>
                  <p className="text-charcoal font-serif font-bold">{center.established_year || 'Circa 1995'}</p>
                </section>
                <section>
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 mb-2">Location</h4>
                  <p className="text-charcoal font-serif font-bold">{center.tehsil || 'Rural Area'}</p>
                </section>
              </div>

              <section className="pt-8 border-t border-charcoal/5">
                <div className="flex items-center justify-between bg-charcoal p-5 text-parchment">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-gold" />
                    <div>
                      <span className="block text-[9px] uppercase tracking-widest font-bold text-parchment/40">Status</span>
                      <span className="text-xs font-bold uppercase tracking-tight">Data Verified</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-serif italic text-parchment/60">
                    {center.last_verified ? new Date(center.last_verified).toLocaleDateString() : 'Active 2024'}
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

