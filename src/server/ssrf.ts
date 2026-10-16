import { URL } from 'url';

export interface SSRFValidationResult {
  valid: boolean;
  normalizedUrl?: string;
  error?: string;
}

// Prohibited IP ranges (RFC 1918, link-local, loopback, cloud metadata)
const PRIVATE_IP_PATTERNS = [
  /^127\./,                         // Loopback
  /^10\./,                          // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
  /^192\.168\./,                    // 192.168.0.0/16
  /^169\.254\./,                    // Link-local / Cloud metadata (169.254.169.254)
  /^0\./,                           // Current network
  /^::1$/,                          // IPv6 loopback
  /^fc00:/i,                        // IPv6 Unique Local
  /^fe80:/i,                        // IPv6 Link-local
];

const FORBIDDEN_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.internal',
  'instance-data',
  '169.254.169.254',
  '127.0.0.1',
  '0.0.0.0',
]);

export function validateUrlForSSRF(rawUrl: string): SSRFValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'URL must be a non-empty string.' };
  }

  let parsed: URL;
  try {
    let cleanUrl = rawUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    parsed = new URL(cleanUrl);
  } catch {
    return { valid: false, error: 'Malformed URL format.' };
  }

  // 1. Strict protocol enforcement
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      error: `Protocol "${parsed.protocol}" is rejected. Only HTTP and HTTPS are permitted.`,
    };
  }

  // 2. Reject embedded credentials (user:pass@host)
  if (parsed.username || parsed.password) {
    return {
      valid: false,
      error: 'Embedded credentials (username/password in URL) are prohibited for security.',
    };
  }

  // 3. Port restrictions
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443' && parsed.port !== '8080' && parsed.port !== '8443') {
    return {
      valid: false,
      error: `Port ${parsed.port} is blocked. Only standard web ports (80, 443, 8080, 8443) are allowed.`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 4. Forbidden hostnames
  if (FORBIDDEN_HOSTNAMES.has(hostname)) {
    return {
      valid: false,
      error: `Host "${hostname}" points to an internal loopback or metadata destination.`,
    };
  }

  // 5. Prohibited TLDs and suffix checks
  if (
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.onion') ||
    hostname.endsWith('.localdomain')
  ) {
    return {
      valid: false,
      error: `Internal domain suffix in "${hostname}" is prohibited.`,
    };
  }

  // 6. Check for private/reserved IP patterns directly
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        valid: false,
        error: `Host "${hostname}" is in a private, loopback, or link-local address space.`,
      };
    }
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
  };
}
