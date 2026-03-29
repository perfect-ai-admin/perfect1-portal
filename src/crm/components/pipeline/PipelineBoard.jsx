import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import PipelineCard from './PipelineCard';
import { OPEN_STAGES } from '../../constants/pipeline';
import { usePipelineLeads, useUpdateLeadStage, useAgents } from '../../hooks/useCRM';
import { toast } from 'sonner';

export default function PipelineBoard() {
  const navigate = useNavigate();
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterTemperature, setFilterTemperature] = useState('all');
  const [search, setSearch] = useState('');

  const { data: leads = [], isLoading, isError, error } = usePipelineLeads({});
  const { data: agents = [] } = useAgents();
  const updateStage = useUpdateLeadStage();

  // Filter leads to open stages only, then apply filters
  const filteredLeads = useMemo(() => {
    const openSlugs = new Set(OPEN_STAGES.map(s => s.slug));
    return leads.filter(lead => {
      if (!openSlugs.has(lead.pipeline_stage || 'new_lead')) return false;
      if (filterAgent !== 'all' && lead.agent_id !== filterAgent) return false;
      if (filterTemperature !== 'all' && lead.temperature !== filterTemperature) return false;
      if (search) {
        const s = search.toLowerCase();
        const name = (lead.name || '').toLowerCase();
        const phone = (lead.phone || '').toLowerCase();
        if (!name.includes(s) && !phone.includes(s)) return false;
      }
      return true;
    });
  }, [leads, filterAgent, filterTemperature, search]);

  // Group by stage
  const columns = useMemo(() => {
    const grouped = {};
    OPEN_STAGES.forEach(stage => {
      grouped[stage.slug] = [];
    });
    filteredLeads.forEach(lead => {
      const stage = lead.pipeline_stage || 'new_lead';
      if (grouped[stage]) {
        grouped[stage].push(lead);
      }
    });
    return grouped;
  }, [filteredLeads]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStage = destination.droppableId;
    updateStage.mutate(
      { lead_id: draggableId, new_stage: newStage },
      {
        onSuccess: () => toast.success('השלב עודכן'),
        onError: (err) => toast.error(`שגיאה: ${err.message}`),
      }
    );
  };

  const handleCardClick = (lead) => {
    navigate(`/CRM/leads/${lead.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1E3A5F] rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">שגיאה בטעינת לידים</p>
          <p className="text-sm text-slate-500">{error?.message || 'נסה לרענן את הדף'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או טלפון..."
            className="pr-9"
          />
        </div>

        <Select value={filterAgent} onValueChange={setFilterAgent}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="כל הנציגים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הנציגים</SelectItem>
            {agents.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTemperature} onValueChange={setFilterTemperature}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="טמפרטורה" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="hot">חם</SelectItem>
            <SelectItem value="warm">חמים</SelectItem>
            <SelectItem value="cold">קר</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-slate-500">
          {filteredLeads.length} לידים
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-3 overflow-x-auto pb-4">
          {OPEN_STAGES.map(stage => (
            <div key={stage.slug} className="flex-shrink-0 w-[280px]">
              {/* Column Header */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-t-lg mb-2"
                style={{ backgroundColor: `${stage.color}15`, borderBottom: `2px solid ${stage.color}` }}
              >
                <span className="font-medium text-sm" style={{ color: stage.color }}>
                  {stage.label}
                </span>
                <span
                  className="text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                  style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                >
                  {columns[stage.slug]?.length || 0}
                </span>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={stage.slug}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-2 p-1 rounded-b-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-100' : 'bg-transparent'
                    }`}
                  >
                    {(columns[stage.slug] || []).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <PipelineCard
                              lead={lead}
                              onClick={handleCardClick}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
