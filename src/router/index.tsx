import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import RoleGuard from '../components/RoleGuard';

// Public Pages
import HomePage from '../features/home/pages/HomePage';
import TourListingPage from '../features/tours/pages/TourListingPage';
import TourDetailPage from '../features/tours/pages/TourDetailPage';
import CheckoutPage from '../features/booking/pages/CheckoutPage';
import LoginPage from '../features/auth/pages/LoginPage';

// Admin Pages
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import TourEditor from '../features/admin/pages/TourEditor';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<TourListingPage />} />
        <Route path="/tours/:slug" element={<TourDetailPage />} />
        <Route path="/checkout/:tourId" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<div className="p-20 text-center font-black text-4xl">About Us</div>} />
        <Route path="/contact" element={<div className="p-20 text-center font-black text-4xl">Contact Us</div>} />
      </Route>

      {/* Admin Routes */}
      <Route element={<RoleGuard requiredRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tours/create" element={<TourEditor />} />
          <Route path="tours/edit/:id" element={<TourEditor />} />
          <Route path="bookings" element={<div className="p-10 font-black text-3xl">Bookings Management</div>} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
