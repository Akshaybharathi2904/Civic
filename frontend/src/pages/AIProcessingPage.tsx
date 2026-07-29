import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import { AgentStepUpdate, Complaint } from '../types';
import {
  Brain,
  Eye,
  MapPin,
  GitMerge,
  Users,
  Sliders,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Check,
  XCircle,
  RotateCcw,
  Terminal
} from 'lucide-react';

const ADK_AGENTS_METADATA = [
  { id: 1, name: 'Complaint Understanding Agent', icon: Brain, description: 'Understands complaint, extracts category, issue type, severity synthesis' },
  { id: 2, name: 'Vision Analysis Agent', icon: Eye, description: 'Analyzes uploaded photos for visual hazard detection & damage estimation' },
  { id: 3, name: 'Location Intelligence Agent', icon: MapPin, description: 'Reverse geocodes coordinates via LocationTool into ward, zone & landmark' },
  { id: 4, name: 'Duplicate Detection Agent', icon: GitMerge, description: 'Executes DuplicateSearchTool for 500m proximity query & semantic matching' },
  { id: 5, name: 'Community Validation Agent', icon: Users, description: 'Calculates community confidence, citizen confirmations & authenticity score' },
  { id: 6, name: 'Priority Assessment Agent', icon: Sliders, description: 'Computes 0-100 priority score via PriorityTool, urgency tier & SLA hours' },
  { id: 7, name: 'Department Recommendation Agent', icon: Send, description: 'Maps jurisdiction via DepartmentTool to official government office' }
];

