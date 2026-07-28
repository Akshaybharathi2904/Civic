import mongoose from 'mongoose';

const agentLogSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true
    },
    agentName: {
      type: String,
      required: true
    },
    stepNumber: {
      type: Number,
      required: true
    },
    inputData: {
      type: mongoose.Schema.Types.Mixed
    },
    outputData: {
      type: mongoose.Schema.Types.Mixed
    },
    confidenceScore: {
      type: Number,
      default: 0.9
    },
    executionTimeMs: {
      type: Number,
      default: 120
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'warning', 'failed'],
      default: 'success'
    },
    reasoning: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const AgentLog = mongoose.model('AgentLog', agentLogSchema);
