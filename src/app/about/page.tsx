'use client';

import Link from 'next/link';
import { Globe, Target, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-parchment text-charcoal font-sans">
      {/* Page Header */}
      <section className="relative py-24 border-b border-charcoal/5 bg-white/40 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-6">About Us</h1>
          <p className="text-xl text-charcoal/60 font-serif italic max-w-2xl mx-auto">
            &quot;For the greater glory of God and the service of humanity since 1992.&quot;
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 border-b border-charcoal/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-charcoal flex items-center justify-center shrink-0">
                  <Target className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold mb-4">Our Mission</h2>
                  <p className="text-charcoal/70 leading-relaxed font-serif text-lg">
                    To promote the intellectual, spiritual, and social development of the marginalized communities in Maharashtra. We strive to create a society where justice, peace, and love prevail through education, advocacy, and direct service.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-terracotta flex items-center justify-center shrink-0">
                  <Globe className="text-white w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold mb-4">Our Vision</h2>
                  <p className="text-charcoal/70 leading-relaxed font-serif text-lg">
                    A world transformed by the Gospel values of equality and dignity, where every individual has the opportunity to realize their full potential regardless of caste, creed, or gender.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-12 border border-charcoal/5 shadow-2xl shadow-charcoal/5 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-gold" />
              <h3 className="text-2xl font-serif font-bold mb-6">Jesuit Identity</h3>
              <p className="text-charcoal/60 mb-6 leading-relaxed italic">
                The Society of Jesus (Jesuits) is a religious order of the Catholic Church founded by St. Ignatius of Loyola. The Pune Province was established to focus specifically on the developmental needs of the Western Maharashtra region.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-charcoal/40">
                  <div className="w-4 h-px bg-charcoal/20" />
                  <span>Faith in Action</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-charcoal/40">
                  <div className="w-4 h-px bg-charcoal/20" />
                  <span>Preference for the Poor</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-charcoal/40">
                  <div className="w-4 h-px bg-charcoal/20" />
                  <span>Universal Apostolic Preferences</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="py-12 bg-charcoal text-parchment">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-2">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Home
          </Link>
          <Link href="/news" className="text-sm font-bold uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-2">
            Read Latest News <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
