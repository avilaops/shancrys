import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { availableLanguages, type Language } from '../i18n/config';

interface LanguageSelectorProps {
    className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
    const { i18n, t } = useTranslation('common');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLanguage = availableLanguages.find(
        (lang) => lang.code === i18n.language
    ) || availableLanguages[0];

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (langCode: Language) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Botão */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label={t('language')}
                aria-expanded={isOpen}
            >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLanguage.flag}</span>
                <span className="hidden md:inline">{currentLanguage.nativeName}</span>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="py-1">
                        {availableLanguages.map((lang) => {
                            const isSelected = lang.code === i18n.language;

                            return (
                                <button
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${isSelected
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{lang.flag}</span>
                                        <div className="text-left">
                                            <div className="font-medium">{lang.nativeName}</div>
                                            <div className="text-xs text-gray-500">{lang.name}</div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Informação adicional */}
                    <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                        {t('language')}
                    </div>
                </div>
            )}
        </div>
    );
}
