import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
    Search, 
    Bot, 
    Layout, 
    Code, 
    Database, 
    Zap,
    ChevronDown,
    ChevronUp,
    Edit,
    Save,
    X
} from 'lucide-react';
import { toast } from 'sonner';

export default function SystemConfigManager() {
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedComponent, setSelectedComponent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        loadComponents();
    }, []);

    const loadComponents = async () => {
        setLoading(true);
        try {
           
            const data = [];
            setComponents(data);
        } catch (error) {
            console.error('Error loading components:', error);
            toast.error('שגיאה בטעינת הרכיבים');
        } finally {
            setLoading(false);
        }
    };

    const categories = {
        all: { label: 'הכל', icon: Layout, color: 'bg-gray-100' },
        bots: { label: 'בוטים וסוכנים', icon: Bot, color: 'bg-purple-100' },
        client_features: { label: 'תכונות לקוח', icon: Layout, color: 'bg-blue-100' },
        backend_functions: { label: 'פונקציות Backend', icon: Code, color: 'bg-green-100' },
        entities: { label: 'ישויות Data', icon: Database, color: 'bg-orange-100' },
        automation: { label: 'אוטומציות', icon: Zap, color: 'bg-yellow-100' }
    };

    const filteredComponents = components.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.short_description?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = activeCategory === 'all' || c.category === activeCategory;
        return matchSearch && matchCategory;
    });

    const groupedComponents = filteredComponents.reduce((acc, comp) => {
        if (!acc[comp.category]) acc[comp.category] = [];
        acc[comp.category].push(comp);
        return acc;
    }, {});

    const handleSave = async (component) => {
        try {
           
            toast.success('הרכיב עודכן בהצלחה');
            setEditMode(false);
            setSelectedComponent(null);
            loadComponents();
        } catch (error) {
            console.error('Error saving component:', error);
            toast.error('שגיאה בשמירת הרכיב');
        }
    };

    const ComponentCard = ({ component }) => {
        const isExpanded = expandedId === component.id;
        const CategoryIcon = categories[component.category]?.icon || Layout;

        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${categories[component.category]?.color || 'bg-gray-100'}`}>
                            <CategoryIcon className="w-5 h-5 text-gray-700" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{component.name}</h3>
                                {!component.is_active && (
                                    <Badge variant="outline" className="text-xs">לא פעיל</Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {component.short_description}
                            </p>
                            
                            {isExpanded && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                                    <div>
                                        <Label className="text-xs text-gray-500">תיאור מלא:</Label>
                                        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                            {component.full_description || 'אין תיאור מלא'}
                                        </p>
                                    </div>
                                    
                                    {component.file_path && (
                                        <div>
                                            <Label className="text-xs text-gray-500">נתיב קובץ:</Label>
                                            <code className="text-xs bg-gray-800 text-white px-2 py-1 rounded block mt-1">
                                                {component.file_path}
                                            </code>
                                        </div>
                                    )}

                                    {component.dependencies?.length > 0 && (
                                        <div>
                                            <Label className="text-xs text-gray-500">תלויות:</Label>
                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                {component.dependencies.map((dep, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {dep}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {component.configuration && Object.keys(component.configuration).length > 0 && (
                                        <div>
                                            <Label className="text-xs text-gray-500">הגדרות:</Label>
                                            <pre className="text-xs bg-gray-800 text-white p-2 rounded mt-1 overflow-auto max-h-40">
                                                {JSON.stringify(component.configuration, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            size="sm" 
                                            onClick={() => {
                                                setSelectedComponent(component);
                                                setEditMode(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 ml-2" />
                                            ערוך
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : component.id)}
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        );
    };

    const EditDialog = ({ component, onClose, onSave }) => {
        const [formData, setFormData] = useState(component);

        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>עריכת {component.name}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        <div>
                            <Label>שם הרכיב</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <Label>תיאור קצר (משפט אחד)</Label>
                            <Input
                                value={formData.short_description}
                                onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                                placeholder="מה הרכיב עושה במשפט אחד"
                            />
                        </div>

                        <div>
                            <Label>תיאור מלא והרחבה</Label>
                            <Textarea
                                value={formData.full_description || ''}
                                onChange={(e) => setFormData({...formData, full_description: e.target.value})}
                                rows={6}
                                placeholder="הסבר מפורט על הרכיב, איך הוא עובד, מה הוא משפיע..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                            />
                            <Label>הרכיב פעיל</Label>
                        </div>

                        <div>
                            <Label>נתיב קובץ (אופציונלי)</Label>
                            <Input
                                value={formData.file_path || ''}
                                onChange={(e) => setFormData({...formData, file_path: e.target.value})}
                                placeholder="functions/mentorChat.js"
                            />
                        </div>

                        <div>
                            <Label>הערות</Label>
                            <Textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={onClose}>
                                <X className="w-4 h-4 ml-2" />
                                ביטול
                            </Button>
                            <Button onClick={() => onSave(formData)}>
                                <Save className="w-4 h-4 ml-2" />
                                שמור שינויים
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    };

    if (loading) {
        return <div className="p-8 text-center">טוען...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-2">ניהול מערכת וקונפיגורציות</h2>
                <p className="text-purple-100">נהל את כל הרכיבים והמושגים החשובים במערכת</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                    placeholder="חפש רכיב..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10"
                />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.entries(categories).map(([key, cat]) => {
                    const Icon = cat.icon;
                    const count = key === 'all' 
                        ? components.length 
                        : components.filter(c => c.category === key).length;
                    
                    return (
                        <Button
                            key={key}
                            variant={activeCategory === key ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveCategory(key)}
                            className="whitespace-nowrap"
                        >
                            <Icon className="w-4 h-4 ml-2" />
                            {cat.label}
                            <Badge variant="secondary" className="mr-2">{count}</Badge>
                        </Button>
                    );
                })}
            </div>

            {/* Components List */}
            <div className="space-y-6">
                {activeCategory === 'all' ? (
                    Object.entries(groupedComponents).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                {React.createElement(categories[category]?.icon || Layout, { className: 'w-5 h-5' })}
                                {categories[category]?.label}
                                <Badge variant="outline">{items.length}</Badge>
                            </h3>
                            <div className="grid gap-3">
                                {items.map(comp => (
                                    <ComponentCard key={comp.id} component={comp} />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="grid gap-3">
                        {filteredComponents.map(comp => (
                            <ComponentCard key={comp.id} component={comp} />
                        ))}
                    </div>
                )}

                {filteredComponents.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        לא נמצאו רכיבים
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            {editMode && selectedComponent && (
                <EditDialog
                    component={selectedComponent}
                    onClose={() => {
                        setEditMode(false);
                        setSelectedComponent(null);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}