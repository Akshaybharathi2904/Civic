import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { ComplaintMap } from '../components/ComplaintMap';
import { AudioRecorder } from '../components/AudioRecorder';
import {
  Upload,
  MapPin,
  Sparkles,
  Send,
  AlertCircle
} from 'lucide-react';

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const { clearAgentSteps } = useSocket();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole');
  const [address, setAddress] = useState('DB Road, RS Puram, Coimbatore, Tamil Nadu');
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 11.0084, lng: 76.9508 });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const handleAudioRecorded = (file: File) => {
    setMediaFiles((prev) => [...prev, file]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    clearAgentSteps();

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('address', address);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());

      mediaFiles.forEach((file) => {
        formData.append('mediaFiles', file);
      });

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newComplaint = res.data.complaint;
      const targetId = newComplaint._id || newComplaint.id || newComplaint.ticketId;

      // Navigate immediately to dedicated AI Processing Page
      navigate(`/ai-processing/${targetId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Modal AI Input Triage &bull; Tamil Nadu</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Report a Civic Issue</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-1">
          Upload text, photos, or voice notes. Our 10 AI Agents will detect hazards, merge duplicate tickets, assign departments, and compute priority automatically.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Inputs */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep Pothole on Avinashi Road near Hope College Junction"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Pothole">Pothole</option>
              <option value="Road Damage">Road Damage</option>
              <option value="Garbage Overflow">Garbage Overflow</option>
              <option value="Broken Streetlight">Broken Streetlight</option>
              <option value="Water Leakage">Water Leakage</option>
              <option value="Sewage Overflow">Sewage Overflow</option>
              <option value="Illegal Dumping">Illegal Dumping</option>
              <option value="Flooding">Flooding / Monsoon Waterlogging</option>
              <option value="Fallen Tree">Fallen Tree / Branch</option>
              <option value="Damaged Footpath">Damaged Footpath</option>
              <option value="Traffic Signal Failure">Traffic Signal Failure</option>
              <option value="Open Manhole">Open Manhole</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, location landmarks, and hazard risk..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Photos / Evidence</label>
            <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/50">
              <Upload className="w-6 h-6 text-cyan-400 mb-2" />
              <span className="text-xs text-slate-300 font-medium">Click to select photos or drag & drop</span>
              <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, MP4 up to 25MB</span>
              <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
            </label>
            {mediaFiles.length > 0 && (
              <div className="mt-2 text-xs text-cyan-400 font-mono">
                {mediaFiles.length} file(s) attached: {mediaFiles.map((f) => f.name).join(', ')}
              </div>
            )}
          </div>

          {/* Voice Recorder Integration */}
          <AudioRecorder onRecorded={handleAudioRecorded} />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.01] transition-all flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>{isSubmitting ? 'Dispatching to AI Swarm...' : 'Submit Complaint & Launch AI Swarm'}</span>
          </button>
        </div>

        {/* Right GIS Map Picker */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pin Location on GIS Map (Coimbatore)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address or landmark..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 mb-3"
            />
            <p className="text-[11px] text-slate-400 mb-2 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Click anywhere on the map to set exact GPS coordinates</span>
            </p>
          </div>

          <ComplaintMap
            center={[location.lat, location.lng]}
            zoom={14}
            interactivePicker={true}
            onLocationSelect={(lat, lng) => setLocation({ lat, lng })}
            height="380px"
          />
        </div>

      </form>

    </div>
  );
};
