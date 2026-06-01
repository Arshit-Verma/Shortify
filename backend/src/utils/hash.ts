import crypto from 'crypto';

/**
 * Hash an IP address using HMAC for privacy
 */
export function hashIp(ip: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(ip).digest('hex').substring(0, 128);
}

/**
 * Extract client IP from request, accounting for proxies
 */
export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
    return (Array.isArray(ips) ? ips[0] : forwarded).trim();
  }
  return req.socket?.remoteAddress || '0.0.0.0';
}
