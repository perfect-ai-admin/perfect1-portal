import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Link2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrokenLinkChecker() {
  const [brokenLinks, setBrokenLinks] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');

  const scanAllLinks = async () => {
    setIsScanning(true);
    setScanProgress('Fetching all pages...');
    
    try {
      // Get all pages to scan
      const pages = [
        'Home', 'Blog', 'Services', 'Professions', 'Pricing', 'About', 'Contact', 'LeadsAdmin'
      ];

      const allLinks = [];
      let checked = 0;

      for (const page of pages) {
        try {
          const response = await fetch(`/${page}`);
          const html = await response.text();
          
          // Extract all links from HTML
          const linkRegex = /href=["']([^"']+)["']/g;
          let match;
          while ((match = linkRegex.exec(html)) !== null) {
            const url = match[1];
            if (url.startsWith('http') || url.startsWith('/')) {
              allLinks.push({ url, page });
            }
          }
        } catch (e) {
          console.log(`Couldn't scan ${page}`);
        }
      }

      setScanProgress(`Found ${allLinks.length} links. Checking...'`);

      // Check each link
      const results = [];
      for (let i = 0; i < allLinks.length; i++) {
        const link = allLinks[i];
        try {
          const response = await fetch(link.url, { method: 'HEAD' });
          
          if (response.status >= 400) {
            const existingReport = await base44.entities.LinkReport.filter({
              link_url: link.url
            });

            const report = await base44.entities.LinkReport.create({
              page_url: link.page,
              link_url: link.url,
              status_code: response.status,
              error_type: response.status === 404 ? '404' : 'other',
              severity: response.status === 404 ? 'high' : 'medium',
              last_checked: new Date().toISOString(),
              check_count: existingReport.length > 0 ? (existingReport[0].check_count || 0) + 1 : 1
            });
            results.push(report);
          }
        } catch (error) {
          const report = await base44.entities.LinkReport.create({
            page_url: link.page,
            link_url: link.url,
            status_code: 0,
            error_type: error.message.includes('timeout') ? 'timeout' : 'dns_error',
            severity: 'medium',
            last_checked: new Date().toISOString()
          });
          results.push(report);
        }

        checked++;
        setScanProgress(`Checked ${checked}/${allLinks.length} links...`);
      }

      setBrokenLinks(results);
      setScanProgress('');
    } catch (error) {
      setScanProgress('');
      alert('Scan error: ' + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const fixLink = async (linkId) => {
    await base44.entities.LinkReport.update(linkId, { fixed: true });
    setBrokenLinks(brokenLinks.map(l => l.id === linkId ? { ...l, fixed: true } : l));
  };

  const severityIcons = {
    critical: <XCircle className="w-5 h-5 text-red-600" />,
    high: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    medium: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    low: <CheckCircle className="w-5 h-5 text-blue-600" />
  };

  const severityColors = {
    critical: 'border-red-300 bg-red-50',
    high: 'border-orange-300 bg-orange-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-blue-300 bg-blue-50'
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200"
      >
        <h3 className="text-xl font-bold text-[#1E3A5F] mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Broken Link Checker
        </h3>

        <p className="text-sm text-gray-700 mb-4">
          Scan all pages for broken links, timeouts, and DNS errors.
        </p>

        <Button
          onClick={scanAllLinks}
          disabled={isScanning}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Scanning...
            </>
          ) : (
            'Start Full Scan'
          )}
        </Button>

        {scanProgress && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-semibold text-gray-700">{scanProgress}</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: '100%' }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="h-full bg-orange-500"
              />
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {brokenLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[#1E3A5F]">
                Broken Links Found ({brokenLinks.length})
              </h4>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                  {brokenLinks.filter(l => l.severity === 'critical' || l.severity === 'high').length} Critical
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                  {brokenLinks.filter(l => l.severity === 'medium').length} Medium
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {brokenLinks.sort((a, b) => {
                const severity = { critical: 0, high: 1, medium: 2, low: 3 };
                return severity[a.severity] - severity[b.severity];
              }).map(link => (
                <motion.div
                  key={link.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <Card className={`p-4 border-l-4 ${severityColors[link.severity]} ${link.fixed ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {severityIcons[link.severity]}
                          <span className="font-bold text-sm text-gray-800">{link.link_url}</span>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <p><strong>Found on:</strong> {link.page_url}</p>
                          <p><strong>Status:</strong> {link.status_code || 'Timeout/DNS Error'}</p>
                          {link.error_type && <p><strong>Error:</strong> {link.error_type}</p>}
                          {link.check_count > 1 && <p><strong>Checked:</strong> {link.check_count}x</p>}
                        </div>
                      </div>

                      {!link.fixed && (
                        <Button
                          onClick={() => fixLink(link.id)}
                          size="sm"
                          variant="outline"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Fixed
                        </Button>
                      )}
                      {link.fixed && (
                        <div className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">
                          ✓ Fixed
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {brokenLinks.length === 0 && !isScanning && (
        <div className="text-center py-8 text-gray-500">
          <Link2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No broken links found. Click "Start Full Scan" to check all links.</p>
        </div>
      )}
    </div>
  );
}