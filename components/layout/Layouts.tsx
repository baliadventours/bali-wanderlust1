import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut, LayoutDashboard, Calendar, Map, Settings, Menu, X, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { LocalePicker } from '../shared/LocalePicker';
import { useTranslation } from 'react-i18next';

export const PublicLayout: React.FC = () => {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 font-black text-2xl text-slate-900">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <Compass className="w-6 h-6" />
              </div>
              <span>TourSphere</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-10">
              <Link to="/tours" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors">{t('common.explore')}</Link>
              <Link to="/blog" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors">Journal</Link>
              <div className="h-6 w-px bg-slate-200" />
              <LocalePicker />
              {user ? (
                <Link to="/dashboard" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-600 transition shadow-lg shadow-slate-100">
                  {t('common.dashboard')}
                </Link>
              ) : (
                <div className="flex items-center gap-6">
                  <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors">{t('common.login')}</Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
                    {t('common.signup')}
                  </Link>
                </div>
              )}
            </div>

            <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 space-y-6 animate-in slide-in-from-top duration-300">
            <Link to="/tours" className="block text-xl font-bold text-slate-900" onClick={() => setIsMenuOpen(false)}>Expeditions</Link>
            <Link to="/blog" className="block text-xl font-bold text-slate-900" onClick={() => setIsMenuOpen(false)}>Journal</Link>
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
               {!user ? (
                 <>
                  <Link to="/login" className="text-slate-600 font-bold" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-center" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                 </>
               ) : (
                 <Link to="/dashboard" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-center" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
               )}
            </div>
          </div>
        )}
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-3 font-black text-2xl text-white">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Compass className="w-6 h-6" />
              </div>
              <span>TourSphere</span>
            </Link>
            <p className="max-w-sm text-slate-500 leading-relaxed font-medium">
              We curate world-class adventures for the modern explorer. Experience life untamed with our expert-led global expeditions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Explore</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><Link to="/tours" className="hover:text-indigo-400">All Expeditions</Link></li>
              <li><Link to="/blog" className="hover:text-indigo-400">Travel Journal</Link></li>
              <li><Link to="/destinations" className="hover:text-indigo-400">Destinations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Platform</h4>
            <ul className="space-y-4 font-bold text-sm">
              <li><Link to="/admin" className="hover:text-indigo-400">Admin Panel</Link></li>
              <li><Link to="/register" className="hover:text-indigo-400">Host a Tour</Link></li>
              <li><Link to="/support" className="hover:text-indigo-400">Help Center</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-24 pt-12 border-t border-white/5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-700">&copy; 2024 TourSphere. Production-Ready Tour Management.</p>
        </div>
      </footer>
    </div>
  );
};

export const DashboardLayout: React.FC = () => {
  const { profile, signOut } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    signOut();
    navigate('/');
  };

  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, roles: ['customer', 'admin', 'editor'] },
    { label: 'My Bookings', path: '/dashboard/bookings', icon: Calendar, roles: ['customer'] },
    { label: 'Manage Tours', path: '/admin/tours', icon: Map, roles: ['admin', 'editor'] },
    { label: 'System Admin', path: '/admin', icon: Settings, roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-72 bg-white border-r border-slate-100 hidden md:flex flex-col">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 font-black text-xl text-slate-900">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
            <span>TourSphere</span>
          </Link>
        </div>
        <nav className="flex-grow px-6 space-y-1">
          {filteredMenu.map((item) => (
            <Link key={item.path} to={item.path} className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition font-bold text-sm">
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-50">
          <div className="mb-6 px-4">
             <LocalePicker />
          </div>
          <div className="bg-slate-50 rounded-3xl p-4 flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-black text-slate-900 truncate">{profile?.full_name}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profile?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition font-bold text-sm">
            <LogOut className="w-5 h-5" />
            {t('common.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-grow p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};