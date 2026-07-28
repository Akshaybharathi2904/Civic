import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../../contexts/SocketContext';
import api from '../../../shared/api/apiClient';
import { AgentStepUpdate, Complaint } from '../../../shared/types';
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
  Sparkles,
  ChevronDown,
  ChevronUp,
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
  { id: 10, name: 'Government Analytics', icon: BarChart2, description: 'System leaderboard update & ward statistics aggregation' },
];

export const AIProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { joinComplaintRoom, liveAgentSteps } = useSocket();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [expandedJson, setExpandedJson] = useState<number | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if (id) {
      joinComplaintRoom(id);
      api.get<{ complaint: Complaint } | Complaint>(`/complaints/${id}`)
        .then((res) => setComplaint((res as any).complaint || res))
        .catch((err) => console.error(err));
    }
  }, [id, joinComplaintRoom]);

  const complaintSteps = liveAgentSteps.filter(
    (s) => s.complaintId === id || !s.complaintId
  );

  const completedCount = complaintSteps.length;
  const progressPercent = Math.min(100, Math.round((completedCount / 10) * 100));
  const isAllComplete = completedCount >= 10 || complaintSteps.some((s) => s.stepNumber === 10);

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
      <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-cyan-500/30 text-center relative overflow-hidden">
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

        <div className="mt-6 space-y-2 max-w-xl mx-auto">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Swarm Execution Progress</span>
            <span className="text-cyan-400 font-bold">{progressPercent}% ({completedCount}/10 Agents)</span>
          </div>

          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full shadow-lg shadow-cyan-500/40"
            />
          </div>
        </div>

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

      <div className="space-y-4">
        {AGENT_METADATA.map((agent) => {
          const stepData = getStepData(agent.id);
          const isDone = !!stepData && stepData.status === 'success';
          const isRunning = !!stepData && stepData.status === 'running';
          const Icon = agent.icon;
          const isExpanded = expandedJson === agent.id;

          return (
            <div
              key={agent.id}
              className={`p-4 rounded-2xl border transition-all duration-300 ${
                isDone
                  ? 'bg-slate-900/90 border-emerald-500/30'
                  : isRunning
                  ? 'bg-slate-900 border-cyan-500 animate-pulse shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isDone
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isRunning
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-500">Agent #{agent.id}</span>
                      <h4 className="font-extrabold text-sm text-white font-outfit">{agent.name}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{agent.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {isDone && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{stepData?.executionTimeMs || 120}ms</span>
                    </span>
                  )}
                  {isRunning && (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-semibold flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </span>
                  )}
                  {stepData?.agentOutput && (
                    <button
                      onClick={() => setExpandedJson(isExpanded ? null : agent.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}
                </div>
              </div>

              {isExpanded && stepData?.agentOutput && (
                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                  <pre>{JSON.stringify(stepData.agentOutput, null, 2)}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIProcessingPage;
