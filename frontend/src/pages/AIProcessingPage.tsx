import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../contexts/SocketContext';
import api from '../services/api';
import { AgentStepUpdate, Complaint } from '../types';
import {
  Cpu,
  Brain,
  Eye,
  MapPin,
  GitMerge,
  Send,
  Sliders,
  GitPullRequest,
  AlertTriangle,
  Radio,
  BarChart2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

const AGENT_METADATA = [
  { id: 1, name: 'Complaint Understanding', icon: Brain, description: 'Extracting issue type, keywords, translation & severity synthesis' },
  { id: 2, name: 'Vision Analysis', icon: Eye, description: 'Computer Vision hazard identification & damage boundary verification' },
  { id: 3, name: 'Location Intelligence', icon: MapPin, description: 'GPS reverse geocoding, ward allocation & spatial mapping' },
  { id: 4, name: 'Duplicate Detection', icon: GitMerge, description: 'Spatial proximity query & multi-citizen ticket merging' },
  { id: 5, name: 'Department Routing', icon: Send, description: 'Autonomous department assignment & jurisdiction verification' },
  { id: 6, name: 'Priority Scoring', icon: Sliders, description: '0-100 score matrix calculation based on public safety exposure' },
  { id: 7, name: 'Workflow Agent', icon: GitPullRequest, description: 'SLA target assignment & lifecycle timeline initialization' },
  { id: 8, name: 'Escalation Agent', icon: AlertTriangle, description: 'Emergency sweep & alert notification verification' },
  { id: 9, name: 'Citizen Notification', icon: Radio, description: 'Real-time WebSocket event dispatching to citizen room' },
  { id: 10, name: 'Government Analytics', icon: BarChart2, description: 'System leaderboard update & ward statistics aggregation' }
];

export const AIProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { joinComplaintRoom, liveAgentSteps, socket } = useSocket();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [expandedJson, setExpandedJson] = useState<number | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(2);

  // Fetch initial complaint details
  useEffect(() => {
    if (id) {
      joinComplaintRoom(id);
      api.get(`/complaints/${id}`)
        .then((res) => setComplaint(res.data.complaint))
        .catch((err) => console.error(err));
    }
  }, [id]);

  // Filter steps relevant to this complaint
  const complaintSteps = liveAgentSteps.filter(
    (s) => s.complaintId === id || !s.complaintId
  );

  const completedCount = complaintSteps.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 10) * 100));
  const isAllComplete = completedCount >= 10 || complaintSteps.some((s) => s.stepNumber === 10);

  // Automatic Redirection after completion
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

  const getStepData = (stepNum: number): AgentStepUpdate | undefined => {
    return complaintSteps.find((s) => s.stepNumber === stepNum);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 text-center relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Real-Time AI Swarm Mesh</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white font-outfit">
          AI Multi-Agent Resolution Processing
        </h1>

        <p className="text-xs text-slate-400 font-mono mt-1">
          {complaint ? `Processing Ticket #${complaint.ticketId}` : `Processing Ticket #${id}`}
        </p>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-2 max-w-xl mx-auto">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Swarm Execution Progress</span>
            <span className="text-cyan-400 font-bold">{progressPercent}% ({completedCount}/10 Agents)</span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
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
              <span>Ticket Generated Successfully! Redirecting to Ticket Details...</span>
            </div>
            <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded-lg font-mono text-sm">
              {countdown}s
            </span>
          </motion.div>
        )}
      </div>

      {/* Sequential Agents List */}
      <div className="space-y-4">
        {AGENT_METADATA.map((agent, index) => {
          const stepData = getStepData(agent.id);
          const isExecuted = !!stepData;
          const isCurrentStep = !isAllComplete && (completedCount + 1 === agent.id);
          const Icon = agent.icon;
          const isExpanded = expandedJson === agent.id;

          return (
            <React.Fragment key={agent.id}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isExecuted
                    ? 'border-cyan-500/40 bg-slate-900/80 shadow-lg shadow-cyan-500/5'
                    : isCurrentStep
                    ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-500/20 shadow-xl'
                    : 'border-slate-800/80 bg-slate-950/40 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left Metadata */}
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-all flex-shrink-0 ${
                        isExecuted
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : isCurrentStep
                          ? 'bg-cyan-500 text-slate-950 animate-pulse shadow-lg shadow-cyan-500/40'
                          : 'bg-slate-900 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {isExecuted ? <Check className="w-6 h-6 text-cyan-400" /> : <Icon className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          STEP 0{agent.id}
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
                    
                    {/* Status Badge */}
                    {isExecuted ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : isCurrentStep ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Running...</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-mono text-slate-600 bg-slate-900 border border-slate-800">
                        Pending
                      </span>
                    )}

                    {/* Metrics */}
                    {isExecuted && (
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                          Confidence: {(stepData.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="px-2.5 py-1 rounded text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
                          {stepData.executionTimeMs}ms
                        </span>
                      </div>
                    )}

                  </div>
                </div>

                {/* Agent Reasoning & Key Outputs */}
                {isExecuted && stepData.agentOutput && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs space-y-2">
                    {/* Reasoning Highlight */}
                    {(stepData.agentOutput.reasoning || stepData.agentOutput.explanation || stepData.agentOutput.routingReason || stepData.agentOutput.matchReason) && (
                      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/60 text-slate-300">
                        <span className="font-mono text-cyan-400 font-semibold">Reasoning: </span>
                        <span>
                          {stepData.agentOutput.reasoning ||
                            stepData.agentOutput.explanation ||
                            stepData.agentOutput.routingReason ||
                            stepData.agentOutput.matchReason}
                        </span>
                      </div>
                    )}

                    {/* Key Extract Highlights */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                      {stepData.agentOutput.issueType && (
                        <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-300 rounded border border-cyan-500/20">
                          Issue Type: {stepData.agentOutput.issueType}
                        </span>
                      )}
                      {stepData.agentOutput.assignedDeptCode && (
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                          Dept: {stepData.agentOutput.assignedDeptCode}
                        </span>
                      )}
                      {stepData.agentOutput.priorityLevel && (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
                          Priority: {stepData.agentOutput.priorityLevel} ({stepData.agentOutput.priorityScore}/100)
                        </span>
                      )}
                      {stepData.agentOutput.ward && (
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20">
                          Ward: {stepData.agentOutput.ward}
                        </span>
                      )}
                    </div>

                    {/* Structured JSON Inspector Toggle */}
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedJson(isExpanded ? null : agent.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Structured JSON Output' : 'Inspect Structured JSON Output'}</span>
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

              {/* Sequential Connector Arrow */}
              {index < AGENT_METADATA.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                    isExecuted ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-700'
                  }`}>
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Ticket Generated Banner Footer */}
      {isAllComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-6 rounded-2xl border border-emerald-500/40 text-center space-y-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white font-outfit">Ticket Generated & Dispatched</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All 10 AI Agents completed execution. Your complaint has been assigned and triaged. Redirecting to full ticket timeline...
          </p>
          <button
            onClick={() => navigate(`/complaints/${id}`)}
            className="px-6 py-2.5 rounded-xl font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 text-xs transition-all"
          >
            Go to Ticket Details Now &rarr;
          </button>
        </motion.div>
      )}

    </div>
  );
};
