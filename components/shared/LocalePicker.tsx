
import React from 'react';
import { Globe, DollarSign, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const LocalePicker: React.FC = () => {
  const { language, setLanguage, currency, setCurrency, availableCurrencies } = useAppStore();

  return (
    <div className="flex items-center gap-4">
      {/* Language Switcher */}
      <div className="relative group">
        <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white transition-all">
          <Globe className="w-4 h-4" />
          <span className="uppercase">{language}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
        <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-1">
          {['en', 'es'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${language === lang ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {lang === 'en' ? 'English' : 'Español'}
            </button>
          ))}
        </div>
      </div>

      {/* Currency Switcher */}
      <div className="relative group">
        <button className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white transition-all">
          <DollarSign className="w-4 h-4" />
          <span>{currency.code}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
        <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] p-1">
          {availableCurrencies.map((cur) => (
            <button
              key={cur.code}
              onClick={() => setCurrency(cur.code)}
              className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${currency.code === cur.code ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              {cur.code} ({cur.symbol})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
