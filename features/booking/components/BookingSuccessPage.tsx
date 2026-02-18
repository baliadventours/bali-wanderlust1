
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Calendar, Map, Mail, ArrowRight } from 'lucide-react';

export const BookingSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-12 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
            </svg>
          </div>
          <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-indigo-200" />
          <h1 className="text-4xl font-black mb-2">Booking Confirmed!</h1>
          <p className="text-indigo-100 font-medium">Your next adventure is officially on the calendar.</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Check Email</h4>
                <p className="text-sm font-bold text-slate-700">Confirmation sent with trip itinerary.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Trip Date</h4>
                <p className="text-sm font-bold text-slate-700">Check dashboard for timing.</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col gap-3">
            <Link 
              to="/dashboard/bookings"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
            >
              <Map className="w-5 h-5" />
              View My Bookings
            </Link>
            <Link 
              to="/tours"
              className="w-full text-slate-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:text-indigo-600 transition-colors"
            >
              Browse More Tours
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction ID: {sessionId?.slice(-12)}</p>
        </div>
      </div>
    </div>
  );
};
