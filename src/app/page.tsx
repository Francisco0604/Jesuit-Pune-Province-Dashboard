'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, BookOpen, Users, Compass, ChevronRight, X, Mail, Phone, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const [isConnectOpen, setIsConnectOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-parchment text-charcoal font-sans selection:bg-gold/30">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-parchment/80 backdrop-blur-md border-b border-charcoal/5 shadow-sm">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-charcoal flex items-center justify-center transition-colors group-hover:bg-terracotta">
              <Shield className="text-white w-6 h-6" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight hidden sm:block">Jesuit Pune Province</span>
          </Link>
          
          <nav className="flex items-center gap-4 md:gap-10">
            <Link href="/about" className="text-sm font-bold uppercase tracking-widest hover:text-terracotta transition-colors">About Us</Link>
            <Link href="/news" className="text-sm font-bold uppercase tracking-widest hover:text-terracotta transition-colors">News</Link>
            <Link href="/map" className="px-6 py-2 bg-charcoal text-white text-xs font-bold uppercase tracking-widest hover:bg-terracotta transition-colors">Explore Map</Link>
            <button 
              onClick={() => setIsConnectOpen(true)}
              className="text-xs font-bold uppercase tracking-widest border-b-2 border-gold pb-1 hover:text-terracotta transition-colors hidden md:block"
            >
              Connect
            </button>
          </nav>
        </div>
      </header>

      {/* Connect Modal Overlay */}
      {isConnectOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-parchment w-full max-w-md shadow-2xl relative overflow-hidden border border-charcoal/5">
            <div className="h-2 bg-terracotta" />
            <button 
              onClick={() => setIsConnectOpen(false)}
              className="absolute top-6 right-6 p-2 text-charcoal/30 hover:text-charcoal transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-12 text-center">
              <h3 className="text-3xl font-serif font-bold text-charcoal mb-4">Connect With Us</h3>
              <p className="text-charcoal/60 font-serif italic mb-10 leading-relaxed">
                Join our mission or inquire about our programs. We would love to hear from you.
              </p>
              
              <div className="space-y-4">
                <a href="mailto:info@punejesuits.org" className="flex items-center gap-6 p-4 border border-charcoal/10 hover:border-gold group transition-all">
                  <Mail className="text-terracotta group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Email</p>
                    <p className="text-sm font-bold">info@punejesuits.org</p>
                  </div>
                </a>
                
                <a href="tel:+91201234567" className="flex items-center gap-6 p-4 border border-charcoal/10 hover:border-gold group transition-all">
                  <Phone className="text-gold group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Phone</p>
                    <p className="text-sm font-bold">+91 20 1234 5678</p>
                  </div>
                </a>

                <div className="flex items-center gap-6 p-4 border border-charcoal/10 hover:border-gold group transition-all">
                  <MessageSquare className="text-charcoal/60 group-hover:scale-110 transition-transform" size={24} />
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Address</p>
                    <p className="text-sm font-bold italic font-serif">Loyola Training Centre, Pune</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden border-b border-charcoal/5 pt-20">
        {/* Abstract background elements */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-terracotta blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gold blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-charcoal/10 bg-white/50 backdrop-blur-sm text-xs font-medium tracking-widest uppercase text-charcoal/60">
            <Compass className="w-3 h-3 text-terracotta" />
            <span>Since 1992</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-6 text-charcoal leading-tight">
            Jesuit Pune Province: <br />
            <span className="italic text-terracotta">Mission in Motion.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-charcoal/70 mb-10 max-w-3xl mx-auto font-serif italic leading-relaxed">
            Visualizing our commitment to Faith, Justice, and Education across the province.
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-px h-12 bg-charcoal mx-auto" />
        </div>
      </section>

      {/* Introduction Section ("Our Presence") */}
      <section id="presence" className="py-32 border-b border-charcoal/5 bg-white/40">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-24">
            <div>
              <h2 className="text-4xl md:text-7xl font-serif font-bold mb-10 text-charcoal leading-tight">
                Our mission <br /> across <span className="text-terracotta italic">four districts.</span>
              </h2>
              <p className="text-2xl text-charcoal/80 leading-relaxed font-serif mb-8">
                Explore our map by searching for a specific village or filtering by category to see our focused impact areas. 
              </p>
              <p className="text-lg text-charcoal/60 leading-relaxed font-serif italic border-l-4 border-gold pl-6">
                Clicking on any map marker will reveal detailed information about our activities, local impact, and established history in that area.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 h-full">
              {[
                { label: 'Villages Covered', value: '50+' },
                { label: 'Core Districts', value: '4' },
                { label: 'Families Impacted', value: '1000+' },
                { label: 'Active Centers', value: '20+' },
              ].map((stat, i) => (
                <div key={i} className="p-10 bg-white border border-charcoal/5 flex flex-col justify-center shadow-xl shadow-charcoal/5">
                  <h3 className="text-5xl font-serif font-bold text-terracotta mb-2">{stat.value}</h3>
                  <p className="text-xs uppercase tracking-[0.2em] text-charcoal/40 font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {[
              { title: 'Parishes', color: 'bg-terracotta', icon: Shield, desc: 'Faith-based community building and spiritual guidance for rural communities.' },
              { title: 'NFE Centres', color: 'bg-[#9333ea]', icon: BookOpen, desc: 'Non-formal education focusing on literacy, life skills, and child rights.' },
              { title: 'Social Justice', color: 'bg-[#2d2d2d]', icon: Users, desc: 'Advocacy for the rights of tribal and dalit communities through legal and social support.' },
              { title: 'TDSS', color: 'bg-[#16a34a]', icon: Compass, desc: 'Technical & Developmental Social Services focusing on sustainable agriculture and livelihood.' },
            ].map((pillar) => (
              <div key={pillar.title} className="flex items-center gap-10 p-6 bg-white border border-charcoal/5 hover:border-gold/30 transition-all group shadow-sm">
                <div className={`${pillar.color} w-20 h-20 shrink-0 flex items-center justify-center shadow-lg`}>
                  <pillar.icon className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 md:flex items-center justify-between gap-12">
                  <h4 className="text-3xl font-serif font-bold text-charcoal group-hover:text-terracotta transition-colors mb-2 md:mb-0 shrink-0">{pillar.title}</h4>
                  <p className="text-lg text-charcoal/60 max-w-2xl font-serif leading-relaxed italic">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News & Updates Preview */}
      <section className="py-32 bg-parchment border-b border-charcoal/5">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-terracotta block mb-4">The Latest</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-charcoal">News & Mission Updates</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {[
              { title: 'New NFE Centre Inaugurated in Beed', date: 'June 10, 2026', desc: 'Expanding our reach to serve over 40 children with quality non-formal education.' },
              { title: 'Justice Seminar 2026', date: 'May 28, 2026', desc: 'Discussing legal strategies for tribal land rights and community empowerment.' },
              { title: 'Sustainable Farming Workshop', date: 'May 15, 2026', desc: 'Empowering 100+ farmers with organic methods and water conservation.' },
            ].map((news, i) => (
              <div key={i} className="text-left bg-white p-10 border border-charcoal/5 hover:shadow-2xl transition-all flex flex-col h-full">
                <span className="text-[10px] font-bold text-terracotta uppercase tracking-widest mb-4 block">{news.date}</span>
                <h3 className="text-2xl font-serif font-bold text-charcoal mb-4 flex-1">{news.title}</h3>
                <p className="text-charcoal/60 font-serif italic text-sm mb-6">{news.desc}</p>
                <Link href="/news" className="text-xs font-bold uppercase tracking-[0.2em] text-gold hover:text-terracotta transition-colors inline-flex items-center gap-2">
                  Read More <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
          
          <Link href="/news" className="inline-block px-12 py-5 bg-white border border-charcoal/10 text-charcoal font-bold uppercase tracking-widest text-xs hover:bg-charcoal hover:text-white transition-all">
            Browse All News
          </Link>
        </div>
      </section>

      {/* Connect & Impact */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-charcoal p-16 md:p-24 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-parchment mb-6 leading-tight">Join our mission <br /> across the province.</h2>
              <p className="text-xl text-parchment/60 font-serif italic mb-8">Whether you want to support us, learn more, or partner with our initiatives, we are just a message away.</p>
              <button 
                onClick={() => setIsConnectOpen(true)}
                className="px-12 py-5 bg-gold text-charcoal font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-black/20"
              >
                Connect With Us
              </button>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:w-auto">
              <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm text-center">
                <Mail className="text-gold mx-auto mb-4" size={32} />
                <p className="text-parchment font-bold text-sm">info@punejesuits.org</p>
              </div>
              <div className="p-8 border border-white/10 bg-white/5 backdrop-blur-sm text-center">
                <Phone className="text-gold mx-auto mb-4" size={32} />
                <p className="text-parchment font-bold text-sm">+91 20 1234 5678</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-parchment py-24 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            {/* Column 1: Identity */}
            <div className="space-y-6 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-terracotta flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold tracking-tight text-white">Pune Province</h3>
              </div>
              <p className="text-parchment/40 font-serif italic text-sm leading-relaxed">
                &quot;Ad Maiorem Dei Gloriam&quot;<br />
                For the Greater Glory of God.<br />
                Serving the people of Maharashtra since 1992.
              </p>
            </div>

            {/* Column 2: Navigation */}
            <div className="text-center md:text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-8">Navigation</h4>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-sm font-medium text-parchment/60 hover:text-white transition-colors">About the Province</Link></li>
                <li><Link href="/news" className="text-sm font-medium text-parchment/60 hover:text-white transition-colors">Latest News</Link></li>
                <li><Link href="/map" className="text-sm font-medium text-parchment/60 hover:text-white transition-colors">Activity Map</Link></li>
              </ul>
            </div>

            {/* Column 3: Administration */}
            <div className="text-center md:text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-8">Resources</h4>
              <ul className="space-y-4">
                <li><Link href="/admin" className="text-sm font-medium text-parchment/60 hover:text-white transition-colors">Admin Dashboard</Link></li>
                <li><a href="#" className="text-sm font-medium text-parchment/60 hover:text-white transition-colors">Province Website</a></li>
                <li><a href="#" className="text-sm font-medium text-parchment/60 hover:text-white transition-colors">Legal & Privacy</a></li>
              </ul>
            </div>

            {/* Column 4: Contact */}
            <div className="text-center md:text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-8">Engagement</h4>
              <div className="space-y-6">
                <p className="text-sm text-parchment/60 font-serif italic">Would you like to partner with our mission?</p>
                <button 
                  onClick={() => setIsConnectOpen(true)}
                  className="w-full py-4 border border-gold text-gold hover:bg-gold hover:text-charcoal transition-all font-bold uppercase tracking-widest text-[10px]"
                >
                  Connect With Us
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-parchment/20">
              © {new Date().getFullYear()} Jesuit Pune Province. All Rights Reserved.
            </div>
            <div className="flex gap-8">
              <Compass className="w-5 h-5 text-white/10" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
