import { translations, type Language } from './locales';

let currentLanguage: Language = 'en';
let fallbackLanguage: Language = 'en';

export function setLanguage(lang: Language): void {
  if (translations[lang]) {
    currentLanguage = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      
      const isRTL = ['ar', 'he', 'fa'].includes(lang);
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    }
  }
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let result: any = translations[currentLanguage];

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      result = translations[fallbackLanguage];
      for (const fallbackKey of keys) {
        if (result && typeof result === 'object' && fallbackKey in result) {
          result = result[fallbackKey];
        } else {
          return key;
        }
      }
      break;
    }
  }

  if (typeof result !== 'string') {
    return key;
  }

  if (params) {
    return Object.entries(params).reduce(
      (str, [param, value]) => str.replace(new RegExp(`{{${param}}}`, 'g'), String(value)),
      result
    );
  }

  return result;
}

export function initI18n(): void {
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        setLanguage(browserLang);
      }
    }
  }
}

export function getAvailableLanguages(): { code: Language; name: string; nativeName: string }[] {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
  ];
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(currentLanguage, options || { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(currentLanguage, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat(currentLanguage, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat(currentLanguage, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return t('common.today');
  } else if (diffDays === 1) {
    return t('common.tomorrow');
  } else if (diffDays === -1) {
    return t('common.yesterday');
  } else if (diffDays > 0 && diffDays < 7) {
    return t('common.inDays', { count: diffDays });
  } else if (diffDays < 0 && diffDays > -7) {
    return t('common.daysAgo', { count: Math.abs(diffDays) });
  } else {
    return formatDate(d);
  }
}
