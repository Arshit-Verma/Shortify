import { Router, Request, Response } from 'express';
import { getLinkByCode, incrementClickCount, recordClick } from '../services/shortener.js';
import { hashIp, getClientIp } from '../utils/hash.js';
import env from '../utils/config.js';

const router = Router();

/**
 * GET /r/:short_code
 * Redirect to the target URL
 * Records the click asynchronously (does not block redirect)
 */
router.get('/r/:short_code', async (req: Request, res: Response) => {
  try {
    const { short_code } = req.params;

    // Fetch the link from database
    const link = await getLinkByCode(short_code);

    if (!link) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Short link not found',
      });
    }

    // Asynchronously increment click count and record click details
    // Do NOT await this; let it happen in the background
    incrementClickCount(link.id);

    const clientIp = getClientIp(req);
    const ipHash = hashIp(clientIp, env.IP_HASH_SECRET);
    const userAgent = req.headers['user-agent'] || null;
    const referrer = req.headers['referer'] || null;

    recordClick(link.id, ipHash, userAgent as string | null, referrer as string | null);

    // Return 302 redirect immediately
    return res.redirect(302, link.target_url);
  } catch (error) {
    console.error('Error in GET /r/:short_code:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to process redirect',
    });
  }
});

export default router;
