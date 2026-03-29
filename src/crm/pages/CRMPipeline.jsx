import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import PipelineBoard from '../components/pipeline/PipelineBoard';
import CreateLeadDialog from '../components/CreateLeadDialog';

export default function CRMPipeline() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#1E3A5F]">Pipeline</h1>
        <Button size="sm" onClick={() => setShowCreateDialog(true)} className="bg-[#1E3A5F] hover:bg-[#16324f]">
          <UserPlus size={14} className="ml-1" /> ליד חדש
        </Button>
      </div>
      <PipelineBoard />
      <CreateLeadDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </div>
  );
}
