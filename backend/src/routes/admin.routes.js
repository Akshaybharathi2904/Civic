import express from 'express';
import { getUsers, updateUserRole, triggerEscalationSweep, getAgentLogs } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, authorize('admin', 'department_head'));

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.post('/escalate-sweep', triggerEscalationSweep);
router.get('/agent-logs', getAgentLogs);

export default router;
