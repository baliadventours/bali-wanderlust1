
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  Info, List, DollarSign, Calendar, ShieldCheck, Loader2, Upload, MessageSquare, ListTodo,
  CheckCircle, ArrowLeft, AlertCircle, Users as UsersIcon, Tag
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminTour } from '../hooks/useAdminData';
import { useTourMutation } from '../hooks/useTourMutation';
import { uploadToImgBB } from '../../../lib/imgbb';
import { supabase, isConfigured } from '../../../lib/supabase';
// Added missing import for getTranslation
import { getTranslation } from '../../../utils/currency';

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 border-b-2 font-bold text-[10px] uppercase tracking-widest transition-all ${
      active ? 'border-emerald-600 text-emerald-600 bg-emerald-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const PricingTierEditor = ({ packageIndex, control, register }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `pricing_packages.${packageIndex}.price_tiers`
  });

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <UsersIcon className="w-3 h-3" /> Participant Tiers & Pricing
        </label>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {fields.map((tier, tierIdx) => (
          <div key={tier.id} className="flex gap-4 items-center animate-in slide-in-from-left-1">
            <div className="flex-grow grid grid-cols-2 gap-4">
              <div className="relative">
                <input 
                  type="number" 
                  {...register(`pricing_packages.${packageIndex}.price_tiers.${tierIdx}.people`)}
                  placeholder="Count"
                  className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg font-bold text-xs outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">QTY</span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  {...register(`pricing_packages.${packageIndex}.price_tiers.${tierIdx}.price`)}
                  placeholder="Price"
                  className="w-full pl-10 pr-4 py-2 bg-white border rounded-lg font-bold text-xs outline-none text-emerald-600"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">$</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => remove(tierIdx)}
              className="p-2 text-rose-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      <button 
        type="button" 
        onClick={() => append({ people: fields.length + 1, price: 0 })}
        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
      >
        <Plus className="w-3 h-3" /> Add Tier
      </button>
    </div>
  );
};

export const TourEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tour, isLoading, error } = useAdminTour(id);
  const mutation = useTourMutation();
  const [activeTab, setActiveTab] = useState('basic');
  const [isUploading, setIsUploading] = useState(false);
  const [meta, setMeta] = useState<{cats: any[], dests: any[], facts: any[], tours: any[]}>({cats: [], dests: [], facts: [], tours: []});

  const isCreatePage = !id || id === 'create';

  useEffect(() => {
    const fetchMeta = async () => {
      if (!isConfigured) {
        setMeta({
          cats: [{ id: 'cat-cul', name: 'Cultural' }, { id: 'cat-adv', name: 'Adventure' }],
          dests: [{ id: 'bali', name: 'Bali' }, { id: 'iceland', name: 'Iceland' }],
          facts: [{ id: 'f-dur', name: 'Duration', icon: 'clock' }, { id: 'f-dif', name: 'Difficulty', icon: 'zap' }],
          tours: [{ id: 'b1', title: { en: 'Mount Batur Trek' } }, { id: 'b2', title: { en: 'Ayung River Rafting' } }]
        });
        return;
      }
      try {
        const [c, d, f, t] = await Promise.all([
          supabase.from('tour_categories').select('*'),
          supabase.from('destinations').select('*'),
          supabase.from('tour_facts').select('*'),
          supabase.from('tours').select('id, title')
        ]);
        setMeta({ cats: c.data || [], dests: d.data || [], facts: f.data || [], tours: t.data || [] });
      } catch (err) {
        console.error("Failed to load metadata", err);
      }
    };
    fetchMeta();
  }, []);

  const methods = useForm({
    defaultValues: {
      title: { en: '' }, slug: '', status: 'draft', description: { en: '' }, category_id: '', destination_id: '',
      important_info: { en: '' }, booking_policy: { en: '' },
      itineraries: [], gallery: [], highlights: [], inclusions: [], faqs: [], reviews: [], facts: [], pricing_packages: [],
      related_tour_ids: []
    }
  });

  useEffect(() => {
    if (tour) {
      methods.reset({
        ...tour,
        title: tour.title || { en: '' },
        description: tour.description || { en: '' },
        important_info: tour.important_info || { en: '' },
        booking_policy: tour.booking_policy || { en: '' },
        itineraries: tour.itineraries || [],
        gallery: tour.gallery || [],
        highlights: tour.highlights || [],
        inclusions: tour.inclusions || [],
        faqs: tour.faqs || [],
        reviews: tour.reviews || [],
        facts: tour.facts || [],
        pricing_packages: (tour.pricing_packages || []).map((p: any) => ({
          ...p,
          price_tiers: Array.isArray(p.price_tiers) ? p.price_tiers : []
        })),
        related_tour_ids: tour.related_tour_ids || []
      });
    }
  }, [tour, methods]);

  const { fields: itineraries, append: appendItinerary, remove: removeItinerary } = useFieldArray({ control: methods.control, name: "itineraries" });
  const { fields: gallery, append: appendGallery, remove: removeGallery } = useFieldArray({ control: methods.control, name: "gallery" });
  const { fields: highlights, append: appendHighlight, remove: removeHighlight } = useFieldArray({ control: methods.control, name: "highlights" });
  const { fields: inclusions, append: appendInclusion, remove: removeInclusion } = useFieldArray({ control: methods.control, name: "inclusions" });
  const { fields: faqs, append: appendFaq, remove: removeFaq } = useFieldArray({ control: methods.control, name: "faqs" });
  const { fields: reviews, append: appendReview, remove: removeReview } = useFieldArray({ control: methods.control, name: "reviews" });
  const { fields: pricing, append: appendPricing, remove: removePricing } = useFieldArray({ control: methods.control, name: "pricing_packages" });
  const { fields: facts, append: appendFact, remove: removeFact } = useFieldArray({ control: methods.control, name: "facts" });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      callback(url);
    } catch (err) { alert("Upload failed."); } finally { setIsUploading(false); }
  };

  const onSubmit = async (data: any) => {
    try {
      await mutation.mutateAsync({ ...data, id: isCreatePage ? 'create' : id });
      navigate('/admin/tours');
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="text-center"><Loader2 className="animate-spin text-emerald-600 w-10 h-10 mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Assembling Expedition UI...</p></div></div>;

  if (error || (!tour && !isCreatePage)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center p-8 bg-slate-50">
        <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500 shadow-sm border border-rose-100">
           <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Expedition Data Unavailable</h2>
        <p className="text-slate-500 text-sm font-medium mb-8 max-w-md">We couldn't retrieve the record or the system is experiencing a synchronization issue. Please check your network or try again.</p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/admin/tours')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </button>
          <button onClick={() => window.location.reload()} className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-50">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-lg"><X className="w-6 h-6 text-slate-400" /></button>
            <h1 className="text-2xl font-black text-slate-900">{isCreatePage ? 'Assemble Expedition' : 'Refine Expedition'}</h1>
          </div>
          <button type="submit" disabled={mutation.isPending} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all">
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />} Save Product
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} label="Core" icon={Info} />
            <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} label="Narrative" icon={List} />
            <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} label="Itinerary" icon={Calendar} />
            <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} label="Packages" icon={DollarSign} />
            <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} label="Gallery" icon={ImageIcon} />
            <TabButton active={activeTab === 'inclusions'} onClick={() => setActiveTab('inclusions')} label="Inclusions" icon={ListTodo} />
            <TabButton active={activeTab === 'policy'} onClick={() => setActiveTab('policy')} label="Rules" icon={ShieldCheck} />
            <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} label="Social" icon={MessageSquare} />
          </div>

          <div className="p-10">
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public Title (EN)</label>
                    <input {...methods.register('title.en')} required className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="e.g. Hidden Bali Waterfalls" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Segment (Slug)</label>
                    <input {...methods.register('slug')} required className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="hidden-bali-waterfalls" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                    <select {...methods.register('category_id')} className="w-full p-4 bg-slate-50 border rounded-xl outline-none">
                      <option value="">Select...</option>
                      {meta.cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination Hub</label>
                    <select {...methods.register('destination_id')} className="w-full p-4 bg-slate-50 border rounded-xl outline-none">
                      <option value="">Select...</option>
                      {meta.dests.map(d => <option key={d.id} value={d.id}>{getTranslation(d.name, 'en')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Status</label>
                    <select {...methods.register('status')} className="w-full p-4 bg-slate-50 border rounded-xl outline-none">
                      <option value="draft">Draft (Hidden)</option>
                      <option value="published">Published (Live)</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2"><ListTodo className="w-4 h-4" /> Quick Facts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {facts.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <select {...methods.register(`facts.${index}.fact_id`)} className="p-2 bg-white border rounded-lg flex-grow text-xs outline-none">
                          <option value="">Attribute...</option>
                          {meta.facts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <input {...methods.register(`facts.${index}.value`)} className="p-2 bg-white border rounded-lg w-32 text-xs outline-none" placeholder="e.g. 4 Hours" />
                        <button type="button" onClick={() => removeFact(index)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => appendFact({ fact_id: '', value: '' })} className="flex items-center gap-2 text-emerald-600 text-xs font-bold hover:bg-emerald-50 p-3 rounded-xl transition-all w-fit border border-dashed border-emerald-200"><Plus className="w-4 h-4" /> Add Metric</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Narrative (EN)</label>
                  <textarea {...methods.register('description.en')} rows={6} className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="Narrate the adventure..." />
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest">Expedition Highlights</h3>
                  <div className="space-y-3">
                    {highlights.map((field, index) => (
                      <div key={field.id} className="flex gap-2 group">
                        <input {...methods.register(`highlights.${index}.content`)} className="flex-grow p-4 bg-slate-50 border rounded-xl outline-none group-hover:border-emerald-200 transition-colors" placeholder="e.g. Visit 3 secret waterfalls" />
                        <button type="button" onClick={() => removeHighlight(index)} className="text-rose-500 p-2"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => appendHighlight({ content: '' })} className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-xs"><Plus className="w-4 h-4" /> Add Highlight</button>
                </div>
                <div className="pt-6 border-t border-slate-100">
                   <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest">Related Adventures</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {meta.tours.filter(t => t.id !== id).map(t => (
                       <label key={t.id} className="flex items-center gap-3 p-4 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100 transition-colors border-slate-200">
                         <input type="checkbox" {...methods.register('related_tour_ids')} value={t.id} className="w-4 h-4 rounded text-emerald-600" />
                         <span className="text-xs font-bold text-slate-700">{typeof t.title === 'string' ? t.title : (t.title?.en || 'Untitled')}</span>
                       </label>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-6 animate-in fade-in">
                {itineraries.map((field, index) => (
                  <div key={field.id} className="p-8 bg-slate-50 border rounded-xl relative group border-slate-200">
                    <button type="button" onClick={() => removeItinerary(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-12 md:col-span-3 space-y-4">
                        <label className="block aspect-video bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group-hover:border-emerald-300 transition-colors">
                           <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => methods.setValue(`itineraries.${index}.image_url`, url))} />
                           {methods.watch(`itineraries.${index}.image_url`) ? (
                             <img src={methods.watch(`itineraries.${index}.image_url`)} className="w-full h-full object-cover" alt="Itinerary Frame" />
                           ) : (
                             <div className="text-center p-4">
                               <ImageIcon className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Add Frame</span>
                             </div>
                           )}
                           {isUploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                           <input {...methods.register(`itineraries.${index}.day_number`)} type="number" placeholder="Day" className="p-3 bg-white border rounded-lg text-xs font-bold text-center outline-none" />
                           <input {...methods.register(`itineraries.${index}.time_label`)} placeholder="Time" className="p-3 bg-white border rounded-lg text-xs font-bold text-center outline-none" />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-9 space-y-4">
                        <input {...methods.register(`itineraries.${index}.title.en`)} placeholder="Segment Heading" className="w-full p-4 bg-white border rounded-xl font-bold outline-none border-slate-200" />
                        <textarea {...methods.register(`itineraries.${index}.description.en`)} rows={4} placeholder="Narrative for this segment..." className="w-full p-4 bg-white border rounded-xl text-sm outline-none border-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendItinerary({ title: { en: '' }, description: { en: '' }, day_number: itineraries.length + 1 })} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Expand Trip Timeline
                </button>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in">
                {pricing.map((field, index) => (
                  <div key={field.id} className="p-8 bg-slate-50 border rounded-xl border-emerald-100 relative group">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-emerald-900 uppercase tracking-widest text-xs flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Package #{index + 1}
                      </h4>
                      <button type="button" onClick={() => removePricing(index)} className="text-rose-400 hover:text-rose-600 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display Name</label>
                          <input 
                            {...methods.register(`pricing_packages.${index}.package_name`)} 
                            className="w-full p-3 bg-white border rounded-xl font-bold text-sm outline-none" 
                            placeholder="e.g. Standard Entry / Private VIP" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclusions Summary</label>
                          <textarea 
                            {...methods.register(`pricing_packages.${index}.description`)} 
                            rows={3}
                            className="w-full p-3 bg-white border rounded-xl text-xs outline-none" 
                            placeholder="Briefly describe what this specific package offers" 
                          />
                        </div>
                      </div>

                      <PricingTierEditor 
                        packageIndex={index} 
                        control={methods.control} 
                        register={methods.register} 
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  type="button" 
                  onClick={() => appendPricing({ package_name: '', description: '', price_tiers: [{ people: 1, price: 0 }] })} 
                  className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="w-6 h-6" />
                  <span>Construct New Pricing Package</span>
                </button>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in">
                {gallery.map((field, index) => (
                  <div key={field.id} className="aspect-square relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    <img src={methods.watch(`gallery.${index}.image_url`)} className="w-full h-full object-cover" alt="Gallery item" />
                    <button type="button" onClick={() => removeGallery(index)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all relative">
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => appendGallery({ image_url: url }))} />
                  {isUploading ? <Loader2 className="animate-spin text-emerald-600" /> : <Upload className="text-slate-300 w-8 h-8" />}
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store Frame</span>
                </label>
              </div>
            )}

            {activeTab === 'inclusions' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Coverage</h3>
                  {inclusions.map((field, index) => methods.watch(`inclusions.${index}.type`) === 'include' ? (
                    <div key={field.id} className="flex gap-2">
                       <input {...methods.register(`inclusions.${index}.content`)} className="flex-grow p-3 bg-slate-50 border rounded-xl text-sm outline-none border-slate-200" placeholder="e.g. Bottled Water" />
                       <button type="button" onClick={() => removeInclusion(index)} className="text-rose-500 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ) : null)}
                  <button type="button" onClick={() => appendInclusion({ content: '', type: 'include' })} className="text-xs font-bold text-emerald-600 hover:underline">+ Item Included</button>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2"><X className="w-4 h-4" /> Exclusions</h3>
                  {inclusions.map((field, index) => methods.watch(`inclusions.${index}.type`) === 'exclude' ? (
                    <div key={field.id} className="flex gap-2">
                       <input {...methods.register(`inclusions.${index}.content`)} className="flex-grow p-3 bg-slate-50 border rounded-xl text-sm outline-none border-slate-200" placeholder="e.g. Tips & Gratuities" />
                       <button type="button" onClick={() => removeInclusion(index)} className="text-rose-500 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ) : null)}
                  <button type="button" onClick={() => appendInclusion({ content: '', type: 'exclude' })} className="text-xs font-bold text-rose-600 hover:underline">+ Item Excluded</button>
                </div>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="space-y-8 animate-in fade-in">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Crucial Information (EN)</label>
                    <textarea {...methods.register('important_info.en')} rows={6} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" placeholder="e.g. Bring extra clothes..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking Protocol (EN)</label>
                    <textarea {...methods.register('booking_policy.en')} rows={6} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" placeholder="e.g. Free cancellation 24h before..." />
                 </div>
                 <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-900 mb-6 uppercase tracking-widest">Frequently Asked Questions</h3>
                    {faqs.map((field, index) => (
                      <div key={field.id} className="p-6 bg-slate-50 border rounded-xl mb-4 relative border-slate-200">
                        <button type="button" onClick={() => removeFaq(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        <div className="space-y-4">
                           <input {...methods.register(`faqs.${index}.question`)} className="w-full p-3 bg-white border border-slate-200 rounded-lg font-bold text-sm outline-none" placeholder="Question" />
                           <textarea {...methods.register(`faqs.${index}.answer`)} rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm outline-none" placeholder="Detailed answer..." />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => appendFaq({ question: '', answer: '' })} className="flex items-center gap-2 text-indigo-600 font-bold text-xs"><Plus className="w-4 h-4" /> Add FAQ Entry</button>
                 </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-100 text-center mb-8">
                   <h3 className="font-bold text-emerald-900 mb-2">Social Proof Management</h3>
                   <p className="text-emerald-700 text-xs mb-6">Manually seed verified reviews or testimonials.</p>
                   <button type="button" onClick={() => appendReview({ reviewer_name: '', rating: 5, comment: '' })} className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold text-xs shadow-lg hover:bg-emerald-700 transition-all">Add Review Record</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((field, index) => (
                    <div key={field.id} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm relative">
                       <button type="button" onClick={() => removeReview(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                       <div className="space-y-4">
                          <div className="flex gap-4">
                             <input {...methods.register(`reviews.${index}.reviewer_name`)} className="flex-grow p-3 bg-slate-50 border border-slate-100 rounded-lg font-bold text-xs outline-none" placeholder="Full Name" />
                             <select {...methods.register(`reviews.${index}.rating`)} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs font-black text-amber-500 outline-none">
                               {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                             </select>
                          </div>
                          <textarea {...methods.register(`reviews.${index}.comment`)} rows={3} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none" placeholder="Testimonial text..." />
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
<input name="price" />
{
  name: "",
  pricing_tiers: [
    { min_pax: 1, max_pax: 2, price_per_person: 100 }
  ]
}
