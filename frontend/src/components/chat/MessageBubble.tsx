// src/components/chat/MessageBubble.tsx

// Sender kept for future use
import type { Message, Sender } from '@/types/chat';
import { format } from 'date-fns'; // Library for formatting dates/times
import { memo } from 'react';

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user';

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          ${isUser ? 'mr-0' : 'ml-0'}
          max-w-xs               /* Limits width on small screens */
          sm:max-w-sm            /* Slightly wider on small tablets */
          md:max-w-md            /* Wider on medium screens */
          lg:max-w-lg            /* Even wider on large screens */
          px-5 py-3.5            /* Better padding inside bubble */
          rounded-2xl            /* Rounded corners */
          ${isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-md'     // User: vibrant blue gradient
            : 'bg-gradient-to-br from-purple-50 to-indigo-50 text-gray-800 rounded-bl-none shadow-sm border border-purple-100'   // Serenity: soft purple gradient
          }
        `}
      >
        <p className="text-sm md:text-base break-words">
          {message.text}
        </p>

        <p
          className={`
            text-xs mt-2          /* Small timestamp below text */
            ${isUser ? 'text-blue-100 opacity-90' : 'text-purple-600 opacity-70'}
          `}
        >
          {format(
            typeof message.timestamp === 'string' 
              ? new Date(message.timestamp) 
              : message.timestamp,
            'HH:mm'
          )} {/* e.g., 14:23 */}
        </p>
      </div>
    </div>
  );
}

export default memo(MessageBubble);