import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import issuesService, { DuplicateMatchItem } from '../services/issues.service';
import { MediaUploader } from '../components/MediaUploader';
import { ContactInfoFields } from '../components/ContactInfoFields';
import { DuplicateCheckModal } from '../components/DuplicateCheckModal';
import { ComplaintMap } from '../../maps/components/ComplaintMap';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import issueValidation from '../utils/issueValidation';
import { IssueContactInfo } from '../../../shared/types/issue.domain';
import { MapPin, Sparkles, Send, AlertCircle, EyeOff, Eye, Cpu, GitMerge } from 'lucide-react';
import { useToast } from '../../../shared/hooks/useToast';

export const SubmitIssuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, info } = useToast();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Pothole / Road Hazard');
  const [address, setAddress] = useState('DB Road, RS Puram, Coimbatore, Tamil Nadu');
  const [location, setLocation] = useState<{ lat: number; lng: number }>({ lat: 11.0084, lng: 76.9508 });

  // Media state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);

  // Anonymous & Contact State
  const [anonymous, setAnonymous] = useState(false);
  const [contactInfo, setContactInfo] = useState<IssueContactInfo>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  // Duplicate Check Modal State
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatchItem[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [bypassDuplicateCheck, setBypassDuplicateCheck] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (user && !anonymous) {
      setContactInfo((prev) => ({
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user, anonymous]);

  const handleLocationSelect = (lat: number, lng: number, autoAddress?: string) => {
    setLocation({ lat, lng });
    if (autoAddress) {
      setAddress(autoAddress);
    }
    if (validationErrors.address || validationErrors.latitude || validationErrors.longitude) {
      setValidationErrors((prev) => ({ ...prev, address: '', latitude: '', longitude: '' }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const mediaFiles = [...imageFiles, ...videoFiles];

    const validation = issueValidation.validateCreateIssue({
      title,
      description,
      category,
      address,
      latitude: location.lat,
      longitude: location.lng,
      anonymous,
      contactInformation: anonymous ? undefined : contactInfo,
      mediaFiles,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});

    // Step 1: Perform Duplicate Search if not already bypassed
    if (!bypassDuplicateCheck) {
      setIsSubmitting(true);
      const matches = await issuesService.findNearbyPossibleDuplicates({
        latitude: location.lat,
        longitude: location.lng,
        title,
        category,
      });

      setIsSubmitting(false);

      if (matches.length > 0) {
        setDuplicateMatches(matches);
        setShowDuplicateModal(true);
        return;
      }
    }

    // Step 2: Proceed with creating new issue
    await executeCreateIssue(mediaFiles);
  };

  const executeCreateIssue = async (mediaFiles: File[]) => {
    setIsSubmitting(true);
    try {
      const newIssue = await issuesService.createIssue({
        title,
        description,
        category,
        address,
        latitude: location.lat,
        longitude: location.lng,
        anonymous,
        contactInformation: anonymous ? undefined : contactInfo,
        mediaFiles,
      });

      const targetId = newIssue.id || newIssue._id || newIssue.issueNumber || newIssue.ticketId;
      success('Civic Issue Report created successfully!', 'Ticket Created');
      navigate(`/complaints/${targetId}`);
    } catch (err: any) {
      setServerError(err.message || err.response?.data?.message || 'Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportDuplicateMatch = async (match: DuplicateMatchItem) => {
    setShowDuplicateModal(false);
    setIsSubmitting(true);
    try {
      const targetId = match.issue.id || match.issue._id || match.issue.issueNumber || match.issue.ticketId;
      await issuesService.supportExistingIssue(targetId);
      success(`Upvoted existing Ticket #${match.issue.issueNumber || match.issue.ticketId}! Added to your support record.`, 'Support Registered');
      navigate(`/complaints/${targetId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBypassAndCreateNew = async () => {
    setShowDuplicateModal(false);
    setBypassDuplicateCheck(true);
    info('Bypassing duplicate check. Submitting new issue ticket...', 'Creating Ticket');
    const mediaFiles = [...imageFiles, ...videoFiles];
    await executeCreateIssue(mediaFiles);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Municipal GIS Incident & Duplicate Triage Platform</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-outfit">Report a Civic Issue</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-1">
          Search nearby duplicates automatically before creating new tickets to support existing community issues!
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* AI & Duplicate Support Container Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/60 border border-purple-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-outfit uppercase">Duplicate Issue Triage Active</h4>
            <p className="text-[11px] text-slate-400">
              When you submit, we query 500m spatial proximity to suggest existing tickets you can support directly.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase shrink-0">
          Duplicate Detection Ready
        </span>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form Controls */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
          <Input
            label="Issue Title"
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationErrors.title) setValidationErrors((prev) => ({ ...prev, title: '' }));
            }}
            placeholder="e.g. Hazardous Deep Pothole on DB Road near Signal"
            error={validationErrors.title}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Pothole / Road Hazard">Pothole / Road Hazard</option>
              <option value="Garbage Overflow / Waste">Garbage Overflow / Waste</option>
              <option value="Water Supply / Leakage">Water Supply / Leakage</option>
              <option value="Streetlight Outage">Streetlight Outage</option>
              <option value="Drainage Blockage">Drainage Blockage</option>
              <option value="Traffic Light Malfunction">Traffic Light Malfunction</option>
              <option value="Unauthorized Construction">Unauthorized Construction</option>
              <option value="Tree Fall / Fallen Debris">Tree Fall / Fallen Debris</option>
              <option value="Public Nuisance">Public Nuisance</option>
              <option value="Other Civic Issue">Other Civic Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationErrors.description) setValidationErrors((prev) => ({ ...prev, description: '' }));
              }}
              placeholder="Describe the condition, size of hazard, nearby landmarks, and impact..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder:text-slate-500"
            />
            {validationErrors.description && (
              <span className="text-xs text-rose-400 font-medium mt-1 block">{validationErrors.description}</span>
            )}
          </div>

          {/* Media Uploaders */}
          <MediaUploader
            imageFiles={imageFiles}
            videoFiles={videoFiles}
            onImagesChange={setImageFiles}
            onVideosChange={setVideoFiles}
          />

          {/* Anonymous Toggle Switch */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  {anonymous ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 font-outfit">Report Anonymously</h4>
                  <p className="text-xs text-slate-400">
                    {anonymous
                      ? 'Anonymous mode active: Your name and contact info will be hidden.'
                      : 'Identified mode: Your contact info will be provided to municipal officers.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAnonymous(!anonymous)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  anonymous ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    anonymous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Conditional Contact Information */}
          {!anonymous && (
            <ContactInfoFields
              contactInfo={contactInfo}
              onChange={setContactInfo}
              errors={validationErrors}
            />
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Send className="w-5 h-5" />}
            className="w-full py-4 text-base font-bold shadow-lg shadow-cyan-500/25"
          >
            {isSubmitting ? 'Checking Duplicates & Submitting...' : 'Submit Civic Issue Report'}
          </Button>
        </div>

        {/* Right Column: Interactive OpenStreetMap & Reverse Geocoding */}
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
          <div>
            <Input
              label="Location Address (Auto-filled on map click)"
              type="text"
              required
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                if (validationErrors.address) setValidationErrors((prev) => ({ ...prev, address: '' }));
              }}
              placeholder="Address or landmark..."
              error={validationErrors.address}
            />
            <p className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Click map, search landmark, or use GPS to auto-fill reverse geocoded address</span>
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between text-slate-300">
            <span>Stored GIS Coordinates:</span>
            <span className="text-cyan-400 font-bold">
              [{location.lat.toFixed(5)}, {location.lng.toFixed(5)}]
            </span>
          </div>

          {/* Leaflet Interactive Map Picker */}
          <ComplaintMap
            center={[location.lat, location.lng]}
            zoom={14}
            interactivePicker={true}
            onLocationSelect={handleLocationSelect}
            height="460px"
          />
        </div>
      </form>

      {/* Pre-Submission Duplicate Check Modal */}
      <DuplicateCheckModal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        matches={duplicateMatches}
        onSupportMatch={handleSupportDuplicateMatch}
        onContinueCreatingNew={handleBypassAndCreateNew}
      />
    </div>
  );
};

export default SubmitIssuePage;
