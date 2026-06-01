import rateLimit from 'express-rate-limit';

/**
 * Rate limit for creating short links
 * 10 requests per 15 minutes per IP
 */
export const createLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many links created. Please try again later.',
  },
  statusCode: 429,
  skip: (req) => process.env.NODE_ENV === 'test',
});
