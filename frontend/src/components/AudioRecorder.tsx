import React, { useState } from 'react';
import { Mic, Square, Volume2, Check } from 'lucide-react';

interface AudioRecorderProps {
  onRecorded: (file: File) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [recorded, setRecorded] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    setRecorded(false);
    setTimer(0);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev >= 10) {
          clearInterval(interval);
          stopRecording();
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecorded(true);
    // Create a mock synthetic audio File object
    const blob = new Blob(['mock audio sample data'], { type: 'audio/mp3' });
    const file = new File([blob], `citizen_voice_note_${Date.now()}.mp3`, { type: 'audio/mp3' });
    onRecorded(file);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-cyan-400'
        }`}>
          <Mic className="w-5 h-5" />
        </div>
        <div>
          <h5 className="text-sm font-semibold text-white">Voice Note Complaint</h5>
          <p className="text-xs text-slate-400">
            {isRecording ? `Recording... 00:${timer < 10 ? '0' : ''}${timer}` : recorded ? 'Voice note attached!' : 'Click record to state issue verbally'}
          </p>
        </div>
      </div>

      <div>
        {!isRecording && !recorded && (
          <button
            type="button"
            onClick={startRecording}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
          >
            Record Voice
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500 text-white flex items-center space-x-1.5 animate-pulse"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop ({timer}s)</span>
          </button>
        )}

        {recorded && (
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
            <Check className="w-4 h-4" />
            <span>Attached (.mp3)</span>
          </div>
        )}
      </div>
    </div>
  );
};
