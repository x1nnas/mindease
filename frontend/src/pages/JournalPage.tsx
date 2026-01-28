import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createJournalEntry, updateJournalEntry, getAllJournalEntries as apiGetAllJournalEntries, type JournalEntryResponse } from '../services/api';
import { BrandLogo } from '../components/BrandLogo';
import { useLanguage } from '../i18n/useLanguage';

type Mode = 'write' | 'entries' | 'view';

/**
 * Formats a date for display
 * Returns "Today", "Yesterday", or formatted date string
 */
const formatDate = (date: Date, t: (key: 'today' | 'yesterday') => string): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (entryDate.getTime() === today.getTime()) return t('today');
  if (entryDate.getTime() === yesterday.getTime()) return t('yesterday');
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export default function JournalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('write');
  const [entry, setEntry] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null); // Track which entry is being edited
  const [viewingEntry, setViewingEntry] = useState<JournalEntryResponse | null>(null); // Track which entry is being viewed
  const [isFocused, setIsFocused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false); // Loading state for entries fetch
  const [isEntering, setIsEntering] = useState(() => !!location.state?.fromHome);
  const [entries, setEntries] = useState<JournalEntryResponse[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load entries when switching to entries mode
  useEffect(() => {
    const loadEntries = async () => {
      if (mode === 'entries') {
        setIsLoadingEntries(true);
        try {
          const allEntries = await apiGetAllJournalEntries();
          setEntries(allEntries);
        } catch (error) {
          console.error('Error loading journal entries:', error);
          setEntries([]);
        } finally {
          setIsLoadingEntries(false);
        }
      }
    };
    loadEntries();
  }, [mode]);

  // Auto-expand textarea based on content
  useEffect(() => {
    if (textareaRef.current && mode === 'write') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [entry, mode]);

  useEffect(() => {
    // Animate in if coming from HomePage or ChatPage
    if (isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEntering]);

  const handleSave = async () => {
    if (!entry.trim()) return;

    setIsSaving(true);
    try {
      if (editingEntryId) {
        // Update existing entry
        await updateJournalEntry(editingEntryId, {
          content: entry.trim(),
        });
      } else {
        // Create new entry
        await createJournalEntry({
          content: entry.trim(),
          allowSerenityAccess: false,
        });
      }
      
      // Clear state and reload entries
      setEntry('');
      setEditingEntryId(null);
      setMode('entries');
      const allEntries = await apiGetAllJournalEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEntryClick = (entryItem: JournalEntryResponse) => {
    // Switch to view mode to show the full entry
    setViewingEntry(entryItem);
    setMode('view');
  };

  const handleEditClick = () => {
    if (viewingEntry) {
      // Switch to write mode with the entry content and ID
      setEntry(viewingEntry.content);
      setEditingEntryId(viewingEntry.id);
      setMode('write');
    }
  };

  const handleBackToEntries = () => {
    setViewingEntry(null);
    setEditingEntryId(null);
    setEntry('');
    setMode('entries');
  };

  const handleNewEntry = () => {
    setEntry('');
    setEditingEntryId(null);
    setViewingEntry(null);
    setMode('write');
  };

  const handleCancel = () => {
    navigate('/home', { state: { fromJournal: true } });
  };

  return (
    <div className="relative h-screen flex flex-col bg-[#1a241f] overflow-hidden">
      {/* Glow background layer - matching other pages */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main green glow - top left */}
        <div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(100 45% 55% / 0.4) 0%, hsl(95 40% 50% / 0.15) 40%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        
        {/* Secondary olive glow - bottom right */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(75 35% 45% / 0.35) 0%, hsl(80 30% 40% / 0.12) 40%, transparent 70%)",
            filter: "blur(85px)",
          }}
        />
        
        {/* Subtle center accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(90 35% 50% / 0.12) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-col flex-1 px-4 sm:px-6 py-4 sm:py-8 pb-20 sm:pb-28 overflow-y-auto">
        
        {/* Header */}
        <div
          className="mb-6"
          style={{
            animation: 'fadeUpSlide 0.6s ease-out 0.1s',
            animationFillMode: 'both',
          }}
        >
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors duration-300 mb-6"
            style={{
              animation: 'fadeIn 0.5s ease-out 0.15s',
              animationFillMode: 'both',
            }}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
            <span className="text-sm font-light">{t('back')}</span>
          </button>
          
          <h1 
            className="text-2xl sm:text-3xl font-light text-white/90 tracking-wide"
            style={{
              animation: 'fadeUpSlide 0.6s ease-out 0.2s',
              animationFillMode: 'both',
            }}
          >
            {t('yourJournal')}
          </h1>
          <p 
            className="mt-2 text-white/60 text-sm font-light"
            style={{
              animation: 'fadeUpSlide 0.6s ease-out 0.25s',
              animationFillMode: 'both',
            }}
          >
            {t('quietSpace')}
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          className="mb-6"
          style={{
            animation: 'fadeUpSlide 0.6s ease-out 0.3s',
            animationFillMode: 'both',
          }}
        >
          <div 
            className="inline-flex p-1 rounded-xl"
            style={{
              background: "hsl(150 50% 50% / 0.2)",
            }}
          >
            {(['write', 'entries'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  if (m === 'write') {
                    handleNewEntry();
                  } else {
                    handleBackToEntries();
                  }
                }}
                className={`relative px-5 py-2 text-sm font-light tracking-wide rounded-lg transition-all duration-300 ${
                  (mode === m || (mode === 'view' && m === 'entries')) 
                    ? 'text-white' 
                    : 'text-white/60 hover:text-white/80'
                }`}
                style={{
                  background: (mode === m || (mode === 'view' && m === 'entries'))
                    ? "linear-gradient(135deg, hsl(150 50% 50% / 0.3) 0%, hsl(150 50% 50% / 0.2) 100%)"
                    : 'transparent',
                }}
              >
                <span className="relative z-10">{m === 'write' ? t('write') : t('entries')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {mode === 'view' ? (
            <div
              className={`flex flex-col flex-1 transition-all duration-500 ease-out ${
                isEntering 
                  ? 'opacity-0 transform translate-x-[-20px]' 
                  : 'opacity-100 transform translate-x-0'
              }`}
            >
              {viewingEntry && (
                <>
                  {/* Entry Header */}
                  <div className="mb-4">
                    <span className="text-xs text-white/50 font-light tracking-wide">
                      {formatDate(new Date(viewingEntry.createdAt), t)}
                    </span>
                  </div>

                  {/* Entry Content */}
                  <div 
                    className="flex-1 rounded-2xl p-5 sm:p-6 mb-6"
                    style={{
                      background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                    }}
                  >
                    <p className="text-white/90 text-base sm:text-lg font-light leading-relaxed tracking-wide whitespace-pre-wrap">
                      {viewingEntry.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleEditClick}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    >
                      {t('editEntry')}
                    </button>
                    
                    <button 
                      onClick={handleBackToEntries}
                      className="w-full py-3 text-sm text-white/60 hover:text-white/80 transition-colors duration-300 font-light tracking-wide"
                    >
                      {t('backToEntries')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : mode === 'write' ? (
            <div
              className="flex flex-col flex-1"
              style={{
                animation: 'fadeUpSlide 0.6s ease-out 0.35s',
                animationFillMode: 'both',
              }}
            >
              {/* Writing Area - Auto-expanding */}
              <div 
                className={`relative rounded-2xl transition-all duration-500 ${
                  isFocused 
                    ? 'ring-1 ring-green-400/20' 
                    : ''
                }`}
                style={{
                  background: isFocused 
                    ? "linear-gradient(135deg, hsl(150 50% 50% / 0.2) 0%, hsl(150 50% 50% / 0.1) 100%)"
                    : "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                }}
              >
                {/* Subtle inner glow when focused */}
                {isFocused && (
                  <div
                    className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
                    style={{
                      background: "radial-gradient(ellipse at 50% 0%, hsl(150 50% 50% / 0.04) 0%, transparent 60%)",
                    }}
                  />
                )}
                
                <textarea
                  ref={textareaRef}
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={t('whatOnMind')}
                  className="w-full p-5 sm:p-6 bg-transparent text-white/90 placeholder:text-white/40 resize-none focus:outline-none text-base sm:text-lg font-light leading-relaxed tracking-wide"
                  style={{
                    caretColor: "hsl(150 50% 50%)",
                    minHeight: "120px",
                    animation: 'fadeIn 0.5s ease-out 0.45s',
                    animationFillMode: 'both',
                  }}
                />
              </div>

              {/* Actions */}
              <div
                className="mt-6 space-y-3"
                style={{ 
                  animation: 'fadeUp 0.6s ease-out 0.5s',
                  animationFillMode: 'both',
                }}
              >
                <button
                  onClick={handleSave}
                  disabled={!entry.trim() || isSaving}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? t('saving') : editingEntryId ? t('updateEntry') : t('saveEntry')}
                </button>
                
                <button 
                  onClick={() => {
                    if (editingEntryId) {
                      // If editing, go back to view mode
                      const entryToView = entries.find(e => e.id === editingEntryId);
                      if (entryToView) {
                        setViewingEntry(entryToView);
                        setMode('view');
                      } else {
                        handleBackToEntries();
                      }
                    } else {
                      handleCancel();
                    }
                    setEntry('');
                    setEditingEntryId(null);
                  }}
                  className="w-full py-3 text-sm text-white/60 hover:text-white/80 transition-colors duration-300 font-light tracking-wide"
                >
                  {editingEntryId ? 'Cancel' : 'Cancel'}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col gap-3 transition-all duration-500 ease-out overflow-y-auto ${
                isEntering 
                  ? 'opacity-0 transform translate-x-[20px]' 
                  : 'opacity-100 transform translate-x-0'
              }`}
            >
              {isLoadingEntries ? (
                <div 
                  className="flex flex-col items-center justify-center py-16"
                  style={{ 
                    animation: 'fadeUp 0.8s ease-out',
                    animationFillMode: 'both',
                  }}
                >
                  <div className="flex gap-1.5 mb-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-green-400/60"
                        style={{
                          animation: `loadingDot 1.2s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm font-light tracking-wide">{t('loadingEntries')}</p>
                </div>
              ) : entries.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center py-16 text-center"
                  style={{ 
                    animation: 'fadeUp 0.8s ease-out',
                    animationFillMode: 'both',
                  }}
                >
                  <p className="text-white/60 font-light">
                    {t('noEntriesYet')}
                  </p>
                  <p className="text-white/40 text-sm font-light mt-1">
                    {t('thoughtsAppearHere')}
                  </p>
                </div>
              ) : (
                entries.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleEntryClick(item)}
                    className="w-full text-left p-4 sm:p-5 rounded-xl transition-all duration-300 group cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                      boxShadow: "0 4px 16px hsl(150 50% 50% / 0.1)",
                      animation: 'fadeUp 0.5s ease-out',
                      animationDelay: `${index * 0.08}s`,
                      animationFillMode: 'both',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, hsl(150 50% 50% / 0.2) 0%, hsl(150 50% 50% / 0.12) 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)";
                    }}
                  >
                    <span className="text-xs text-white/50 font-light tracking-wide">
                      {formatDate(new Date(item.createdAt), t)}
                    </span>
                    <p 
                      className="mt-2 text-white/80 text-sm sm:text-base font-light leading-relaxed line-clamp-2"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.content}
                    </p>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Watermark Logo with MindEase text - subtle branding */}
        {(mode === 'write' || mode === 'entries') && (
          <div
            className="mt-12"
            style={{ 
              animation: 'fadeUp 0.8s ease-out 0.8s',
              animationFillMode: 'both',
              marginBottom: 'clamp(6rem, 12vh, 8rem)', // Responsive bottom margin to prevent overlap with bottom nav
            }}
          >
            <BrandLogo size="md" showText={true} />
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeUpSlide {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes loadingDot {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
