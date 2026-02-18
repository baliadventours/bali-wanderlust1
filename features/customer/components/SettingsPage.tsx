
import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { Save, Lock, User, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { profile, user, setAuth } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Update Profile Table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // 2. Update Auth Metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      // Update Local State
      if (profile) {
        setAuth(user, { ...profile, full_name: fullName });
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your identity and account security.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-[10px] flex items-center gap-3 text-xs font-bold border animate-in fade-in slide-in-from-top-1 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <section className="bg-white p-8 rounded-[10px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-50 rounded-[10px]">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">General Profile</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display Name</label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </form>
      </section>

      <section className="bg-white p-8 rounded-[10px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-slate-50 rounded-[10px]">
            <Lock className="w-5 h-5 text-rose-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Password</label>
            <input 
              type="password" 
              placeholder="Min. 6 characters"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-rose-500/20 text-sm font-medium"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button 
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-[10px] font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Change Password
          </button>
        </form>
      </section>
    </div>
  );
};
