
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase, isConfigured } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/useAuthStore';
import { Loader2, Mail, Lock, User, ShieldCheck, Info, AlertTriangle } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // If not configured, intercept admin@admin.com
    if (!isConfigured) {
      if (email.trim() === 'admin@admin.com' && password === 'password') {
        setTimeout(() => {
          setAuth(
            { id: '00000000-0000-0000-0000-000000000001', email: 'admin@admin.com' } as any,
            { id: '00000000-0000-0000-0000-000000000001', full_name: 'System Admin', role: 'admin' }
          );
          navigate('/admin');
          setLoading(false);
        }, 600);
        return;
      }
      
      setError('Invalid demo credentials. Use admin@admin.com / password');
      setLoading(false);
      return;
    }

    // If configured, always use Supabase auth
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      
      // Profile fetching handled by AuthProvider
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your project credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@admin.com');
    setPassword('password');
    setLoading(true);
    setTimeout(() => {
      setAuth(
        { id: '00000000-0000-0000-0000-000000000001', email: 'admin@admin.com' } as any,
        { id: '00000000-0000-0000-0000-000000000001', full_name: 'System Admin', role: 'admin' }
      );
      navigate('/admin');
      setLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-md w-full mx-auto p-10 bg-white rounded-[10px] border border-slate-200 shadow-2xl">
      <h2 className="text-3xl font-bold text-slate-900 mb-2 font-jakarta">Welcome Back</h2>
      <p className="text-slate-500 mb-10 text-sm font-medium">Log in to manage your expeditions.</p>
      
      <form onSubmit={handleLogin} className="space-y-6">
        {error && (
          <div className="p-4 bg-rose-50 text-rose-600 rounded-[10px] text-xs font-bold border border-rose-100 animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}
        
        {isConfigured && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-[10px] flex gap-3 items-start">
             <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
             <div className="text-[10px] text-amber-800 font-bold uppercase leading-relaxed">
               First time here? <Link to="/register" className="underline text-amber-900">Register</Link> an account in your project to enable local authority.
             </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <input 
            type="email" 
            required
            placeholder="admin@admin.com"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" /> Password
          </label>
          <input 
            type="password" 
            required
            placeholder="••••••••"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-[10px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 space-y-4 pt-8 border-t border-slate-100">
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[10px] flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-600 mt-0.5" />
          <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
            <p className="mb-1 underline">{isConfigured ? 'Production Database:' : 'Development Preview:'}</p>
            <p>Admin privileges are automatically synced for admin@admin.com.</p>
          </div>
        </div>
        {!isConfigured && (
          <button 
            type="button"
            onClick={handleDemoAdmin}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-[10px] font-bold text-sm hover:bg-emerald-700 transition-all border border-emerald-500/10 shadow-lg shadow-emerald-100"
          >
            <ShieldCheck className="w-4 h-4" />
            Quick Sign-In (Demo Admin)
          </button>
        )}
      </div>
      
      <p className="mt-8 text-center text-xs text-slate-400 font-bold">
        New to the team? <Link to="/register" className="text-emerald-600 hover:text-emerald-700 transition-colors">Register as Host</Link>
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
    
    if (!isConfigured) {
      setError('Registration is disabled in UI Preview Mode. Please use demo credentials to log in.');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (signUpError) throw signUpError;
      
      alert("Registration successful! All users created in this project are automatically granted authority. If you use admin@admin.com, you get full system control.");
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-10 bg-white rounded-[10px] border border-slate-200 shadow-2xl">
      <h2 className="text-3xl font-bold text-slate-900 mb-2 font-jakarta">Create Account</h2>
      <p className="text-slate-500 mb-10 text-sm font-medium">Start your journey with TourSphere today.</p>
      
      <form onSubmit={handleRegister} className="space-y-6">
        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-[10px] text-xs font-bold border border-rose-100">{error}</div>}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          <input 
            type="text" 
            required
            placeholder="John Doe"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <input 
            type="email" 
            required
            placeholder="admin@admin.com"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" /> Password
          </label>
          <input 
            type="password" 
            required
            placeholder="••••••••"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-[10px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-xs text-slate-400 font-bold">
        Already registered? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 transition-colors">Log in here</Link>
      </p>
    </div>
  );
};
