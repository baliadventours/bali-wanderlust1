
import { useAppStore } from '../store/useAppStore';

export function convertPrice(amountUsd: number, rate: number): number {
  return amountUsd * rate;
}

export function formatPrice(amount: number, currencyCode: string, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

/**
 * Hook to easily get formatted price strings in components
 */
export function useFormattedPrice() {
  const { currency, language } = useAppStore();
  
  return (amountUsd: number) => {
    const converted = convertPrice(amountUsd, currency.rate);
    return formatPrice(converted, currency.code, language);
  };
}

/**
 * Helper to extract localized string from JSONB column.
 * Bulletproofed to handle strings, objects, or nulls.
 */
export function getTranslation(data: any, lang: string): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  
  // Try requested language, then english fallback, then any key
  return data[lang] || data['en'] || (typeof data === 'object' ? Object.values(data)[0] : '') || '';
}
