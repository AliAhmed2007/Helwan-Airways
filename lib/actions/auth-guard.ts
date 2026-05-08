"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Shared staff auth guard used by all server actions.
 *
 * Clerk's sessionClaims.metadata is not always populated on the first
 * request after sign-in (the JWT hasn't been refreshed yet). When it's
 * missing we fall back to a direct Clerk API call to read publicMetadata.
 *
 * Returns the resolved role string, or throws an error if unauthorized.
 */
export async function requireStaffRole(): Promise<string> {
  const { sessionClaims, userId } = await auth();
  let role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!role && userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata?.role as string | undefined;
  }

  if (role !== "staff") {
    throw new Error("Unauthorized");
  }

  return role;
}

/**
 * Same as requireStaffRole but returns a result object instead of throwing,
 * so it can be used in action functions that return { success, error }.
 */
export async function checkStaffRole(): Promise<
  { authorized: true; userId: string } | { authorized: false; error: string }
> {
  const { sessionClaims, userId } = await auth();
  let role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!role && userId) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata?.role as string | undefined;
  }

  if (role !== "staff" || !userId) {
    return { authorized: false, error: "Unauthorized" };
  }

  return { authorized: true, userId };
}
