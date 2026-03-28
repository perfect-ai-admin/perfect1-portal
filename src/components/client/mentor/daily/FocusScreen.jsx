import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Lock, 
  ArrowRight,
  BrainCircuit,
  AlertOctagon
} from 'lucide-react';

export default function FocusScreen({ focus, onSave }) {
  const [distractions, setDistractions] = useState([
    { id: 1, text: 'רשתות חברתיות באמצע היום' },
    { id: 2, text: 'בדיקת מייל כל 5 דקות' }
  ]);
  const [newDistraction, setNewDistraction] = useState('');

  const [priorities, setPriorities] = useState([
    { id: 1, text: 'שיחות ללקוחות מתעניינים', type: 'important' },
    { id: 2, text: 'עיצוב מחדש של הלוגו', type: 'noise' }
  ]);
  const [newPriority, setNewPriority] = useState('');

  const addDistraction = () => {
    if (newDistraction.trim()) {
      setDistractions([...distractions, { id: Date.now(), text: newDistraction }]);
      setNewDistraction('');
    }
  };

  const addPriority = () => {
    if (newPriority.trim()) {
      setPriorities([...priorities, { id: Date.now(), text: newPriority, type: 'noise' }]);
      setNewPriority('');
    }
  };

  const togglePriorityType = (id) => {
    setPriorities(priorities.map(p => 
        p.id === id 
        ? { ...p, type: p.type === 'important' ? 'noise' : 'important' } 
        : p
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="bg-purple-100 p-3 rounded-2xl text-purple-600">
            <BrainCircuit className="w-8 h-8" />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-gray-900">מסננת הפוקוס</h2>
            <p className="text-gray-500">בוא ננקה את הרעש ונבין מה באמת חשוב.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Prioritization Tool */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">⚖️ חשוב מול דחוף</h3>
                <Badge variant="outline" className="bg-gray-50">מטריצת אייזנהאואר</Badge>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex gap-2 mb-4">
                    <Input 
                        placeholder="הוסף משימה שיושבת עליך..." 
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addPriority()}
                    />
                    <Button onClick={addPriority} size="icon"><ArrowRight className="w-4 h-4" /></Button>
                </div>

                <div className="space-y-3">
                    <AnimatePresence>
                    {priorities.map(p => (
                        <motion.div 
                            key={p.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                p.type === 'important' 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200 opacity-60'
                            }`}
                            onClick={() => togglePriorityType(p.id)}
                        >
                            <span className={`font-medium ${p.type === 'important' ? 'text-green-800' : 'text-gray-500 line-through'}`}>
                                {p.text}
                            </span>
                            <Badge className={p.type === 'important' ? 'bg-green-500' : 'bg-gray-400'}>
                                {p.type === 'important' ? 'חשוב!' : 'רעש'}
                            </Badge>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">לחץ על משימה כדי לשנות את החשיבות שלה</p>
            </div>
        </div>

        {/* Distraction Killer */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">🚫 רוצחי הזמן שלך</h3>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 bg-red-100 rounded-br-full -mt-10 -ml-10"></div>
                
                <div className="relative z-10">
                    <div className="flex gap-2 mb-4">
                        <Input 
                            placeholder="מה מסיח את דעתך?" 
                            value={newDistraction}
                            onChange={(e) => setNewDistraction(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDistraction()}
                            className="bg-white border-red-100 focus-visible:ring-red-500"
                        />
                        <Button onClick={addDistraction} size="icon" className="bg-red-600 hover:bg-red-700"><Lock className="w-4 h-4" /></Button>
                    </div>

                    <div className="space-y-2">
                        {distractions.map(d => (
                            <div key={d.id} className="bg-white/80 backdrop-blur rounded-lg p-3 flex items-center gap-3 text-red-900 border border-red-100">
                                <AlertOctagon className="w-4 h-4 text-red-500" />
                                <span className="flex-1 text-sm font-medium">{d.text}</span>
                                <button onClick={() => setDistractions(distractions.filter(x => x.id !== d.id))} className="text-red-300 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {distractions.length > 0 && (
                        <div className="mt-6 text-center">
                            <p className="text-red-800 text-sm font-bold mb-2">ההתחייבות שלי:</p>
                            <p className="text-red-700/80 text-xs italic">
                                "אני מתחייב לנעול את הדברים האלו מחוץ לחדר בזמן שאני עובד על הדבר החשוב."
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </motion.div>
  );
}