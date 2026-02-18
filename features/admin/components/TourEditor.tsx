
import React, { useState } from 'react';
import { Save, X, Image as ImageIcon, Plus, Calendar, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TourEditor: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'pricing'>('details');

  const tabs = [
    { id: 'details', label: 'Tour Details', icon: Info },
    { id: 'itinerary', label: 'Day-by-Day', icon: Calendar },
    { id: 'pricing', label: 'Pricing & Slots', icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Create New Adventure</h1>
            <p className="text-slate-500 text-sm italic">New Tour Draft</p>
          </div>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100">
          <Save className="w-5 h-5" />
          Publish Tour
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row">
        {/* Editor Sidebar */}
        <aside className="w-full md:w-64 border-r border-slate-100 p-6 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Editor Content */}
        <div className="flex-grow p-10">
          {activeTab === 'details' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tour Title (English)</label>
                <input type="text" placeholder="e.g., Arctic Northern Lights Expedition" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Base Price (USD)</label>
                  <input type="number" placeholder="899" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Participants</label>
                  <input type="number" placeholder="12" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/10" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Gallery Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase">Upload</span>
                  </button>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl relative">
                <div className="absolute -left-3 top-6 w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-900 shadow-sm">1</div>
                <div className="space-y-4 ml-6">
                  <input type="text" placeholder="Day Title" className="w-full bg-transparent border-b border-slate-200 py-2 font-bold outline-none focus:border-indigo-500" />
                  <textarea placeholder="Describe the activities for this day..." className="w-full bg-transparent text-sm text-slate-600 outline-none h-24" />
                </div>
              </div>
              <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                <Plus className="w-4 h-4" />
                Add Another Day
              </button>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="bg-indigo-900 p-8 rounded-3xl text-white">
                  <h3 className="text-lg font-bold mb-2">Automated Availability</h3>
                  <p className="text-indigo-200 text-sm mb-6">Generated slots based on recurring rules.</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl">
                      <Calendar className="w-5 h-5 text-indigo-300" />
                      <div>
                        <div className="text-sm font-bold">Every Tuesday & Thursday</div>
                        <div className="text-xs text-indigo-200">Starting July 2024 - Dec 2024</div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
