import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Download, Copy, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoProjectPage() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project_id');

  const [project, setProject] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [credits, setCredits] = useState(0);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const res = await base44.functions.invoke('getProjectAndGenerations', { project_id: projectId });
      setProject(res.data.project);
      setGenerations(res.data.generations || []);
      setCredits(res.data.credits || 0);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load project' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (generating || credits <= 0) return;
    setGenerating(true);
    setMessage(null);

    try {
      const res = await base44.functions.invoke('generateLogoForProject', { project_id: projectId, variation_mode: false });
      if (res.data.success) {
        setGenerations([{
          id: res.data.generation_id,
          image_url: res.data.image_url,
          status: 'generated',
          created_at: res.data.created_at,
          nsfw_flag: false,
          error_message: null
        }, ...generations]);
        setProject(prev => ({ ...prev, status: 'ready' }));
        setCredits(prev => Math.max(0, prev - 1));
        setMessage({ type: 'success', text: '✓ Logo generated!' });
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (generation_id) => {
    try {
      const res = await base44.functions.invoke('approveLogo', { generation_id });
      setProject(prev => ({ 
        ...prev, 
        status: 'approved', 
        approved_logo_url: res.data.approved_url,
        approved_generation_id: generation_id
      }));
      setGenerations(prev => prev.map(g => ({ ...g, status: g.id === generation_id ? 'approved' : g.status })));
      setMessage({ type: 'success', text: '✓ Logo approved!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const copyToClipboard = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.brand_name}</h1>
          <p className="text-gray-600 text-lg">{project.business_type} • {project.style}</p>
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
              credits > 0 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <Zap className="w-4 h-4" />
              Credits: {credits}
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-semibold capitalize">{project.status}</span>
          </div>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg font-medium flex items-center gap-2 ${
                message.type === 'error' 
                  ? 'bg-red-100 text-red-800 border border-red-300' 
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}
            >
              {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        {credits > 0 && project.status !== 'approved' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Logo
                </>
              )}
            </Button>
          </motion.div>
        )}

        {credits === 0 && project.status !== 'approved' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-800">No Credits</p>
              <p className="text-sm text-yellow-700">You need credits to generate logos.</p>
            </div>
          </motion.div>
        )}

        {/* Approved Logo */}
        {project.status === 'approved' && project.approved_logo_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <Check className="w-6 h-6" />
                  Approved Logo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img src={project.approved_logo_url} alt="Approved logo" className="w-80 h-80 object-contain mb-6" />
                <div className="flex gap-3 flex-wrap">
                  <a 
                    href={project.approved_logo_url} 
                    download 
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                  <button
                    onClick={() => copyToClipboard(project.approved_logo_url, 'approved')}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-lg font-bold transition-colors"
                  >
                    {copied === 'approved' ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Gallery */}
        {generations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generation History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {generations.map((gen, idx) => (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`overflow-hidden transition-all ${gen.status === 'approved' ? 'border-2 border-green-400 bg-green-50' : 'hover:shadow-lg'}`}>
                    <CardContent className="pt-0">
                      {gen.status === 'failed' ? (
                        <div className="w-full h-56 bg-gray-200 rounded-t-lg flex items-center justify-center mb-0">
                          <div className="text-center">
                            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <p className="text-sm text-red-600 font-medium">{gen.error_message || 'Failed to generate'}</p>
                          </div>
                        </div>
                      ) : (
                        <img src={gen.image_url} alt="Generated logo" className="w-full h-56 object-cover rounded-t-lg" />
                      )}
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-500 font-medium">{new Date(gen.created_at).toLocaleDateString()}</p>
                        {gen.status !== 'failed' && gen.status !== 'approved' && (
                          <Button
                            onClick={() => handleApprove(gen.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                          >
                            Approve This Logo
                          </Button>
                        )}
                        {gen.status === 'approved' && (
                          <div className="text-center text-green-700 font-bold text-lg">✓ Approved</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {generations.length === 0 && project.status === 'draft' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No generations yet. Click "Generate Logo" to start!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}