import type { Message } from './types';
import { memo } from 'react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} px-4 mb-3`}>
      <div
        className={`
          relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%]
          min-w-0 px-4 py-2.5 rounded-3xl transition-all duration-200
          ${isUser
            ? 'bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-br-md shadow-md'
            : 'bg-white/10 backdrop-blur-xl text-white rounded-bl-md shadow-sm border border-white/20'
          }
        `}
        style={{
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}
        >
          <p 
            className={`text-[15px] leading-relaxed ${isUser ? 'text-white' : 'text-white/90'}`}
            style={{ 
              margin: 0,
              padding: 0,
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            {message.text}
          </p>
        </div>
        
        <div className={`flex items-center justify-end mt-1 ${isUser ? 'opacity-70' : 'opacity-50'}`} style={{ marginTop: '4px' }}>
          <span className={`text-[11px] whitespace-nowrap ${isUser ? 'text-green-100' : 'text-white/50'}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
