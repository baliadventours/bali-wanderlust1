
export type LocalizedString = string | { [key: string]: string };

export const getTranslation = (value: LocalizedString | undefined | null, lang: string = 'en'): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value['en'] || Object.values(value)[0] || '';
};

export const toLocalizedString = (value: string, lang: string = 'en'): { [key: string]: string } => {
  return { [lang]: value };
};
