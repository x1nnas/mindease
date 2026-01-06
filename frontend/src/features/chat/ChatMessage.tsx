import type { Message, Sender } from './types';
import { format } from 'date-fns';
import { memo } from 'react';

interface ChatMessageProps {
  message: Message;
  _senderType?: Sender;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  const formatTime = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return format(date, 'HH:mm');
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} px-4 mb-3`}>
      <div
        className={`
          relative max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%]
          px-5 py-3 rounded-3xl transition-all duration-200
          ${isUser
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md shadow-md'
            : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-md shadow-sm border border-purple-100/50'
          }
        `}
      >
        <p 
          className={`text-[15px] leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {message.text}
        </p>
        
        <div className={`flex items-center justify-end mt-1.5 ${isUser ? 'opacity-70' : 'opacity-50'}`}>
          <span className={`text-[11px] ${isUser ? 'text-indigo-100' : 'text-gray-500'}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default memo(ChatMessage);
