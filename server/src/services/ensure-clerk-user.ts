import { clerkClient } from '../index.js';
import db from '../db/db.js';
import { mapClerkRole } from '../utils/map-clerk-role.js';
import { syncClerkUser } from './sync-clerk-user.js';

/**
 * Ensures a Clerk-authenticated user has a matching row in our DB.
 * Creates/updates from Clerk profile + publicMetadata.userRole when missing
 * or when `forceRefresh` is true (e.g. after a role change).
 */
export const ensureClerkUserInDb = async (
  userId: string,
  options?: { forceRefresh?: boolean },
) => {
  if (!options?.forceRefresh) {
    const existing = await db.user.findUnique({
      where: { id: userId },
    });
    if (existing) return existing;
  }

  const clerkUser = await clerkClient.users.getUser(userId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error('User email not found on Clerk profile');
  }

  const name =
    `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || email;

  return syncClerkUser({
    id: clerkUser.id,
    email,
    name,
    imageUrl: clerkUser.imageUrl ?? null,
    role: mapClerkRole(
      clerkUser.publicMetadata?.userRole as string | undefined,
    ),
  });
};
