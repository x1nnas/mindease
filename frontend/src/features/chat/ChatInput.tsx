import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '56px';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/20 bg-white/10 backdrop-blur-xl px-4 py-4">
      <div className="flex items-end gap-2.5 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share what's on your mind..."
          rows={1}
          disabled={disabled}
          className={`
            flex-1 resize-none rounded-3xl border border-white/20
            px-5 py-3.5 text-[15px] bg-white/10 backdrop-blur-sm text-white
            placeholder:text-white/40
            focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-500/20
            disabled:bg-white/5 disabled:cursor-not-allowed disabled:text-white/40
            transition-all overflow-y-auto shadow-sm
          `}
          style={{ minHeight: '56px', maxHeight: '120px' }}
        />

        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className={`
            p-3.5 rounded-full transition-all flex-shrink-0
            ${input.trim() && !disabled
              ? 'bg-gradient-to-br from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg shadow-green-500/30 active:scale-95'
              : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/10'
            }
          `}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
