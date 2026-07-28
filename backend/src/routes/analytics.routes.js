import express from 'express';
import { getSystemAnalytics, getHeatmapData } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/public-stats', getSystemAnalytics);
router.get('/overview', protect, getSystemAnalytics);
router.get('/heatmap', protect, getHeatmapData);

export default router;
