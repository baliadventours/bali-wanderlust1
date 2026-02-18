
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  MapPin, Tag, Info, List, DollarSign, Calendar, HelpCircle, Star, 
  ShieldCheck, Loader2, Upload, MessageSquare, ListTodo, Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminTour } from '../hooks/useAdminData';
import { useTourMutation } from '../hooks/useTourMutation';
import { uploadToImgBB } from '../../../lib/imgbb';
import { supabase } from '../../../lib/supabase';

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

export const TourEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: tour, isLoading } = useAdminTour(id);
  const mutation = useTourMutation();
  const [activeTab, setActiveTab] = useState('basic');
  const [isUploading, setIsUploading] = useState(false);
  const [meta, setMeta] = useState<{cats: any[], dests: any[], facts: any[], tours: any[]}>({cats: [], dests: [], facts: [], tours: []});

  useEffect(() => {
    const fetchMeta = async () => {
      const [c, d, f, t] = await Promise.all([
        supabase.from('tour_categories').select('*'),
        supabase.from('destinations').select('*'),
        supabase.from('tour_facts').select('*'),
        supabase.from('tours').select('id, title')
      ]);
      setMeta({ cats: c.data || [], dests: d.data || [], facts: f.data || [], tours: t.data || [] });
    };
    fetchMeta();
  }, []);

  const methods = useForm({
    defaultValues: {
      title: '', slug: '', status: 'draft', description: '', category_id: '', destination_id: '',
      important_info: '', booking_policy: '',
      itineraries: [], gallery: [], highlights: [], inclusions: [], faqs: [], reviews: [], facts: [], pricing_packages: [],
      related_tour_ids: []
    }
  });

  useEffect(() => {
    if (tour) methods.reset(tour);
  }, [tour, methods]);

  const { fields: itineraries, append: appendItinerary, remove: removeItinerary } = useFieldArray({ control: methods.control, name: "itineraries" });
  const { fields: gallery, append: appendGallery, remove: removeGallery } = useFieldArray({ control: methods.control, name: "gallery" });
  const { fields: highlights, append: appendHighlight, remove: removeHighlight } = useFieldArray({ control: methods.control, name: "highlights" });
  const { fields: inclusions, append: appendInclusion, remove: removeInclusion } = useFieldArray({ control: methods.control, name: "inclusions" });
  const { fields: faqs, append: appendFaq, remove: removeFaq } = useFieldArray({ control: methods.control, name: "faqs" });
  const { fields: reviews, append: appendReview, remove: removeReview } = useFieldArray({ control: methods.control, name: "reviews" });
  const { fields: pricing, append: appendPricing, remove: removePricing } = useFieldArray({ control: methods.control, name: "pricing_packages" });
  const { fields: facts, append: appendFact, remove: removeFact } = useFieldArray({ control: methods.control, name: "facts" });

  const handleImageUpload = async (e: any, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      callback(url);
    } catch (err) { alert("Upload failed"); } finally { setIsUploading(false); }
  };

  const onSubmit = async (data: any) => {
    try {
      await mutation.mutateAsync(data);
      navigate('/admin/tours');
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-50">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-lg"><X className="w-6 h-6 text-slate-400" /></button>
            <h1 className="text-2xl font-black text-slate-900">{id === 'create' ? 'Assemble Expedition' : 'Refine Expedition'}</h1>
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
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public Title</label>
                    <input {...methods.register('title')} required className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="e.g. Hidden Bali Waterfalls" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">URL Segment (Slug)</label>
                    <input {...methods.register('slug')} required className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="hidden-bali-waterfalls" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                    <select {...methods.register('category_id')} className="w-full p-4 bg-slate-50 border rounded-xl">
                      <option value="">Select...</option>
                      {meta.cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination</label>
                    <select {...methods.register('destination_id')} className="w-full p-4 bg-slate-50 border rounded-xl">
                      <option value="">Select...</option>
                      {meta.dests.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Status</label>
                    <select {...methods.register('status')} className="w-full p-4 bg-slate-50 border rounded-xl">
                      <option value="draft">Draft (Hidden)</option>
                      <option value="published">Published (Live)</option>
                    </select>
                  </div>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest">Quick Facts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {facts.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-center">
                        <select {...methods.register(`facts.${index}.fact_id`)} className="p-3 bg-slate-50 border rounded-xl flex-grow text-xs">
                          <option value="">Select Fact Type...</option>
                          {meta.facts.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <input {...methods.register(`facts.${index}.value`)} className="p-3 bg-slate-50 border rounded-xl w-32 text-xs" placeholder="Value (e.g. 4 Hours)" />
                        <button type="button" onClick={() => removeFact(index)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => appendFact({ fact_id: '', value: '' })} className="flex items-center gap-2 text-emerald-600 text-xs font-bold"><Plus className="w-4 h-4" /> Add Fact</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Description</label>
                  <textarea {...methods.register('description')} rows={6} className="w-full p-4 bg-slate-50 border rounded-xl" />
                </div>
                <div className="pt-6 border-t">
                  <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest">Expedition Highlights</h3>
                  {highlights.map((field, index) => (
                    <div key={field.id} className="flex gap-2 mb-3">
                      <input {...methods.register(`highlights.${index}.content`)} className="flex-grow p-4 bg-slate-50 border rounded-xl" placeholder="e.g. Visit 3 secret waterfalls" />
                      <button type="button" onClick={() => removeHighlight(index)} className="text-rose-500"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendHighlight({ content: '' })} className="flex items-center gap-2 text-emerald-600 font-bold text-xs"><Plus className="w-4 h-4" /> Add Highlight</button>
                </div>
                <div className="pt-6 border-t">
                   <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest">Related Adventures</h3>
                   <div className="grid grid-cols-2 gap-4">
                     {meta.tours.filter(t => t.id !== id).map(t => (
                       <label key={t.id} className="flex items-center gap-3 p-4 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100">
                         <input type="checkbox" {...methods.register('related_tour_ids')} value={t.id} className="w-4 h-4 rounded text-emerald-600" />
                         <span className="text-xs font-bold text-slate-700">{t.title}</span>
                       </label>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {itineraries.map((field, index) => (
                  <div key={field.id} className="p-8 bg-slate-50 border rounded-xl relative group">
                    <button type="button" onClick={() => removeItinerary(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    <div className="grid grid-cols-12 gap-8">
                      <div className="col-span-3 space-y-4">
                        <label className="block aspect-video bg-white border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                           <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => methods.setValue(`itineraries.${index}.image_url`, url))} />
                           {methods.watch(`itineraries.${index}.image_url`) ? (
                             <img src={methods.watch(`itineraries.${index}.image_url`)} className="w-full h-full object-cover" />
                           ) : (
                             <div className="text-center">
                               <Upload className="w-6 h-6 mx-auto text-slate-300 mb-2" />
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Add Frame</span>
                             </div>
                           )}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                           <input {...methods.register(`itineraries.${index}.day_number`)} type="number" placeholder="Day" className="p-3 bg-white border rounded-lg text-xs font-bold text-center" />
                           <input {...methods.register(`itineraries.${index}.time_label`)} placeholder="Time (opt)" className="p-3 bg-white border rounded-lg text-xs font-bold text-center" />
                        </div>
                      </div>
                      <div className="col-span-9 space-y-4">
                        <input {...methods.register(`itineraries.${index}.title`)} placeholder="Segment Heading" className="w-full p-4 bg-white border rounded-xl font-bold" />
                        <textarea {...methods.register(`itineraries.${index}.description`)} rows={4} placeholder="Narrative for this segment..." className="w-full p-4 bg-white border rounded-xl text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendItinerary({ title: '', day_number: itineraries.length + 1 })} className="w-full py-6 border-2 border-dashed rounded-xl text-slate-400 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Expand Itinerary
                </button>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                {pricing.map((field, index) => (
                  <div key={field.id} className="p-8 bg-slate-50 border rounded-xl border-emerald-100">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-emerald-900 uppercase tracking-widest text-xs flex items-center gap-2"><Tag className="w-4 h-4" /> Package #{index + 1}</h4>
                      <button type="button" onClick={() => removePricing(index)} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Package Name</label>
                        <input {...methods.register(`pricing_packages.${index}.package_name`)} className="w-full p-3 bg-white border rounded-xl font-bold" placeholder="e.g. Standard Entry" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Base Price (USD)</label>
                        <input {...methods.register(`pricing_packages.${index}.base_price`)} type="number" className="w-full p-3 bg-white border rounded-xl font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase">Min</label>
                           <input {...methods.register(`pricing_packages.${index}.min_people`)} type="number" className="w-full p-3 bg-white border rounded-xl font-bold" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[10px] font-bold text-slate-400 uppercase">Max</label>
                           <input {...methods.register(`pricing_packages.${index}.max_people`)} type="number" className="w-full p-3 bg-white border rounded-xl font-bold" />
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendPricing({ package_name: '', base_price: 0, min_people: 1, max_people: 10 })} className="w-full py-6 border-2 border-dashed rounded-xl text-slate-400 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                   <Plus className="w-5 h-5" /> Add Pricing Tier
                </button>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-4 gap-6">
                {gallery.map((field, index) => (
                  <div key={field.id} className="aspect-square relative rounded-xl overflow-hidden bg-slate-100 border group">
                    <img src={methods.watch(`gallery.${index}.image_url`)} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGallery(index)} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all">
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => appendGallery({ image_url: url }))} />
                  {isUploading ? <Loader2 className="animate-spin text-emerald-600" /> : <Upload className="text-slate-300 w-8 h-8" />}
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Add To Vault</span>
                </label>
              </div>
            )}

            {activeTab === 'inclusions' && (
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Included</h3>
                  {inclusions.filter(i => methods.watch(`inclusions.${inclusions.indexOf(i)}.type`) === 'include').map((field, idx) => (
                    <div key={field.id} className="flex gap-2">
                       <input {...methods.register(`inclusions.${inclusions.indexOf(field)}.content`)} className="flex-grow p-3 bg-slate-50 border rounded-xl text-sm" />
                       <button type="button" onClick={() => removeInclusion(inclusions.indexOf(field))} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendInclusion({ content: '', type: 'include' })} className="text-xs font-bold text-emerald-600">+ Add In</button>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2"><X className="w-4 h-4" /> Excluded</h3>
                  {inclusions.filter(i => methods.watch(`inclusions.${inclusions.indexOf(i)}.type`) === 'exclude').map((field, idx) => (
                    <div key={field.id} className="flex gap-2">
                       <input {...methods.register(`inclusions.${inclusions.indexOf(field)}.content`)} className="flex-grow p-3 bg-slate-50 border rounded-xl text-sm" />
                       <button type="button" onClick={() => removeInclusion(inclusions.indexOf(field))} className="text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendInclusion({ content: '', type: 'exclude' })} className="text-xs font-bold text-rose-600">+ Add Ex</button>
                </div>
              </div>
            )}

            {activeTab === 'policy' && (
              <div className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Important Participant Information</label>
                    <textarea {...methods.register('important_info')} rows={6} className="w-full p-4 bg-slate-50 border rounded-xl text-sm" placeholder="e.g. Bring extra clothes, sunscreen, water..." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Booking & Refund Policy</label>
                    <textarea {...methods.register('booking_policy')} rows={6} className="w-full p-4 bg-slate-50 border rounded-xl text-sm" placeholder="e.g. Free cancellation 24h before..." />
                 </div>
                 <div className="pt-6 border-t">
                    <h3 className="text-xs font-bold text-slate-900 mb-6 uppercase tracking-widest">Frequently Asked Questions</h3>
                    {faqs.map((field, index) => (
                      <div key={field.id} className="p-6 bg-slate-50 border rounded-xl mb-4 relative">
                        <button type="button" onClick={() => removeFaq(index)} className="absolute top-4 right-4 text-slate-300"><Trash2 className="w-4 h-4" /></button>
                        <div className="space-y-4">
                           <input {...methods.register(`faqs.${index}.question`)} className="w-full p-3 bg-white border rounded-lg font-bold text-sm" placeholder="Question" />
                           <textarea {...methods.register(`faqs.${index}.answer`)} rows={3} className="w-full p-3 bg-white border rounded-lg text-sm" placeholder="Detailed answer..." />
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => appendFaq({ question: '', answer: '' })} className="flex items-center gap-2 text-indigo-600 font-bold text-xs"><Plus className="w-4 h-4" /> Add FAQ</button>
                 </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-8 rounded-xl border-2 border-dashed border-slate-200 text-center mb-8">
                   <h3 className="font-bold text-slate-900 mb-2">Internal Reviews</h3>
                   <p className="text-slate-500 text-xs mb-6">Manually seed or manage verified reviews for this tour.</p>
                   <button type="button" onClick={() => appendReview({ reviewer_name: '', rating: 5, comment: '' })} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold text-xs shadow-xl">Inject Review</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {reviews.map((field, index) => (
                    <div key={field.id} className="p-6 bg-white border rounded-xl shadow-sm relative">
                       <button type="button" onClick={() => removeReview(index)} className="absolute top-4 right-4 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                       <div className="space-y-4">
                          <div className="flex gap-4">
                             <input {...methods.register(`reviews.${index}.reviewer_name`)} className="flex-grow p-3 bg-slate-50 border rounded-lg font-bold text-xs" placeholder="Full Name" />
                             <select {...methods.register(`reviews.${index}.rating`)} className="p-3 bg-slate-50 border rounded-lg text-xs font-black text-amber-500">
                               {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                             </select>
                          </div>
                          <textarea {...methods.register(`reviews.${index}.comment`)} rows={3} className="w-full p-3 bg-slate-50 border rounded-lg text-xs" placeholder="Review comment..." />
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
