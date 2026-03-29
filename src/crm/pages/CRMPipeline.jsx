import React from 'react';
import PipelineBoard from '../components/pipeline/PipelineBoard';

export default function CRMPipeline() {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[#1E3A5F]">Pipeline</h1>
      </div>
      <PipelineBoard />
    </div>
  );
}
