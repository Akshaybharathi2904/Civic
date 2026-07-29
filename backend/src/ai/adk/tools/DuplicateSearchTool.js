import { prisma } from '../../../config/prisma.js';
import { calculateDistanceMeters } from '../../../utils/geoUtils.js';

export class DuplicateSearchTool {
  static async execute({ latitude, longitude, complaintId, title, category }) {
    const lat = latitude || 11.0168;
    const lng = longitude || 76.9558;
    const duplicates = [];
    let duplicateScore = 0.0;

    try {
      if (prisma) {
        const nearby = await prisma.complaint.findMany({
          where: {
            id: { not: complaintId || '' },
            status: { not: 'Resolved' },
            latitude: { gte: lat - 0.006, lte: lat + 0.006 },
            longitude: { gte: lng - 0.006, lte: lng + 0.006 },
          },
          take: 10,
        });

        const targetTitle = (title || '').toLowerCase();
        for (const item of nearby) {
          const dist = calculateDistanceMeters([lng, lat], [item.longitude, item.latitude]);
          const itemTitle = (item.title || '').toLowerCase();

          if (dist <= 500) {
            const isMatch = targetTitle.includes(item.category?.toLowerCase() || '') || itemTitle.includes(targetTitle.slice(0, 10));
            const sim = isMatch ? Math.min(0.98, 1 - dist / 1000) : 0.60;

            duplicates.push({
              ticketId: item.ticketId,
              distanceMeters: Math.round(dist),
              title: item.title,
              similarityScore: Number(sim.toFixed(2)),
            });

            if (sim > duplicateScore) {
              duplicateScore = Number(sim.toFixed(2));
            }
          }
        }
      }
    } catch (e) {
      console.warn('[DuplicateSearchTool Warning]:', e.message);
    }

    return {
      duplicates,
      duplicateScore,
      isDuplicateFound: duplicates.length > 0,
      confidence: 0.94,
    };
  }
}

export default DuplicateSearchTool;
