import type { Message, Sender } from './types';
import { format } from 'date-fns';
import { memo } from 'react';

interface ChatMessageProps {
  message: Message;
  _senderType?: Sender;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          ${isUser ? 'mr-0' : 'ml-0'}
          max-w-xs
          sm:max-w-sm
          md:max-w-md
          lg:max-w-lg
          px-5 py-3.5
          rounded-2xl
          ${isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-md'
            : 'bg-gradient-to-br from-purple-50 to-indigo-50 text-gray-800 rounded-bl-none shadow-sm border border-purple-100'
          }
        `}
      >
        <p className="text-sm md:text-base break-words">
          {message.text}
        </p>

        <p
          className={`
            text-xs mt-2
            ${isUser ? 'text-blue-100 opacity-90' : 'text-purple-600 opacity-70'}
          `}
        >
          {format(
            typeof message.timestamp === 'string' 
              ? new Date(message.timestamp) 
              : message.timestamp,
            'HH:mm'
          )}
        </p>
      </div>
    </div>
  );
}

export default memo(ChatMessage);

