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
    <div className="border-t border-purple-100/30 bg-white/60 backdrop-blur-md px-4 py-4">
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
            flex-1 resize-none rounded-3xl border border-purple-200/50
            px-5 py-3.5 text-[15px] bg-white/80 backdrop-blur-sm
            placeholder:text-gray-400
            focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100/50
            disabled:bg-gray-100 disabled:cursor-not-allowed
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
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
