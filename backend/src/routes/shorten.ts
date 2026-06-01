import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLink } from '../services/shortener.js';
import { validateUrl, isSafeUrl } from '../utils/validator.js';
import { createLinkLimiter } from '../middleware/rateLimiter.js';
import env from '../utils/config.js';

const router = Router();

const shortenSchema = z.object({
  target_url: z.string().url('Invalid URL format'),
});

/**
 * POST /api/shorten
 * Create a new short link
 */
router.post('/shorten', createLinkLimiter, async (req: Request, res: Response) => {
  try {
    // Parse and validate request body
    const parsed = shortenSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        code: 'INVALID_REQUEST',
        message: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }

    const { target_url } = parsed.data;

    // Additional URL validation
    const urlValidation = validateUrl(target_url);
    if (!urlValidation.valid) {
      return res.status(400).json({
        code: 'INVALID_URL',
        message: urlValidation.error || 'Invalid URL',
      });
    }

    // Security check: ensure URL is not SSRF/private
    const safe = await isSafeUrl(target_url);
    if (!safe) {
      return res.status(400).json({
        code: 'UNSAFE_URL',
        message: 'URL is not allowed (private network or invalid scheme)',
      });
    }

    // Create the link with owner token
    const ownerToken = (req as any).ownerToken;
    const link = await createLink(target_url, ownerToken);

    // Construct short URL
    const shortUrl = `${env.BASE_URL}/r/${link.short_code}`;

    // Set X-Owner-Token in response if it was newly generated
    const responseToken = req.headers['x-owner-token'];
    if (!responseToken) {
      res.setHeader('X-Owner-Token', ownerToken);
    }

    return res.status(201).json({
      id: link.id,
      short_code: link.short_code,
      short_url: shortUrl,
      target_url: link.target_url,
      created_at: link.created_at,
    });
  } catch (error) {
    console.error('Error in POST /api/shorten:', error);
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create short link',
    });
  }
});

export default router;