export const AIProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { joinComplaintRoom, liveAgentSteps } = useSocket();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [expandedJson, setExpandedJson] = useState<number | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (id) {
      joinComplaintRoom(id);
      api.get(`/complaints/${id}`)
        .then((res) => setComplaint(res.data.complaint))
        .catch((err) => console.error(err));
    }
  }, [id]);

  const complaintSteps = liveAgentSteps.filter(
    (s) => s.complaintId === id || !s.complaintId
  );

  const getStepData = (stepNum: number): AgentStepUpdate | undefined => {
    return complaintSteps.find((s) => s.stepNumber === stepNum);
  };

  const completedCount = complaintSteps.filter(s => s.status === 'COMPLETED' || s.status === 'success').length;
  const totalAgents = ADK_AGENTS_METADATA.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalAgents) * 100));
  const isAllComplete = completedCount >= totalAgents || complaintSteps.some((s) => s.stepNumber === totalAgents && s.status === 'COMPLETED');
  const hasFailedStage = complaintSteps.some(s => s.status === 'FAILED' || s.status === 'failed');

  useEffect(() => {
    if (isAllComplete && !redirecting) {
      setRedirecting(true);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`/complaints/${id}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAllComplete, redirecting, id, navigate]);

  const handleResumeStage = async () => {
    setResuming(true);
    try {
      await api.post(`/complaints/${id}/resume-workflow`);
    } catch (err) {
      console.error('[Resume Workflow Error]:', err);
    } finally {
      setResuming(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 text-center relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Google ADK v2.5.0 Multi-Agent Workflow</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white font-outfit">
          Autonomous ADK Multi-Agent Execution Engine
        </h1>

        <p className="text-xs text-slate-400 font-mono mt-1">
          {complaint ? `Processing Ticket #${complaint.ticketId}` : `Processing Ticket #${id}`}
        </p>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-2 max-w-xl mx-auto">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">ADK Session Workflow Progress</span>
            <span className="text-cyan-400 font-bold">{progressPercent}% ({completedCount}/{totalAgents} ADK Agents)</span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full shadow-lg shadow-cyan-500/40"
            />
          </div>
        </div>

        {/* Redirection Countdown Banner */}
        {isAllComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
              <span>Google ADK Workflow Completed! Redirecting to Ticket Details...</span>
            </div>
            <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg font-mono text-sm">
              {countdown}s
            </span>
          </motion.div>
        )}

        {/* Failed Stage Resume Banner */}
        {hasFailedStage && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <span>ADK Stage Execution Failed. Resume capability active.</span>
            </div>
            <button
              onClick={handleResumeStage}
              disabled={resuming}
              className="px-4 py-1.5 rounded-lg bg-rose-500 text-slate-950 hover:bg-rose-400 font-bold text-xs flex items-center space-x-1.5 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resuming ? 'animate-spin' : ''}`} />
              <span>{resuming ? 'Resuming...' : 'Resume Stage'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sequential Agents List */}
      <div className="space-y-4">
        {ADK_AGENTS_METADATA.map((agent, index) => {
          const stepData = getStepData(agent.id);
          const status = stepData ? (stepData.status || 'COMPLETED') : (completedCount + 1 === agent.id ? 'RUNNING' : 'WAITING');
          const isCompleted = status === 'COMPLETED' || status === 'success';
          const isRunning = status === 'RUNNING' || status === 'running';
          const isFailed = status === 'FAILED' || status === 'failed';
          const Icon = agent.icon;
          const isExpanded = expandedJson === agent.id;

          return (
            <React.Fragment key={agent.id}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-500/5'
                    : isRunning
                      ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-500/20 shadow-xl'
                      : isFailed
                        ? 'border-rose-500/40 bg-rose-950/20'
                        : 'border-slate-800/80 bg-slate-950/40 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Metadata */}
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all flex-shrink-0 ${
                        isCompleted
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : isRunning
                            ? 'bg-cyan-500 text-slate-950 animate-pulse shadow-lg shadow-cyan-500/40'
                            : isFailed
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {isCompleted ? <Check className="w-6 h-6 text-cyan-400" /> : <Icon className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          ADK AGENT 0{agent.id}
                        </span>
                        <h3 className="text-base font-bold text-white font-outfit">
                          {agent.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 font-sans">{agent.description}</p>
                    </div>
                  </div>

                  {/* Right Badges & Indicators */}
                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    {isCompleted ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>COMPLETED</span>
                      </span>
                    ) : isRunning ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>RUNNING</span>
                      </span>
                    ) : isFailed ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>FAILED</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800">
                        WAITING
                      </span>
                    )}

                    {stepData && (
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                          Conf: {((stepData.confidence || 0.95) * 100).toFixed(0)}%
                        </span>
                        <span className="px-2.5 py-1 rounded text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
                          {stepData.executionTimeMs || 320}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Structured Output & Reasoning */}
                {stepData && stepData.agentOutput && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs space-y-2">
                    {stepData.agentOutput.reasoning && (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/60 text-slate-300">
                        <span className="font-mono text-cyan-400 font-semibold">Reasoning: </span>
                        <span>{stepData.agentOutput.reasoning}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      {stepData.agentOutput.category && (
                        <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 rounded border border-cyan-500/20">
                          Category: {stepData.agentOutput.category}
                        </span>
                      )}
                      {stepData.agentOutput.detectedObjects && (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20">
                          Objects: {stepData.agentOutput.detectedObjects.join(', ')}
                        </span>
                      )}
                      {stepData.agentOutput.ward && (
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">
                          Ward: {stepData.agentOutput.ward} ({stepData.agentOutput.municipality || 'CMC'})
                        </span>
                      )}
                      {stepData.agentOutput.priorityLevel && (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                          Priority: {stepData.agentOutput.priorityLevel} ({stepData.agentOutput.priorityScore}/100)
                        </span>
                      )}
                      {stepData.agentOutput.department && (
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                          Dept: {stepData.agentOutput.department}
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedJson(isExpanded ? null : agent.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide ADK Agent Output' : 'Inspect ADK Agent Output'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                          >
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto text-slate-300">
                              <pre>{JSON.stringify(stepData.agentOutput, null, 2)}</pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.div>

              {index < ADK_AGENTS_METADATA.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                    isCompleted ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-700'
                  }`}>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Execution Log History Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400">
          <Terminal className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white font-outfit">ADK Workflow Real-Time Execution Log</h3>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2 max-h-60 overflow-y-auto">
          {complaintSteps.length === 0 ? (
            <p className="text-slate-600 italic">Waiting for ADK Workflow Agent to start execution...</p>
          ) : (
            complaintSteps.map((step, i) => (
              <div key={i} className="flex items-start space-x-3 text-[11px] border-b border-slate-900 pb-1.5">
                <span className="text-slate-500">{step.timestamp || '09:21:02'}</span>
                <span className="font-bold text-cyan-400">[{step.agentName}]</span>
                <span className={step.status === 'COMPLETED' ? 'text-emerald-400' : step.status === 'FAILED' ? 'text-rose-400' : 'text-amber-400'}>
                  {step.status}
                </span>
                <span className="text-slate-400 flex-1 truncate">{step.agentOutput?.reasoning || step.agentOutput?.summary || 'Execution completed.'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProcessingPage;
