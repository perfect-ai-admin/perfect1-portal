import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReplyComposer({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) handleSend();
        }}
        placeholder="כתוב הודעה..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="2"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSend}
          disabled={!text.trim()}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
        >
          <Send className="w-4 h-4 mr-1" />
          שלח
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="px-2"
          title="צרף נתונים"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}