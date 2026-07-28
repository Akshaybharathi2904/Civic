import express from 'express';
import { getDepartments, getDepartmentById, createDepartment } from '../controllers/department.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('admin'), createDepartment);

router.get('/:id', protect, getDepartmentById);

export default router;
