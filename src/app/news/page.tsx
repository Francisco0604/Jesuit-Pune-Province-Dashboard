'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, ArrowUpRight } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    title: 'New NFE Centre Inaugurated in Beed',
    date: 'June 10, 2026',
    category: 'Education',
    summary: 'A new non-formal education centre has been established to serve over 40 children in the remote villages of Beed district.',
  },
  {
    id: 2,
    title: 'Annual Social Justice Seminar 2026',
    date: 'May 28, 2026',
    category: 'Advocacy',
    summary: 'Leaders from across the province gathered to discuss legal strategies for tribal land rights and community empowerment.',
  },
  {
    id: 3,
    title: 'Sustainable Farming Workshop',
    date: 'May 15, 2026',
    category: 'Livelihood',
    summary: 'Over 100 farmers participated in our organic farming and water conservation workshop held in Ahmednagar.',
  },
];

export default function NewsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment text-charcoal font-sans">
      {/* Page Header */}
      <section className="relative py-24 border-b border-charcoal/5 bg-white/40">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-4">News</h1>
          <p className="text-xl text-charcoal/40 font-serif italic">Updates from our missions across the field.</p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-24 flex-1">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <article key={item.id} className="bg-white border border-charcoal/5 flex flex-col group hover:shadow-2xl transition-all shadow-charcoal/5">
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-terracotta">{item.category}</span>
                    <div className="flex items-center gap-2 text-charcoal/30 text-[10px] font-bold">
                      <Calendar size={12} />
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-serif font-bold mb-4 group-hover:text-terracotta transition-colors leading-tight">{item.title}</h2>
                  <p className="text-sm text-charcoal/60 leading-relaxed font-serif italic mb-8">{item.summary}</p>
                </div>
                <div className="p-6 border-t border-charcoal/5 flex justify-end">
                  <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal hover:text-gold transition-colors">
                    Read More <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="py-12 bg-charcoal text-parchment">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-2">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Home
          </Link>
          <Link href="/about" className="text-sm font-bold uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-2">
            About the Province <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
