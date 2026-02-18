
import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Compass, User, LogOut, LayoutDashboard, Calendar, Map, Settings, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { LocalePicker } from '../shared/LocalePicker';
import { useTranslation } from 'react-i18next';

export const PublicLayout: React.FC = () => {
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-indigo-600">
              <Compass className="w-8 h-8" />
              <span>TourSphere</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/tours" className="text-slate-600 hover:text-indigo-600 font-medium">{t('common.explore')}</Link>
              <LocalePicker />
              {user ? (
                <Link to="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                  {t('common.dashboard')}
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium">{t('common.login')}</Link>
                  <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                    {t('common.signup')}
                  </Link>
                </div>
              )}
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 TourSphere. Production-Ready Tour Management.</p>
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
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Compass className="w-6 h-6" />
            <span>TourSphere</span>
          </Link>
        </div>
        <nav className="flex-grow px-4 space-y-1">
          {filteredMenu.map((item) => (
            <Link key={item.path} to={item.path} className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition font-medium">
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="mb-4 px-3">
             <LocalePicker />
          </div>
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-slate-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm">
            <LogOut className="w-4 h-4" />
            {t('common.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-grow p-8">
        <Outlet />
      </main>
    </div>
  );
};
