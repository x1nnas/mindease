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
      className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-xs               /* Limits width on small screens */
          lg:max-w-md            /* Wider on larger screens */
          px-4 py-3              /* Padding inside bubble */
          rounded-2xl            /* Rounded corners */
          shadow-sm              /* Subtle depth */
          ${isUser
            ? 'bg-blue-600 text-white rounded-br-none'     // User: blue, no bottom-right corner (tail effect)
            : 'bg-gray-100 text-gray-900 rounded-bl-none'   // Serenity: light gray, no bottom-left corner
          }
        `}
      >
        <p className="text-sm md:text-base break-words">
          {message.text}
        </p>

        <p
          className={`
            text-xs mt-1          /* Small timestamp below text */
            ${isUser ? 'text-blue-200' : 'text-gray-500'}
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