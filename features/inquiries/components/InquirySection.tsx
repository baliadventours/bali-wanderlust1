
import React, { useState } from 'react';
import { useSubmitInquiry } from '../hooks/useInquiries';
import { MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';

interface InquirySectionProps {
  tourId: string;
}

export const InquirySection: React.FC<InquirySectionProps> = ({ tourId }) => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const submitInquiry = useSubmitInquiry();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitInquiry.mutateAsync({
      tour_id: tourId,
      subject: 'Inquiry from Tour Page',
      message
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[10px] text-center animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-emerald-900 font-bold mb-2">Message Sent!</h3>
        <p className="text-emerald-700 text-xs">Our team will get back to you within 24 hours.</p>
        <button onClick={() => setSubmitted(false)} className="mt-4 text-emerald-800 text-xs font-bold hover:underline">Ask another question</button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-100 p-8 rounded-[10px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-[10px] shadow-sm">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Have a question?</h3>
          <p className="text-slate-500 text-xs font-medium">Ask our experts about this expedition.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea 
          required
          placeholder="Message our team..."
          className="w-full p-4 bg-white border border-slate-200 rounded-[10px] outline-none focus:ring-2 focus:ring-emerald-500/10 min-h-[120px] text-sm"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button 
          disabled={submitInquiry.isPending}
          className="w-full bg-slate-900 text-white py-3 rounded-[10px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"
        >
          {submitInquiry.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
        </button>
      </form>
    </div>
  );
};
