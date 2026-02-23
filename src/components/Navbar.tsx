import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="w-8 h-8 text-emerald-600" />
          <span className="text-2xl font-black text-slate-900 tracking-tight">TourSphere</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="/tours" className="font-bold text-slate-600 hover:text-emerald-600 transition-colors">Expeditions</Link>
          
          {user ? (
            <div className="flex items-center gap-6">
              {profile?.role === 'admin' && (
                <Link to="/admin" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">Admin</Link>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-sm">
                  <div className="font-black text-slate-900">{profile?.full_name || user.email}</div>
                  <button onClick={() => signOut()} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">Sign Out</button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black hover:bg-slate-800 transition-all">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
