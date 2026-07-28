import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    description: {
      type: String,
      default: ''
    },
    categories: [
      {
        type: String
      }
    ],
    contactEmail: {
      type: String,
      required: true
    },
    contactPhone: {
      type: String,
      default: '+91-800-CIVIC-001'
    },
    SLAHours: {
      type: Number,
      default: 48
    },
    activeTicketCount: {
      type: Number,
      default: 0
    },
    headOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    icon: {
      type: String,
      default: 'Building2'
    }
  },
  { timestamps: true }
);

export const Department = mongoose.model('Department', departmentSchema);
