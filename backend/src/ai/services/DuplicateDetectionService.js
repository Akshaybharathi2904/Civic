import { prisma } from '../../config/prisma.js';
import { calculateDistanceMeters } from '../../utils/geoUtils.js';

export class DuplicateDetectionService {
  async process(gpsLocation, complaint) {
    const lat = gpsLocation?.latitude || 11.0168;
    const lng = gpsLocation?.longitude || 76.9558;
    const currentId = complaint?.id || '';

    const duplicates = [];
    let similarityScore = 0.0;

    try {
      if (prisma) {
        const nearbyCandidates = await prisma.complaint.findMany({
          where: {
            id: { not: currentId },
            status: { not: 'Resolved' },
            latitude: { gte: lat - 0.006, lte: lat + 0.006 },
            longitude: { gte: lng - 0.006, lte: lng + 0.006 }
          },
          take: 10
        });

        const targetTitle = (complaint?.title || '').toLowerCase();
        for (const item of nearbyCandidates) {
          const dist = calculateDistanceMeters([lng, lat], [item.longitude, item.latitude]);
          const itemTitle = (item.title || '').toLowerCase();
          
          if (dist <= 450) {
            const isCategoryMatch = targetTitle.includes(item.category?.toLowerCase() || '') || itemTitle.includes(targetTitle.slice(0, 10));
            const sim = isCategoryMatch ? Math.min(0.98, 1 - (dist / 1000)) : 0.65;
            
            duplicates.push({
              ticketId: item.ticketId,
              distanceMeters: Math.round(dist),
              title: item.title,
              similarity: Number(sim.toFixed(2))
            });

            if (sim > similarityScore) {
              similarityScore = Number(sim.toFixed(2));
            }
          }
        }
      }
    } catch (err) {
      console.warn('[DuplicateDetectionService Warning]:', err.message);
    }

    return {
      duplicates,
      similarityScore
    };
  }
}

export default DuplicateDetectionService;
