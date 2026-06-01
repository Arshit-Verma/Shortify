import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to ensure X-Owner-Token exists
 * If missing, generate a new one and set it in response header
 */
export function ownerTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  let ownerToken = req.headers['x-owner-token'] as string;

  if (!ownerToken) {
    ownerToken = uuidv4();
    res.setHeader('X-Owner-Token', ownerToken);
  }

  // Attach to request for use in routes
  (req as any).ownerToken = ownerToken;

  next();
}

/**
 * Middleware to require X-Owner-Token for protected endpoints
 */
export function requireOwnerToken(req: Request, res: Response, next: NextFunction) {
  const ownerToken = (req as any).ownerToken;

  if (!ownerToken) {
    return res.status(401).json({
      code: 'MISSING_OWNER_TOKEN',
      message: 'X-Owner-Token header is required',
    });
  }

  next();
}
