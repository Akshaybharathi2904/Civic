import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  overridePriority,
  reassignDepartment,
  addComment,
  rateComplaint
} from '../controllers/complaint.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, upload.array('mediaFiles', 5), createComplaint)
  .get(protect, getComplaints);

router.route('/:id')
  .get(protect, getComplaintById);

router.patch('/:id/status', protect, authorize('officer', 'department_head', 'admin'), updateComplaintStatus);
router.patch('/:id/priority', protect, authorize('department_head', 'admin'), overridePriority);
router.patch('/:id/reassign', protect, authorize('department_head', 'admin'), reassignDepartment);
router.post('/:id/comments', protect, addComment);
router.post('/:id/rate', protect, rateComplaint);

export default router;
