
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
 * Helper to extract localized string from JSONB column
 */
export function getTranslation(data: Record<string, string> | undefined, lang: string): string {
  if (!data) return '';
  return data[lang] || data['en'] || Object.values(data)[0] || '';
}
