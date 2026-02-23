import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Calendar, Mail } from 'lucide-react';

export const BookingSuccessPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-20 px-4">
      <div className="max-w-2xl w-full bg-white p-12 rounded-[40px] border border-slate-100 shadow-2xl text-center space-y-10">
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900">Expedition Confirmed!</h1>
          <p className="text-slate-500 text-xl font-medium max-w-md mx-auto">Your journey has been successfully booked. Pack your bags, adventure awaits!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Check Dashboard</h4>
              <p className="text-slate-500 text-xs font-bold mt-1">Manage your itinerary and travel documents.</p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm">Check Email</h4>
              <p className="text-slate-500 text-xs font-bold mt-1">We've sent a confirmation and receipt to you.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Link to="/dashboard/bookings" className="flex-grow bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2">
            View My Bookings <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex-grow bg-slate-100 text-slate-900 py-5 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
