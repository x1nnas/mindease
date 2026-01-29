import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useChat } from '../features/chat/useChat';
import { useLanguage } from '../i18n/useLanguage';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { LogoutButton } from '../components/LogoutButton';
import doveLogo from '../assets/Dove nobg.svg';

export default function ChatPage() {
  const { messages, isTyping, isLoading, error, sendMessage, clearError } = useChat();
  const { t } = useLanguage();
  const location = useLocation();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isEntering, setIsEntering] = useState(() => !!location.state?.fromHome);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get suggestion chips based on language
  const suggestionChips = [
    t('feelingOverwhelmed'),
    t('dontKnowFeel'),
    t('helpSlowDown'),
    t('justWantTalk'),
  ];

  useEffect(() => {
    // Animate in if coming from HomePage
    if (isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEntering]);

  // Hide suggestions after first user message
  useEffect(() => {
    const userMessages = messages.filter(msg => msg.sender === 'user');
    if (userMessages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    // Validate message length (2000 characters max)
    const MAX_MESSAGE_LENGTH = 2000;
    if (content.trim().length > MAX_MESSAGE_LENGTH) {
      setLocalError(t('messageTooLong', { max: MAX_MESSAGE_LENGTH }));
      return;
    }

    setLocalError(null);
    setShowSuggestions(false);
    sendMessage(content.trim());
    setInputValue('');
  };

  const handleChipClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const isDisabled = isTyping || isLoading;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-[#1a241f]">
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
        
        {/* Blurred MindEase Dove Logo Background */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] flex items-center justify-center"
          style={{
            opacity: 0.08,
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        >
          <img 
            src={doveLogo}
            alt=""
            className="w-full h-full object-contain"
            style={{
              filter: 'brightness(0) saturate(100%) invert(67%) sepia(30%) saturate(500%) hue-rotate(120deg) brightness(115%) contrast(95%)',
            }}
          />
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <header
          className={`px-6 pb-4 transition-all duration-700 ease-out ${
            isEntering 
              ? 'opacity-0 transform translate-y-[-20px]' 
              : 'opacity-100 transform translate-y-0'
          }`}
          style={{
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)',
          }}
        >
          {/* Language Switcher & Logout - subtle top right */}
          <div 
            className="absolute top-4 right-4 z-20 flex items-center gap-2"
            style={{
              top: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
            }}
          >
            <LanguageSwitcher />
            <LogoutButton />
          </div>
          
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center relative"
              style={{
                background: "linear-gradient(135deg, hsl(150 50% 50% / 0.3) 0%, hsl(150 50% 50% / 0.1) 100%)",
                boxShadow: "0 2px 12px hsl(150 50% 50% / 0.2)",
              }}
            >
              <svg 
                className="w-5 h-5 text-green-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
                />
              </svg>
              {/* Online indicator */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{
                  borderColor: "#1a241f",
                  background: "hsl(140 70% 50%)",
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-medium text-white/90">{t('serenity')}</h1>
              <p className="text-xs text-white/60">{t('hereForYou')}</p>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-4 space-y-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {messages.map((message, index) => {
            const isUser = message.sender === 'user';
            const isLastMessage = index === messages.length - 1;
            
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-all duration-400 ease-out ${
                  isLastMessage
                    ? 'opacity-100 transform translate-y-0 scale-100'
                    : 'opacity-100'
                }`}
                style={{
                  animation: isLastMessage ? 'messageSlideIn 0.4s ease-out 0.1s' : 'none',
                  animationFillMode: 'both',
                }}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'rounded-br-md'
                      : 'rounded-bl-md'
                  }`}
                  style={{
                    background: isUser
                      ? "linear-gradient(135deg, hsl(150 50% 50% / 0.25) 0%, hsl(150 50% 50% / 0.15) 100%)"
                      : "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                    boxShadow: isUser
                      ? "0 2px 16px hsl(150 50% 50% / 0.15)"
                      : "0 2px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                  }}
                >
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-green-400/80">{t('serenity')}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ 
                          background: "hsl(150 50% 50% / 0.15)", 
                          color: "hsl(150 50% 50%)" 
                        }}
                      >
                        AI
                      </span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed text-white/90">
                    {message.text}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div
              className="flex justify-start transition-all duration-400 ease-out"
              style={{
                animation: 'fadeInUp 0.4s ease-out',
                animationFillMode: 'both',
              }}
            >
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3"
                style={{
                  background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-400/80">Serenity</span>
                  <span className="text-xs text-white/50 font-light">is thinking</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-green-400/50"
                        style={{
                          animation: `typingDot 1.2s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(error || localError) && (
            <div
              className="mx-4 p-3 rounded-xl text-sm"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "rgb(254, 202, 202)",
              }}
            >
              <p className="font-medium">Unable to send message</p>
              <p>{localError || error}</p>
            </div>
        )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {showSuggestions && (
          <div
            className="px-4 pb-4 transition-all duration-400 ease-out"
            style={{
              animation: 'fadeInUp 0.4s ease-out',
              animationFillMode: 'both',
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              {suggestionChips.map((chip, index) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-3 py-2 rounded-xl text-xs text-white/70 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                    animation: `chipFadeIn 0.3s ease-out ${0.4 + index * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div
          className="px-4 pt-2 transition-all duration-700 ease-out delay-300"
          style={{
            animation: isEntering ? 'none' : 'fadeInUp 0.6s ease-out 0.3s',
            animationFillMode: 'both',
            paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))',
            marginBottom: '20px',
          }}
        >
          <form onSubmit={handleSubmit} className="relative">
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-3 transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (localError) setLocalError(null); // Clear local error when user types
                  if (error) clearError(); // Clear API error when user types
                }}
                placeholder={t('shareMind')}
                disabled={isDisabled}
                maxLength={2000}
                className="flex-1 bg-transparent text-sm text-white/90 placeholder:text-white/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isDisabled}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: inputValue.trim() && !isDisabled
                    ? "linear-gradient(135deg, hsl(150 50% 50% / 0.9) 0%, hsl(150 50% 60% / 0.7) 100%)"
                    : "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                  boxShadow: inputValue.trim() && !isDisabled ? "0 2px 12px hsl(150 50% 50% / 0.3)" : "none",
                }}
              >
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes messageSlideIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes chipFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes typingDot {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
