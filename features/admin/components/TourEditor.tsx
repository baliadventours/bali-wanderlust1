import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { 
  Save, X, Plus, Trash2, Image as ImageIcon, 
  MapPin, Tag, Info, List, DollarSign, Calendar, HelpCircle, Star, Link as LinkIcon,
  Loader2, Upload, ShieldCheck, CheckCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminTour } from '../hooks/useAdminData';
import { useTourMutation } from '../hooks/useTourMutation';
import { uploadToImgBB } from '../../../lib/imgbb';

const TabButton = ({ active, onClick, label, icon: Icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 border-b-2 font-bold text-xs uppercase tracking-widest transition-all ${
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

  // Fix: Added missing fields to defaultValues to satisfy TypeScript's register constraints
  const methods = useForm({
    defaultValues: {
      title: '', slug: '', status: 'draft' as 'draft' | 'published', description: '',
      itineraries: [] as any[], gallery: [] as any[], highlights: [] as any[],
      category_id: '', destination_id: '', base_price_usd: 0,
      min_participants: 1, max_participants: 10
    }
  });

  useEffect(() => {
    if (tour) {
      methods.reset({
        ...tour,
        title: tour.title?.en || tour.title || '',
        description: tour.description?.en || tour.description || '',
      });
    }
  }, [tour, methods]);

  const { fields: itineraries, append: appendItinerary, remove: removeItinerary } = useFieldArray({
    control: methods.control,
    name: "itineraries"
  });

  const { fields: gallery, append: appendGallery, remove: removeGallery } = useFieldArray({
    control: methods.control,
    name: "gallery"
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadToImgBB(file);
      callback(url);
    } catch (err) {
      alert("Upload failed. Ensure VITE_IMGBB_API_KEY is configured.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await mutation.mutateAsync({ ...data, id: id === 'create' ? 'new' : id });
      navigate('/admin/tours');
    } catch (err: any) {
      alert(`Error saving tour: ${err.message}`);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-50/90 backdrop-blur-md py-4 z-50">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-lg">
              <X className="w-6 h-6 text-slate-400" />
            </button>
            <h1 className="text-2xl font-black text-slate-900">{id === 'create' ? 'New Expedition' : 'Edit Expedition'}</h1>
          </div>
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Product
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} label="Basic" icon={Info} />
            <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} label="Gallery" icon={ImageIcon} />
            <TabButton active={activeTab === 'itinerary'} onClick={() => setActiveTab('itinerary')} label="Itinerary" icon={Calendar} />
            <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')} label="Pricing" icon={DollarSign} />
          </div>

          <div className="p-10">
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product Title</label>
                    <input {...methods.register('title')} required className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="e.g. Grand Canyon Sunset Trek" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slug (URL)</label>
                    <input {...methods.register('slug')} required className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="grand-canyon-sunset" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea {...methods.register('description')} rows={5} className="w-full p-4 bg-slate-50 border rounded-xl outline-none" placeholder="Describe the adventure..." />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                    <select {...methods.register('category_id')} className="w-full p-4 bg-slate-50 border rounded-xl outline-none">
                      <option value="">Select Category...</option>
                      <option value="cat-1">Adventure</option>
                      <option value="cat-2">Cultural</option>
                      <option value="cat-3">Luxury</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                    <select {...methods.register('status')} className="w-full p-4 bg-slate-50 border rounded-xl outline-none">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {gallery.map((field, index) => (
                    <div key={field.id} className="aspect-video relative rounded-xl overflow-hidden bg-slate-100 group border">
                      <img src={methods.watch(`gallery.${index}.image_url`)} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeGallery(index)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all border-slate-200">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, (url) => appendGallery({ image_url: url }))}
                    />
                    {isUploading ? <Loader2 className="animate-spin text-emerald-600" /> : <Upload className="text-slate-400 w-6 h-6" />}
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Upload to ImgBB</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                {itineraries.map((field, index) => (
                  <div key={field.id} className="p-6 bg-slate-50 border rounded-xl relative border-slate-200">
                    <button type="button" onClick={() => removeItinerary(index)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-1">
                        <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">Day</label>
                        <input {...methods.register(`itineraries.${index}.day_number`)} type="number" className="w-full p-2 border rounded-lg text-center font-bold outline-none" placeholder="Day" />
                      </div>
                      <div className="md:col-span-11 space-y-4">
                        <input {...methods.register(`itineraries.${index}.title`)} className="w-full p-3 border rounded-xl font-bold outline-none" placeholder="Segment Title" />
                        <textarea {...methods.register(`itineraries.${index}.description`)} className="w-full p-3 border rounded-xl text-sm outline-none" placeholder="Detailed description..." rows={3} />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={() => appendItinerary({ title: '', day_number: itineraries.length + 1 })}
                  className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                >
                  <Plus className="w-5 h-5" /> Add Itinerary Segment
                </button>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="max-w-md space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Price (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input {...methods.register('base_price_usd')} type="number" step="0.01" className="w-full p-4 pl-10 bg-slate-50 border rounded-xl outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Min Participants</label>
                    <input {...methods.register('min_participants')} type="number" className="w-full p-4 bg-slate-50 border rounded-xl outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Participants</label>
                    <input {...methods.register('max_participants')} type="number" className="w-full p-4 bg-slate-50 border rounded-xl outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};