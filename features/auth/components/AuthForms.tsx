
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
      <p className="text-slate-500 mb-8 font-medium">Log in to manage your expeditions.</p>
      
      <form onSubmit={handleLogin} className="space-y-6">
        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold">{error}</div>}
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3 h-3" /> Email Address
          </label>
          <input 
            type="email" 
            required
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3" /> Password
          </label>
          <input 
            type="password" 
            required
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-slate-500 font-medium">
        Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Join the club</Link>
      </p>
    </div>
  );
};

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-white rounded-3xl border border-slate-200 shadow-xl">
      <h2 className="text-3xl font-black text-slate-900 mb-2">Create Account</h2>
      <p className="text-slate-500 mb-8 font-medium">Start your journey with TourSphere today.</p>
      
      <form onSubmit={handleRegister} className="space-y-6">
        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold">{error}</div>}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Full Name
          </label>
          <input 
            type="text" 
            required
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3 h-3" /> Email Address
          </label>
          <input 
            type="email" 
            required
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3" /> Password
          </label>
          <input 
            type="password" 
            required
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-slate-500 font-medium">
        Already registered? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in here</Link>
      </p>
    </div>
  );
};
