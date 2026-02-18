
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore, UserRole } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, profile, isLoading } = useAuthStore();
  const location = useLocation();

  // 1. Still performing initial check
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verifying Access...</p>
      </div>
    );
  }

  // 2. No session? Go to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Session exists but profile is missing? 
  // We need to wait for AuthProvider to finish fetching the role.
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Profile Authority...</p>
      </div>
    );
  }

  // 4. Role check
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    console.warn(`Access Denied: User role '${profile.role}' is not in allowed list:`, allowedRoles);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
