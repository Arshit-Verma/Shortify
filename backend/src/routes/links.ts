import { Router, Request, Response } from 'express';
import { getLinksByOwner } from '../services/shortener.js';
import { requireOwnerToken } from '../middleware/ownerToken.js';
import env from '../utils/config.js';

const router = Router();

/**
 * GET /api/links
 * List all short links for the current owner
 */
router.get('/links', requireOwnerToken, async (req: Request, res: Response) => {
  try {
    const ownerToken = (req as any).ownerToken;

    const links = await getLinksByOwner(ownerToken);

    // Enhance response with short_url for each link
    const enrichedLinks = links.map(link => ({
      id: link.id,
      short_code: link.short_code,
      short_url: `${env.BASE_URL}/r/${link.short_code}`,
      target_url: link.target_url,
      click_count: link.click_count,
      created_at: link.created_at,
      last_click_at: link.last_click_at,
    }));

    return res.status(200).json(enrichedLinks);
  } catch (error) {
    console.error('Error in GET /api/links:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch links',
    });
  }
});

export default router;
