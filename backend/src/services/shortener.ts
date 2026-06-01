import supabase, { Link } from './supabaseClient.js';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SHORT_CODE_LENGTH = 6;

/**
 * Generate a random short code using base62
 */
export function generateShortCode(length: number = SHORT_CODE_LENGTH): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Create a new short link
 * Attempts to insert with a unique short_code; retries on collision
 */
export async function createLink(
  targetUrl: string,
  ownerToken: string | null = null,
  maxRetries: number = 5
): Promise<Link> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const shortCode = generateShortCode();

    const { data, error } = await supabase
      .from('links')
      .insert([
        {
          short_code: shortCode,
          target_url: targetUrl,
          owner_token: ownerToken,
          click_count: 0,
        },
      ])
      .select('*')
      .single();

    if (error) {
      // Check if it's a unique constraint violation (short_code exists)
      if (error.code === '23505') {
        // Collision; retry
        continue;
      }
      // Some other error
      throw new Error(`Failed to create link: ${error.message}`);
    }

    return data as Link;
  }

  throw new Error(`Failed to create link after ${maxRetries} attempts (too many collisions)`);
}

/**
 * Get a link by short code
 */
export async function getLinkByCode(shortCode: string): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', shortCode)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch link: ${error.message}`);
  }

  return data as Link;
}

/**
 * Get all links for an owner
 */
export async function getLinksByOwner(ownerToken: string): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('owner_token', ownerToken)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch links: ${error.message}`);
  }

  return (data || []) as Link[];
}

/**
 * Increment click count for a link
 * This is done asynchronously and should not delay the redirect response
 */
export function incrementClickCount(linkId: string): void {
  // Fire-and-forget; do not await or throw
  (async () => {
    try {
      // Get current click count
      const { data: link, error: fetchError } = await supabase
        .from('links')
        .select('click_count')
        .eq('id', linkId)
        .single();

      if (fetchError) {
        console.error(`Failed to fetch link for incrementing click count ${linkId}:`, fetchError);
        return;
      }

      // Update with incremented count
      const { error: updateError } = await supabase
        .from('links')
        .update({
          click_count: (link?.click_count || 0) + 1,
          last_click_at: new Date().toISOString(),
        })
        .eq('id', linkId);

      if (updateError) {
        console.error(`Failed to increment click count for link ${linkId}:`, updateError);
      }
    } catch (err: any) {
      console.error(`Failed to increment click count for link ${linkId}:`, err);
    }
  })();
}

/**
 * Delete a link by ID (only owner can delete)
 * Verifies ownership by checking owner_token
 */
export async function deleteLink(linkId: string, ownerToken: string): Promise<void> {
  // First, fetch the link to verify ownership
  const { data: link, error: fetchError } = await supabase
    .from('links')
    .select('id, owner_token')
    .eq('id', linkId)
    .single();

  if (fetchError || !link) {
    throw new Error('Link not found');
  }

  // Verify ownership
  if (link.owner_token !== ownerToken) {
    throw new Error('You are not authorized to delete this link');
  }

  // Delete the link (cascade will delete associated clicks)
  const { error: deleteError } = await supabase
    .from('links')
    .delete()
    .eq('id', linkId);

  if (deleteError) {
    throw new Error(`Failed to delete link: ${deleteError.message}`);
  }
}

/**
 * Record a click in the clicks table
 * This is done asynchronously
 */
export function recordClick(
  linkId: string,
  ipHash: string | null,
  userAgent: string | null,
  referrer: string | null
): void {
  // Fire-and-forget
  (async () => {
    try {
      await supabase.from('clicks').insert([
        {
          link_id: linkId,
          ip_hash: ipHash,
          user_agent: userAgent,
          referrer: referrer,
        },
      ]);
    } catch (err: any) {
      console.error(`Failed to record click for link ${linkId}:`, err);
    }
  })();
}
