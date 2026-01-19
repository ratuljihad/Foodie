import { useTranslation } from 'react-i18next';

export const LanguageToggle = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'bn' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Switch Language"
        >
            <span className="text-lg leading-none">{i18n.language === 'en' ? '🇧🇩' : '🇺🇸'}</span>
            <span>{i18n.language === 'en' ? 'বাংলা' : 'English'}</span>
        </button>
    );
};
