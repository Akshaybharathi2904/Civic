import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Cpu,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Eye,
  MapPin,
  GitMerge,
  Send,
  Sliders,
  GitPullRequest,
  AlertTriangle,
  Radio,
  BarChart2
} from 'lucide-react';
import { AgentStepUpdate } from '../types';

interface AIProcessingPanelProps {
  steps: AgentStepUpdate[];
  isComplete: boolean;
  ticketId?: string;
}

const AGENT_METADATA = [
  { id: 1, name: 'Complaint Understanding Agent', icon: Brain, description: 'Extracting issue type, keywords, translation & severity synthesis' },
  { id: 2, name: 'Image Analysis Agent', icon: Eye, description: 'Computer Vision hazard identification & damage boundary verification' },
  { id: 3, name: 'Location Intelligence Agent', icon: MapPin, description: 'GPS reverse geocoding, ward allocation & GeoJSON spatial mapping' },
  { id: 4, name: 'Duplicate Detection Agent', icon: GitMerge, description: '2dsphere spatial proximity query & multi-citizen ticket merging' },
  { id: 5, name: 'Department Routing Agent', icon: Send, description: 'Autonomous department assignment & jurisdiction verification' },
  { id: 6, name: 'Priority Scoring Agent', icon: Sliders, description: '0-100 score matrix calculation based on public safety exposure' },
  { id: 7, name: 'Workflow Tracking Agent', icon: GitPullRequest, description: 'SLA target assignment & lifecycle timeline initialization' },
  { id: 8, name: 'Escalation Agent', icon: AlertTriangle, description: 'Emergency sweep & alert notification verification' },
  { id: 9, name: 'Citizen Notification Agent', icon: Radio, description: 'Real-time WebSocket event dispatching to citizen app room' },
  { id: 10, name: 'Government Analytics Agent', icon: BarChart2, description: 'System leaderboard update & ward statistics aggregation' }
];

export const AIProcessingPanel: React.FC<AIProcessingPanelProps> = ({ steps, isComplete, ticketId }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const getStepData = (stepNumber: number) => {
    return steps.find((s) => s.stepNumber === stepNumber);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Cpu className="w-6 h-6 text-white animate-pulse" />
            </div>
            {!isComplete && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full border-2 border-slate-950 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-wide font-outfit">
                AI Multi-Agent Swarm Visualizer
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center space-x-1">
                <Sparkles className="w-3 h-3 animate-spin" />
                <span>Live Orchestration</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {ticketId ? `Processing Ticket #${ticketId}` : 'Streaming real-time autonomous execution steps...'}
            </p>
          </div>
        </div>

        {/* Global Status badge */}
        <div className="text-right">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider flex items-center space-x-1.5 ${
              isComplete
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse'
            }`}
          >
            {isComplete ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>ALL AGENTS FINISHED</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>AGENTS EXECUTING ({steps.length}/10)</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Agents Timeline Steps */}
      <div className="mt-6 space-y-3">
        {AGENT_METADATA.map((agent) => {
          const stepData = getStepData(agent.id);
          const isExecuted = !!stepData;
          const isCurrentStep = !isComplete && steps.length + 1 === agent.id;
          const Icon = agent.icon;
          const isExpanded = expandedStep === agent.id;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: agent.id * 0.05 }}
              className={`rounded-xl p-3.5 border transition-all ${
                isExecuted
                  ? 'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-500/60'
                  : isCurrentStep
                  ? 'bg-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-60'
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedStep(isExpanded ? null : agent.id)}
              >
                <div className="flex items-center space-x-3.5">
                  {/* Step Status Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                      isExecuted
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : isCurrentStep
                        ? 'bg-cyan-500 text-slate-950 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isExecuted ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Icon className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        STEP 0{agent.id}
                      </span>
                      <h4 className="text-sm font-semibold text-white tracking-wide">
                        {agent.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 font-sans">{agent.description}</p>
                  </div>
                </div>

                {/* Right Step Metrics */}
                <div className="flex items-center space-x-3">
                  {isExecuted && (
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-800 text-cyan-300 border border-slate-700">
                        {(stepData.confidence * 100).toFixed(0)}% Conf
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800/60">
                        {stepData.executionTimeMs}ms
                      </span>
                    </div>
                  )}

                  {isCurrentStep && (
                    <span className="flex items-center space-x-1.5 px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/40">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>Executing...</span>
                    </span>
                  )}

                  {isExecuted && (
                    <button className="text-slate-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* JSON Output Viewer on click */}
              <AnimatePresence>
                {isExpanded && stepData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-slate-800 text-xs font-mono"
                  >
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                      <p className="text-[10px] text-cyan-400 font-sans font-semibold mb-1">
                        Agent Structured Output JSON:
                      </p>
                      <pre className="text-slate-300 text-[11px] leading-relaxed">
                        {JSON.stringify(stepData.agentOutput, null, 2)}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
