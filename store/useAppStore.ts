
import { create } from 'zustand';
import i18n from '../lib/i18n';

interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

interface AppState {
  language: string;
  currency: Currency;
  availableCurrencies: Currency[];
  setLanguage: (lang: string) => void;
  setCurrency: (code: string) => void;
  setAvailableCurrencies: (currencies: Currency[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: i18n.language || 'en',
  currency: { code: 'USD', symbol: '$', rate: 1.0 },
  availableCurrencies: [
    { code: 'USD', symbol: '$', rate: 1.0 },
    { code: 'EUR', symbol: '€', rate: 0.92 },
    { code: 'GBP', symbol: '£', rate: 0.79 },
  ],
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
  setCurrency: (code) => {
    const currency = get().availableCurrencies.find(c => c.code === code);
    if (currency) set({ currency });
  },
  setAvailableCurrencies: (currencies) => set({ availableCurrencies: currencies }),
}));
