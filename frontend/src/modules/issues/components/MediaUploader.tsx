import React from 'react';
import { Upload, Image as ImageIcon, Video as VideoIcon, X, Film } from 'lucide-react';

export interface MediaUploaderProps {
  imageFiles: File[];
  videoFiles: File[];
  onImagesChange: (files: File[]) => void;
  onVideosChange: (files: File[]) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  imageFiles,
  videoFiles,
  onImagesChange,
  onVideosChange,
}) => {
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
      onImagesChange([...imageFiles, ...selected]);
    }
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) => f.type.startsWith('video/'));
      onVideosChange([...videoFiles, ...selected]);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(imageFiles.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    onVideosChange(videoFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Upload Images Section */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>Upload Images</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">JPG, PNG, WEBP (Max 10MB)</span>
        </label>

        <label className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 group">
          <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 mb-1.5 transition-colors" />
          <span className="text-xs text-slate-300 font-medium">Click or drag photos to upload</span>
          <input
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageFileSelect}
            className="hidden"
          />
        </label>

        {imageFiles.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
            {imageFiles.map((file, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group h-20">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-slate-950/80 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Video Section */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <VideoIcon className="w-4 h-4 text-purple-400" />
            <span>Upload Video</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">MP4, WEBM (Max 50MB)</span>
        </label>

        <label className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 group">
          <Film className="w-6 h-6 text-slate-500 group-hover:text-purple-400 mb-1.5 transition-colors" />
          <span className="text-xs text-slate-300 font-medium">Click or drag video footage to upload</span>
          <input
            type="file"
            accept="video/mp4, video/webm"
            onChange={handleVideoFileSelect}
            className="hidden"
          />
        </label>

        {videoFiles.length > 0 && (
          <div className="space-y-2 mt-3">
            {videoFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-purple-500/30 text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <Film className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-slate-200 font-mono truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-500">({(file.size / (1024 * 1024)).toFixed(1)} MB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
