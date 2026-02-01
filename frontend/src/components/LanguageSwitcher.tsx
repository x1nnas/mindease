import { useLanguage } from '../i18n/useLanguage';

/**
 * Language Switcher Component
 * 
 * Subtle button to toggle between English and Portuguese (Portugal)
 * Designed to be unobtrusive while remaining accessible
 */
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="group relative px-2.5 py-1.5 text-xs font-light tracking-wide rounded-full transition-all duration-300 hover:opacity-100"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: "rgba(255, 255, 255, 0.5)",
        opacity: 0.6,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.6';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }}
      title={`Switch to ${language === 'en' ? 'Portuguese' : 'English'}`}
    >
      <span className="flex items-center gap-1.5">
        <svg 
          className="w-3 h-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ opacity: 0.7 }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        <span>{language === 'en' ? 'PT' : 'EN'}</span>
      </span>
    </button>
  );
}
