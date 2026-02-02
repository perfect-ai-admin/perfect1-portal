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
  const [downloadCredits, setDownloadCredits] = useState(0);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

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
      setDownloadCredits(res.data.download_credits || 0);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load project' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setMessage(null);

    try {
      const res = await base44.functions.invoke('generateLogoForProject', { project_id: projectId, variation_mode: false });
      if (res.data?.ok) {
        setGenerations([{
          id: res.data.generation_id,
          external_url: res.data.image_url,
          image_url: res.data.image_url,
          status: 'generated',
          is_preview: true,
          is_unlocked: false,
          created_at: new Date().toISOString(),
          nsfw_flag: false,
          error_message: null
        }, ...generations]);
        setProject(prev => ({ 
          ...prev, 
          status: 'ready',
          free_previews_used: prev.free_previews_used + 1
        }));
        setMessage({ type: 'success', text: `✓ Preview generated! (${res.data.free_previews_left} left)` });
      } else if (res.data?.error_code === 'PREVIEW_LIMIT_REACHED') {
        setMessage({ 
          type: 'error', 
          text: 'Free previews used. Unlock a logo to continue generating.',
          action: 'buyCredits'
        });
      } else if (res.data?.error_code === 'RATE_LIMIT') {
        setMessage({ type: 'error', text: `Please wait ${res.data.wait_seconds}s before generating again.` });
      } else {
        throw new Error(res.data?.message || 'Generation failed');
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setGenerating(false);
    }
  };

  const handleUnlock = async (generation_id) => {
    try {
      const res = await base44.functions.invoke('unlockLogo', { generation_id });
      if (res.data?.ok) {
        setDownloadCredits(res.data.credits_left);
        setGenerations(prev => prev.map(g => 
          g.id === generation_id 
            ? { ...g, is_unlocked: true, status: 'approved' } 
            : g
        ));
        setMessage({ type: 'success', text: '✓ Logo unlocked!' });
      } else {
        setMessage({ type: 'error', text: res.data?.message || 'Failed to unlock logo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleApprove = async (generation_id) => {
    try {
      const res = await base44.functions.invoke('approveLogo', { generation_id });
      if (res.data?.ok) {
        setDownloadCredits(res.data.credits_left);
        setProject(prev => ({ 
          ...prev, 
          status: 'approved', 
          approved_logo_url: res.data.approved_url || res.data.approved_url,
          approved_generation_id: generation_id
        }));
        setGenerations(prev => prev.map(g => ({ ...g, is_unlocked: g.id === generation_id ? true : g.is_unlocked, status: g.id === generation_id ? 'approved' : g.status })));
        setMessage({ type: 'success', text: '✓ Logo approved!' });
      }
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
              downloadCredits > 0 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              <Zap className="w-4 h-4" />
              Download Credits: {downloadCredits}
            </span>
            <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 rounded-full text-sm font-semibold">
              Previews: {project.free_previews_limit - (project.free_previews_used || 0)}
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
              className={`mb-6 p-4 rounded-lg font-medium flex items-center justify-between gap-2 ${
                message.type === 'error' 
                  ? 'bg-red-100 text-red-800 border border-red-300' 
                  : 'bg-green-100 text-green-800 border border-green-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
              {message.action === 'buyCredits' && (
                <a href="/credits" className="ml-2 underline hover:no-underline font-bold">Buy Credits →</a>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        {project.status !== 'approved' && (
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
                  Generate Preview (Free)
                </>
              )}
            </Button>
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
                <div className="flex justify-center mb-6">
                  <WatermarkedLogo
                    src={project.approved_logo_url}
                    alt="Approved logo"
                    className="w-auto h-80 object-contain shadow-lg rounded-lg bg-white"
                    businessName={project.brand_name}
                    slogan={project.slogan}
                    watermark={false}
                    onImageReady={(url) => setDownloadUrl(url)}
                  />
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  <a 
                    href={downloadUrl || project.approved_logo_url} 
                    download={`${project.brand_name}_logo.png`}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                  <button
                    onClick={() => copyToClipboard(downloadUrl || project.approved_logo_url, 'approved')}
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
                        {gen.is_preview && !gen.is_unlocked && gen.status !== 'failed' && (
                          <div className="space-y-2">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">Preview</span>
                            <Button
                              onClick={() => handleUnlock(gen.id)}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
                            >
                              Unlock & Download
                            </Button>
                            <Button
                              onClick={() => handleApprove(gen.id)}
                              variant="outline"
                              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 font-bold rounded-lg"
                            >
                              Approve (Unlock)
                            </Button>
                          </div>
                        )}
                        {gen.is_unlocked && gen.status === 'approved' && (
                          <div className="space-y-2">
                            <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">Unlocked</span>
                            <div className="text-center text-green-700 font-bold text-lg">✓ Ready to Download</div>
                          </div>
                        )}
                        {gen.status === 'failed' && (
                          <span className="inline-block text-red-600 text-xs font-bold">Failed</span>
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