import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function EditorItemList({ items = [], onUpdate, renderItem, addLabel = 'הוסף פריט', createNew, maxItems = 20 }) {
  const handleAdd = () => {
    if (items.length >= maxItems) return;
    onUpdate([...items, createNew()]);
  };

  const handleRemove = (index) => {
    onUpdate(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, updated) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updated };
    onUpdate(newItems);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onUpdate(newItems);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start gap-2">
            <div className="flex flex-col gap-1 pt-1">
              <button 
                type="button"
                onClick={() => handleMoveUp(index)}
                className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-slate-400 hover:text-slate-600"
                disabled={index === 0}
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-bold text-slate-300 text-center">{index + 1}</span>
            </div>
            <div className="flex-1 space-y-3">
              {renderItem(item, index, (updated) => handleItemChange(index, updated))}
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {items.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 gap-2"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}