import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traduções PT-BR
import commonPtBR from '../locales/pt-BR/common.json';
import landingPtBR from '../locales/pt-BR/landing.json';
import authPtBR from '../locales/pt-BR/auth.json';
import dashboardPtBR from '../locales/pt-BR/dashboard.json';
import viewerPtBR from '../locales/pt-BR/viewer.json';

// Importar traduções EN-US
import commonEnUS from '../locales/en-US/common.json';
import landingEnUS from '../locales/en-US/landing.json';
import authEnUS from '../locales/en-US/auth.json';
import dashboardEnUS from '../locales/en-US/dashboard.json';
import viewerEnUS from '../locales/en-US/viewer.json';

// Importar traduções ES-ES
import commonEsES from '../locales/es-ES/common.json';
import landingEsES from '../locales/es-ES/landing.json';
import authEsES from '../locales/es-ES/auth.json';
import dashboardEsES from '../locales/es-ES/dashboard.json';
import viewerEsES from '../locales/es-ES/viewer.json';

// Recursos de tradução
const resources = {
    'pt-BR': {
        common: commonPtBR,
        landing: landingPtBR,
        auth: authPtBR,
        dashboard: dashboardPtBR,
        viewer: viewerPtBR,
    },
    'en-US': {
        common: commonEnUS,
        landing: landingEnUS,
        auth: authEnUS,
        dashboard: dashboardEnUS,
        viewer: viewerEnUS,
    },
    'es-ES': {
        common: commonEsES,
        landing: landingEsES,
        auth: authEsES,
        dashboard: dashboardEsES,
        viewer: viewerEsES,
    },
};

// Configuração do i18n
i18n
    .use(LanguageDetector) // Detecta o idioma do navegador
    .use(initReactI18next) // Passa o i18n para o react-i18next
    .init({
        resources,
        defaultNS: 'common',
        fallbackLng: 'pt-BR', // Idioma padrão
        supportedLngs: ['pt-BR', 'en-US', 'es-ES'], // Idiomas suportados

        // Detecção de idioma
        detection: {
            order: ['localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage'],
            lookupLocalStorage: 'i18nextLng',
        },

        interpolation: {
            escapeValue: false, // React já faz escape
        },

        // Debug (desabilitar em produção)
        debug: import.meta.env.DEV,

        // Separador de namespace
        nsSeparator: ':',
        keySeparator: '.',

        react: {
            useSuspense: true,
        },
    });

export default i18n;

// Tipos TypeScript para autocomplete
export type Language = 'pt-BR' | 'en-US' | 'es-ES';

export interface LanguageInfo {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
}

export const availableLanguages: LanguageInfo[] = [
    {
        code: 'pt-BR',
        name: 'Portuguese',
        nativeName: 'Português',
        flag: '🇧🇷',
    },
    {
        code: 'en-US',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸',
    },
    {
        code: 'es-ES',
        name: 'Spanish',
        nativeName: 'Español',
        flag: '🇪🇸',
    },
];

// Função helper para obter o locale correto
export const getLocaleFromLanguage = (lang: Language): string => {
    return lang;
};

// Função helper para formatar números
export const formatNumberWithLocale = (
    value: number,
    locale?: string,
    options?: Intl.NumberFormatOptions
): string => {
    const currentLocale = locale || i18n.language || 'pt-BR';
    return new Intl.NumberFormat(currentLocale, options).format(value);
};

// Função helper para formatar datas
export const formatDateWithLocale = (
    date: Date | string,
    locale?: string,
    options?: Intl.DateTimeFormatOptions
): string => {
    const currentLocale = locale || i18n.language || 'pt-BR';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(currentLocale, options).format(dateObj);
};

// Função helper para formatar moeda
export const formatCurrencyWithLocale = (
    value: number,
    locale?: string,
    currency?: string
): string => {
    const currentLocale = locale || i18n.language || 'pt-BR';
    const currencyCode = currency || (currentLocale === 'pt-BR' ? 'BRL' : currentLocale === 'es-ES' ? 'EUR' : 'USD');

    return new Intl.NumberFormat(currentLocale, {
        style: 'currency',
        currency: currencyCode,
    }).format(value);
};
