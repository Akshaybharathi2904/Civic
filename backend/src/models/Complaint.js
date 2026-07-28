import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      default: 'General Civic Issue'
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    priorityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100
    },
    priorityLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: [
        'Reported',
        'Acknowledged',
        'Assigned',
        'Inspection',
        'In Progress',
        'Resolved',
        'Verified'
      ],
      default: 'Reported'
    },
    // GeoJSON Point location for 2dsphere indexing
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [77.5946, 12.9716] // Default Bengaluru
      }
    },
    address: {
      type: String,
      default: 'Unknown location'
    },
    ward: {
      type: String,
      default: 'Ward 12'
    },
    zone: {
      type: String,
      default: 'East Zone'
    },
    city: {
      type: String,
      default: 'Bengaluru'
    },
    district: {
      type: String,
      default: 'Bengaluru Urban'
    },
    state: {
      type: String,
      default: 'Karnataka'
    },
    mediaFiles: [
      {
        url: String,
        type: { type: String, enum: ['image', 'voice', 'video', 'document'] },
        name: String
      }
    ],
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    affectedCount: {
      type: Number,
      default: 1
    },
    isDuplicate: {
      type: Boolean,
      default: false
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null
    },
    duplicateDistanceMeters: {
      type: Number,
      default: 0
    },
    slaDueDate: {
      type: Date
    },
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalationReason: {
      type: String,
      default: ''
    },
    tags: [String],
    ratings: {
      rating: { type: Number, min: 1, max: 5, default: 0 },
      feedback: { type: String, default: '' },
      createdAt: { type: Date }
    },
    agentResults: {
      understanding: mongoose.Schema.Types.Mixed,
      imageAnalysis: mongoose.Schema.Types.Mixed,
      location: mongoose.Schema.Types.Mixed,
      duplicateDetection: mongoose.Schema.Types.Mixed,
      routing: mongoose.Schema.Types.Mixed,
      priority: mongoose.Schema.Types.Mixed,
      workflow: mongoose.Schema.Types.Mixed,
      escalation: mongoose.Schema.Types.Mixed,
      notification: mongoose.Schema.Types.Mixed,
      analytics: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// 2dsphere index for spatial queries
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priorityLevel: 1 });
complaintSchema.index({ assignedDepartment: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
