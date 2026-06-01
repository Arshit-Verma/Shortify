const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export interface LinkData {
  id: string;
  short_code: string;
  short_url: string;
  target_url: string;
  click_count: number;
  created_at: string;
  last_click_at: string | null;
}

export interface CreateLinkResponse {
  id: string;
  short_code: string;
  short_url: string;
  target_url: string;
  created_at: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Get owner token from localStorage or null
 */
function getOwnerToken(): string | null {
  return localStorage.getItem('owner_token');
}

/**
 * Set owner token in localStorage
 */
function setOwnerToken(token: string): void {
  localStorage.setItem('owner_token', token);
}

/**
 * Create a short link
 */
export async function createShortLink(targetUrl: string): Promise<CreateLinkResponse> {
  const ownerToken = getOwnerToken();

  const response = await fetch(`${API_BASE_URL}/api/shorten`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ownerToken ? { 'X-Owner-Token': ownerToken } : {}),
    },
    body: JSON.stringify({ target_url: targetUrl }),
  });

  // Check if a new owner token was issued
  const newToken = response.headers.get('X-Owner-Token');
  if (newToken && !ownerToken) {
    setOwnerToken(newToken);
  }

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw error;
  }

  return (await response.json()) as CreateLinkResponse;
}

/**
 * Fetch all short links for the current user
 */
export async function fetchLinks(): Promise<LinkData[]> {
  const ownerToken = getOwnerToken();

  if (!ownerToken) {
    throw { code: 'NO_TOKEN', message: 'No owner token found' } as ApiError;
  }

  const response = await fetch(`${API_BASE_URL}/api/links`, {
    method: 'GET',
    headers: {
      'X-Owner-Token': ownerToken,
    },
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw error;
  }

  return (await response.json()) as LinkData[];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}
