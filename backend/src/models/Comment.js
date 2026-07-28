import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    attachments: [
      {
        url: String,
        name: String
      }
    ],
    isOfficialNote: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
