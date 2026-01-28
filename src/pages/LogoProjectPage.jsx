import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [credits, setCredits] = useState(0);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      const res = await base44.functions.invoke('getProjectAndGenerations', { project_id: id });
      setProject(res.data.project);
      setGenerations(res.data.generations);
      setCredits(res.data.credits);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setMessage(null);

    try {
      const res = await base44.functions.invoke('generateLogoForProject', { project_id: id });
      setGenerations([res.data, ...generations]);
      setProject(prev => ({ ...prev, status: 'ready' }));
      setCredits(prev => prev - 1);
      setMessage({ type: 'success', text: 'Logo generated!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || error.message });
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (generation_id) => {
    try {
      const res = await base44.functions.invoke('approveLogo', { generation_id });
      setProject(prev => ({ ...prev, status: 'approved', approved_logo_url: res.data.approved_url }));
      setGenerations(prev => prev.map(g => ({ ...g, status: g.id === generation_id ? 'approved' : g.status })));
      setMessage({ type: 'success', text: 'Logo approved!' });
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
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!project) {
    return <div className="p-6 text-center text-red-600">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{project.brand_name}</h1>
          <p className="text-gray-600">{project.business_type} • {project.style}</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm font-bold text-blue-600">Credits: {credits}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">{project.status}</span>
          </div>
        </div>

        {/* Messages */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        {credits > 0 && project.status !== 'approved' && (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-bold"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Logo'
            )}
          </Button>
        )}

        {credits === 0 && (
          <div className="mb-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-yellow-800">No Credits</p>
              <p className="text-sm text-yellow-700">You need credits to generate logos. Contact admin.</p>
            </div>
          </div>
        )}

        {/* Approved Logo */}
        {project.status === 'approved' && project.approved_logo_url && (
          <Card className="mb-8 border-2 border-green-400 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Approved Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={project.approved_logo_url} alt="Approved logo" className="w-64 h-64 object-cover mb-4 rounded" />
              <div className="flex gap-2">
                <a href={project.approved_logo_url} download className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  <Download className="w-4 h-4" /> Download
                </a>
                <button
                  onClick={() => copyToClipboard(project.approved_logo_url, 'approved')}
                  className="flex items-center gap-2 px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50"
                >
                  {copied === 'approved' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === 'approved' ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gallery */}
        {generations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Generation History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generations.map(gen => (
                <Card key={gen.id} className={gen.status === 'approved' ? 'border-green-400 bg-green-50' : ''}>
                  <CardContent className="pt-4">
                    {gen.status === 'failed' ? (
                      <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center mb-4">
                        <div className="text-center">
                          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                          <p className="text-sm text-red-600">{gen.error_message}</p>
                        </div>
                      </div>
                    ) : (
                      <img src={gen.image_url} alt="Generated logo" className="w-full h-48 object-cover rounded mb-4" />
                    )}
                    <p className="text-xs text-gray-500 mb-3">{new Date(gen.created_at).toLocaleDateString()}</p>
                    {gen.status !== 'failed' && gen.status !== 'approved' && (
                      <Button
                        onClick={() => handleApprove(gen.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Approve This Logo
                      </Button>
                    )}
                    {gen.status === 'approved' && (
                      <div className="text-center text-green-700 font-bold">✓ Approved</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}