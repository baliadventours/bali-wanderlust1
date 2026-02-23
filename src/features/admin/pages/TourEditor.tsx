import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Tour } from '../../../lib/types';

const TourEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    base_price_usd: 0,
    duration_minutes: 0,
    max_participants: 10,
    difficulty: 'beginner',
    images: '',
  });

  const { data: tour, isLoading: isFetching } = useQuery({
    queryKey: ['admin-tour', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Tour;
    },
    enabled: isEdit
  });

  useEffect(() => {
    if (tour) {
      setFormData({
        title: tour.title.en,
        slug: tour.slug,
        description: tour.description?.en || '',
        base_price_usd: tour.base_price_usd,
        duration_minutes: tour.duration_minutes,
        max_participants: tour.max_participants,
        difficulty: tour.difficulty,
        images: tour.images.join(', '),
      });
    }
  }, [tour]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        title: { en: data.title },
        slug: data.slug,
        description: { en: data.description },
        base_price_usd: data.base_price_usd,
        duration_minutes: data.duration_minutes,
        max_participants: data.max_participants,
        difficulty: data.difficulty,
        images: data.images.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (isEdit) {
        const { error } = await supabase.from('tours').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('tours').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      navigate('/admin');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  if (isFetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin')} className="p-3 hover:bg-white rounded-xl transition-all">
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </button>
        <div>
          <h1 className="text-4xl font-black text-slate-900">{isEdit ? 'Edit Expedition' : 'New Expedition'}</h1>
          <p className="text-slate-500 font-medium">Define the journey, pricing, and logistics.</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Tour Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-emerald-500 transition-all" placeholder="e.g. The Himalayan Trek" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">URL Slug</label>
              <input name="slug" value={formData.slug} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-emerald-500 transition-all" placeholder="e.g. himalayan-trek" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-emerald-500 transition-all" placeholder="Describe the adventure..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Price ($)</label>
              <input type="number" name="base_price_usd" value={formData.base_price_usd} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Duration (Mins)</label>
              <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Max People</label>
              <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 font-bold focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Images (Comma separated URLs)</label>
            <div className="relative">
              <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input name="images" value={formData.images} onChange={handleChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 font-bold focus:outline-none focus:border-emerald-500 transition-all" placeholder="https://example.com/img1.jpg, ..." />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin')} className="px-10 py-5 rounded-2xl font-black text-slate-500 hover:bg-white transition-all">Cancel</button>
          <button type="submit" disabled={mutation.isPending} className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50">
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Expedition' : 'Publish Expedition'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TourEditor;
