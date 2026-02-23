import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './features/home/pages/HomePage';
import TourListingPage from './features/tours/pages/TourListingPage';
import TourDetailPage from './features/tours/pages/TourDetailPage';
import CheckoutPage from './features/booking/pages/CheckoutPage';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import TourEditor from './features/admin/pages/TourEditor';
import LoginPage from './features/auth/pages/LoginPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tours" element={<TourListingPage />} />
        <Route path="tours/:slug" element={<TourDetailPage />} />
        <Route path="checkout/:tourId" element={<CheckoutPage />} />
        <Route path="login" element={<LoginPage />} />
      </Route>
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="tours/create" element={<TourEditor />} />
        <Route path="tours/edit/:id" element={<TourEditor />} />
      </Route>
    </Routes>
  );
};

export default App;
