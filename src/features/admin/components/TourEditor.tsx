import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, AlertCircle, Image as ImageIcon, Calendar, MapPin, DollarSign, Clock, Users } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { getTranslation, toLocalizedString } from '../../../lib/utils';

export const TourEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    duration: 0,
    location: '',
    max_group_size: 10,
    difficulty: 'Easy',
    images: '',
    start_dates: '',
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
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (tour) {
      setFormData({
        title: getTranslation(tour.title),
        description: getTranslation(tour.description),
        price: tour.price,
        duration: tour.duration,
        location: tour.location,
        max_group_size: tour.max_group_size,
        difficulty: tour.difficulty,
        images: Array.isArray(tour.images) ? tour.images.join(', ') : tour.images,
        start_dates: Array.isArray(tour.start_dates) ? tour.start_dates.join(', ') : tour.start_dates,
      });
    }
  }, [tour]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        title: toLocalizedString(data.title),
        description: toLocalizedString(data.description),
        images: data.images.split(',').map((s: string) => s.trim()),
        start_dates: data.start_dates.split(',').map((s: string) => s.trim()),
      };

      if (isEdit) {
        const { error } = await supabase
          .from('tours')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tours')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      navigate('/admin/tours');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isFetching) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/tours" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900">{isEdit ? 'Edit Expedition' : 'New Expedition'}</h1>
          <p className="text-slate-500 font-medium">Define the journey, pricing, and logistics.</p>
        </div>
      </div>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm font-bold">
          <AlertCircle className="w-5 h-5" />
          {mutation.error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Basic Information</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Tour Title</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="e.g. The Himalayan Trek"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Description</label>
            <textarea 
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="Describe the adventure in detail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="text" 
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                  placeholder="e.g. Nepal"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Difficulty</label>
              <select 
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 font-bold focus:outline-none focus:border-emerald-500 transition-all appearance-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Logistics & Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="number" 
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Duration (Days)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="number" 
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Max Group Size</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="number" 
                  name="max_group_size"
                  required
                  value={formData.max_group_size}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-50 pb-4">Media & Schedule</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Images (Comma separated URLs)</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                name="images"
                value={formData.images}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Start Dates (Comma separated YYYY-MM-DD)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text" 
                name="start_dates"
                value={formData.start_dates}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 font-bold focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="2026-05-15, 2026-06-20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate('/admin/tours')}
            className="px-8 py-4 rounded-xl font-black text-slate-500 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50"
          >
            {mutation.isPending ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5" /> {isEdit ? 'Update Expedition' : 'Publish Expedition'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};
