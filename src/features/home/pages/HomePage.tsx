import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Shield, Zap } from 'lucide-react';
import Container from '../../../components/Container';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-60"
            alt="Hero"
          />
        </div>
        
        <Container className="relative z-10">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 bg-emerald-600/20 backdrop-blur-md border border-emerald-500/30 px-4 py-2 rounded-full text-emerald-400 text-sm font-black uppercase tracking-widest">
              <Zap className="w-4 h-4" /> New Expeditions Available
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
              EXPLORE THE <br /> <span className="text-emerald-500">UNEXPLORED.</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
              Join our expert-led expeditions to the world's most remote and breathtaking locations. Hand-crafted journeys for the modern explorer.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/tours" className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/20">
                View Expeditions <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                Our Story
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Global Reach</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Operating in over 40 countries across 6 continents, bringing you closer to the world's hidden gems.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Safety First</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Your safety is our priority. All expeditions are led by certified professionals with years of field experience.
            </p>
          </div>
          <div className="space-y-6">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Expert Guides</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Learn from the best. Our guides are local experts, historians, and naturalists who bring every story to life.
            </p>
          </div>
        </div>
      </Container>

      {/* CTA Section */}
      <section className="bg-slate-900 py-32 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
           <div className="w-full h-full bg-gradient-to-l from-emerald-500 to-transparent blur-3xl"></div>
        </div>
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="max-w-2xl space-y-8">
              <h2 className="text-5xl font-black text-white leading-tight">Ready to start your next <span className="text-emerald-500">adventure?</span></h2>
              <p className="text-xl text-slate-400 font-medium">
                Subscribe to our newsletter and get exclusive access to early-bird pricing and secret expeditions.
              </p>
              <div className="flex gap-4">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all">
                  Subscribe
                </button>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3">
              <img 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover"
                alt="Adventure"
              />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;
