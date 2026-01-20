import { memo } from 'react';

const TypingIndicator = memo(() => (
  <div className="flex justify-start w-full px-4 mb-4">
    <div className="bg-white/10 backdrop-blur-xl px-5 py-3.5 rounded-3xl rounded-bl-md shadow-sm border border-white/20">
      <div className="flex items-center space-x-3">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-green-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-green-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }} />
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-green-400 to-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }} />
        </div>
        <p className="text-sm text-green-400 font-medium">Serenity is thinking...</p>
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
