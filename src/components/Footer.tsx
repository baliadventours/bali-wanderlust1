import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h2 className="text-3xl font-black mb-6">TourSphere</h2>
          <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
            Crafting unforgettable journeys for the curious and the brave. Explore the world's most breathtaking destinations with expert guidance.
          </p>
        </div>
        <div>
          <h4 className="font-black mb-6 uppercase tracking-widest text-xs text-slate-500">Platform</h4>
          <ul className="space-y-4 font-bold">
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Expeditions</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Destinations</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Guides</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-black mb-6 uppercase tracking-widest text-xs text-slate-500">Support</h4>
          <ul className="space-y-4 font-bold">
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-slate-800 text-slate-500 text-sm font-bold">
        © 2026 TourSphere. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
