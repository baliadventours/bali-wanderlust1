
import React, { useState, useEffect } from 'react';
import { Save, X, Image as ImageIcon, Plus, Calendar, Settings, Info, Loader2, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminTour, useUpdateTour } from '../hooks/useAdminData';
import { uploadImage } from '../../../lib/storage';

export const TourEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const { data: tour, isLoading } = useAdminTour(id);
  const updateTour = useUpdateTour();
  
  const [activeTab, setActiveTab] = useState<'details' | 'itinerary' | 'pricing'>('details');
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    slug: '',
    base_price: '',
    max_participants: '',
    is_published: false,
    images: [] as string[]
  });

  useEffect(() => {
    if (tour) {
      setFormData({
        title_en: tour.title?.en || '',
        slug: tour.slug || '',
        base_price: String(tour.base_price_usd || ''),
        max_participants: String(tour.max_participants || ''),
        is_published: tour.is_published || false,
        images: tour.images || []
      });
    }
  }, [tour]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title_en) return alert("Title is required");
    
    const updates = {
      title: { en: formData.title_en },
      slug: formData.slug || generateSlug(formData.title_en),
      base_price_usd: Number(formData.base_price),
      max_participants: Number(formData.max_participants),
      is_published: formData.is_published,
      images: formData.images
    };

    try {
      await updateTour.mutateAsync({ id: id || 'new', updates });
      navigate('/admin/tours');
    } catch (err) {
      alert("Error saving tour");
    }
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{isEditMode ? 'Edit Expedition' : 'Create New'}</h1>
            <p className="text-slate-500 text-sm">{formData.slug}</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={updateTour.isPending || isUploading}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
        >
          {updateTour.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-[10px] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <aside className="w-64 border-r border-slate-100 p-6 space-y-2">
          {['details', 'itinerary', 'pricing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] font-bold text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
          <div className="pt-8 border-t border-slate-100 mt-8">
            <label className="flex items-center gap-3 cursor-pointer">
               <input 
                 type="checkbox" 
                 checked={formData.is_published}
                 onChange={(e) => setFormData(p => ({ ...p, is_published: e.target.checked }))}
                 className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
               />
               <span className="text-xs font-bold text-slate-600 uppercase">Visible on Site</span>
            </label>
          </div>
        </aside>

        <div className="flex-grow p-10">
          {activeTab === 'details' && (
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expedition Title</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] text-sm font-medium"
                  value={formData.title_en}
                  onChange={(e) => {
                    setFormData(p => ({ ...p, title_en: e.target.value, slug: generateSlug(e.target.value) }));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Price (USD)</label>
                  <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] text-sm" value={formData.base_price} onChange={e => setFormData(p => ({ ...p, base_price: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Group Size</label>
                  <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] text-sm" value={formData.max_participants} onChange={e => setFormData(p => ({ ...p, max_participants: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Media Gallery</label>
                <div className="grid grid-cols-4 gap-4">
                  {formData.images.map((img, i) => (
                    <div key={i} className="aspect-square relative rounded-[10px] overflow-hidden bg-slate-100 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square border-2 border-dashed border-slate-200 rounded-[10px] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : <Plus className="w-5 h-5 text-slate-400" />}
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Add Photo</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
