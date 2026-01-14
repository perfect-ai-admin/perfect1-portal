import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ConversationHistory({ conversations, onSelect, onDelete }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.preview?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByDate = filteredConversations.reduce((groups, conv) => {
    const date = new Date(conv.timestamp).toLocaleDateString('he-IL');
    if (!groups[date]) groups[date] = [];
    groups[date].push(conv);
    return groups;
  }, {});

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="חפש בהיסטוריה..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Conversations List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, convs]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="space-y-2">
                {convs.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-lg p-4 shadow hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onSelect(conv)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {conv.title || 'שיחה ללא כותרת'}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {conv.preview}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}