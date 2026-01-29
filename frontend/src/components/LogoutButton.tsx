import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';

/**
 * Logout Button Component
 * 
 * Subtle button to log out, matching the LanguageSwitcher style
 * Designed to be unobtrusive while remaining accessible
 */
export function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <button
      onClick={handleLogout}
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
      title={t('logout')}
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
          />
        </svg>
        <span className="hidden sm:inline">{t('logout')}</span>
      </span>
    </button>
  );
}
