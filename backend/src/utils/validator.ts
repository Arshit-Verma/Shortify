import dns from 'dns/promises';

/**
 * Private IP ranges (CIDR notation)
 */
const PRIVATE_RANGES = [
  { min: '0.0.0.0', max: '0.255.255.255' },
  { min: '10.0.0.0', max: '10.255.255.255' },
  { min: '127.0.0.0', max: '127.255.255.255' },
  { min: '169.254.0.0', max: '169.254.255.255' },
  { min: '172.16.0.0', max: '172.31.255.255' },
  { min: '192.0.0.0', max: '192.0.0.255' },
  { min: '192.0.2.0', max: '192.0.2.255' },
  { min: '192.168.0.0', max: '192.168.255.255' },
  { min: '198.18.0.0', max: '198.19.255.255' },
  { min: '198.51.100.0', max: '198.51.100.255' },
  { min: '203.0.113.0', max: '203.0.113.255' },
  { min: '224.0.0.0', max: '239.255.255.255' },
  { min: '240.0.0.0', max: '255.255.255.255' },
];

/**
 * Convert IPv4 address string to number
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Check if IP is in private range
 */
function isPrivateIp(ip: string): boolean {
  if (ip === 'localhost') return true;
  if (ip === '::1') return true; // IPv6 loopback
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true; // IPv6 private ranges

  const num = ipToNumber(ip);
  return PRIVATE_RANGES.some(range => {
    const minNum = ipToNumber(range.min);
    const maxNum = ipToNumber(range.max);
    return num >= minNum && num <= maxNum;
  });
}

/**
 * Check if URL is safe (not SSRF, not private)
 */
export async function isSafeUrl(urlString: string): Promise<boolean> {
  try {
    const url = new URL(urlString);

    // Disallow non-http(s) schemes
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    // Disallow javascript: and data: schemes
    if (urlString.includes('javascript:') || urlString.includes('data:')) {
      return false;
    }

    // DNS resolution and private IP check
    try {
      const addresses = await dns.resolve4(url.hostname);
      for (const addr of addresses) {
        if (isPrivateIp(addr)) {
          return false;
        }
      }
    } catch (err) {
      // DNS resolution failed, allow (let the browser handle it)
      return true;
    }

    return true;
  } catch (err) {
    // Invalid URL
    return false;
  }
}

/**
 * Validate URL format and constraints
 */
export function validateUrl(urlString: string): { valid: boolean; error?: string } {
  if (!urlString) {
    return { valid: false, error: 'URL is required' };
  }

  if (urlString.length > 2048) {
    return { valid: false, error: 'URL must be less than 2048 characters' };
  }

  try {
    new URL(urlString);
    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format' };
  }
}
