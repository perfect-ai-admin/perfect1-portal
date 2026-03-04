import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Monitor, Smartphone, Copy } from 'lucide-react';
import { toast } from 'sonner';
import DynamicLandingPage from '@/components/landing-page/DynamicLandingPage';

export default function LandingPagePreviewPanel({ page, publicUrl }) {
  const [viewMode, setViewMode] = useState('desktop');

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border rounded-lg p-1">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {publicUrl && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success('הקישור הועתק!');
                }}
              >
                <Copy className="w-3.5 h-3.5" />
                העתק קישור
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-green-600 hover:bg-green-700"
                onClick={() => window.open(publicUrl, '_blank')}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                פתח בחלון חדש
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview Frame */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`mx-auto transition-all duration-300 overflow-y-auto bg-white ${
            viewMode === 'mobile' ? 'max-w-[375px] border-x border-gray-200' : 'w-full'
          }`} style={{ maxHeight: '80vh' }}>
            <DynamicLandingPage data={page} isThumbnail={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}