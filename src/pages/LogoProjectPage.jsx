import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Zap, CreditCard, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LogoProjectPage() {
    const { project_id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [credits, setCredits] = useState(0);
    const [generations, setGenerations] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generationStep, setGenerationStep] = useState('');

    useEffect(() => {
        loadData();
    }, [project_id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectRes, creditsRes, genRes] = await Promise.all([
                base44.functions.invoke('getOrCreateUserAccount', {}),
                base44.functions.invoke('getCredits', {}),
                base44.functions.invoke('listProjectGenerations', { project_id })
            ]);

            const proj = await base44.entities.LogoProject.get(project_id);
            setProject(proj);
            setCredits(creditsRes.logo_credits);
            setGenerations(genRes.generations || []);
        } catch (err) {
            toast.error('Failed to load project');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (variationMode = false) => {
        setIsGenerating(true);
        setGenerationStep('Preparing...');
        try {
            setGenerationStep('Generating logo...');
            const res = await base44.functions.invoke('generateLogoForProject', {
                project_id,
                variation_mode: variationMode
            });

            if (res.ok) {
                setGenerationStep('Finishing...');
                await new Promise(r => setTimeout(r, 500));
                toast.success('Logo generated!');
                await loadData();
            } else {
                if (res.error === 'NO_CREDITS') {
                    toast.error('No credits left');
                    navigate('/credits');
                } else if (res.error === 'NSFW') {
                    toast.error('Could not generate this concept. Try different wording.');
                } else {
                    toast.error(res.message || 'Generation failed');
                }
                setCredits(0);
            }
        } catch (err) {
            toast.error('Error: ' + err.message);
        } finally {
            setIsGenerating(false);
            setGenerationStep('');
        }
    };

    const handleApprove = async (generation_id) => {
        try {
            await base44.functions.invoke('approveLogo', { generation_id });
            toast.success('Logo approved!');
            await loadData();
        } catch (err) {
            toast.error('Error: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Project not found</p>
                    <Button onClick={() => navigate('/')} className="mt-4">Go Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{project.brand_name}</h1>
                            <p className="text-gray-600 mt-1">{project.business_type} • {project.style}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 px-4 py-2 rounded-lg">
                                <p className="text-xs text-gray-600">Credits Left</p>
                                <p className="text-2xl font-bold text-blue-600">{credits}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg ${
                                project.status === 'approved' ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                                <p className="text-xs text-gray-600">Status</p>
                                <p className="text-sm font-bold capitalize">{project.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                    {credits === 0 ? (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                            <p className="text-yellow-800 mb-4">No credits left. Add credits to generate logos.</p>
                            <Button 
                                onClick={() => navigate('/credits')}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Go to Credits
                            </Button>
                        </div>
                    ) : isGenerating ? (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                            <p className="text-blue-900 font-semibold">{generationStep || 'Generating...'}</p>
                        </div>
                    ) : (
                        <div className="flex gap-3 flex-wrap">
                            <Button 
                                onClick={() => handleGenerate(false)}
                                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                                disabled={isGenerating}
                            >
                                <Wand2 className="w-4 h-4 ml-2" />
                                Generate Logo
                            </Button>
                            <Button 
                                onClick={() => handleGenerate(true)}
                                variant="outline"
                                className="flex-1 h-12"
                                disabled={isGenerating}
                            >
                                <Zap className="w-4 h-4 ml-2" />
                                Generate Variation
                            </Button>
                        </div>
                    )}
                </div>

                {/* Approved Logo */}
                {project.approved_logo_url && (
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">✓ Approved Logo</h2>
                        <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center min-h-64">
                            <img 
                                src={project.approved_logo_url} 
                                alt="Approved logo"
                                className="max-h-64 max-w-full object-contain"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                onClick={() => window.open(project.approved_logo_url)}
                                variant="outline"
                                className="flex-1"
                            >
                                Open Image
                            </Button>
                            <Button 
                                onClick={() => {
                                    navigator.clipboard.writeText(project.approved_logo_url);
                                    toast.success('Link copied!');
                                }}
                                variant="outline"
                                className="flex-1"
                            >
                                <Copy className="w-4 h-4 ml-2" />
                                Copy Link
                            </Button>
                        </div>
                        {credits > 0 && (
                            <Button 
                                onClick={() => handleGenerate(true)}
                                className="w-full"
                            >
                                Generate More Variations
                            </Button>
                        )}
                    </div>
                )}

                {/* Gallery */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Gallery {generations.length > 0 && `(${generations.length})`}
                    </h2>
                    
                    {generations.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                            <p>Click "Generate Logo" to create your first logo.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {generations.map((gen) => (
                                <motion.div
                                    key={gen.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl shadow-sm overflow-hidden border-2 border-transparent hover:border-gray-300 transition-all"
                                >
                                    {gen.external_url ? (
                                        <div className="bg-gray-100 aspect-square flex items-center justify-center p-4">
                                            <img 
                                                src={gen.external_url}
                                                alt="Generated logo"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 aspect-square flex items-center justify-center">
                                            <div className="text-center p-4">
                                                <p className="text-xs text-red-600">{gen.error_message}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {new Date(gen.created_at).toLocaleDateString()}
                                            </span>
                                            {gen.status === 'approved' && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Approved
                                                </span>
                                            )}
                                        </div>
                                        {gen.status === 'generated' && gen.external_url && (
                                            <Button 
                                                onClick={() => handleApprove(gen.id)}
                                                className="w-full h-9 bg-green-600 hover:bg-green-700"
                                                size="sm"
                                            >
                                                Approve This Logo
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}