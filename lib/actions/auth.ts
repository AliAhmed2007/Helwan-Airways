"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUserRole() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not logged in" };

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (user.publicMetadata?.role) {
    return { success: true, role: user.publicMetadata.role };
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return { success: false, error: "No email found" };

  // 1. Check if they are staff
  const staff = await prisma.staff.findUnique({
    where: { email },
  });

  if (staff) {
    // Sync Clerk ID -> DB
    await prisma.staff.update({
      where: { email },
      data: { clerkUserId: userId },
    });

    // Assign Role to Clerk
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "staff" },
    });

    return { success: true, role: "staff" };
  }

  // 2. Otherwise, check Passenger
  const passenger = await prisma.passenger.findUnique({
    where: { email },
  });

  if (passenger) {
    await prisma.passenger.update({
      where: { email },
      data: { clerkUserId: userId },
    });
    
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: "passenger" },
    });

    return { success: true, role: "passenger" };
  }

  // If we reach here, neither existed. Check the explicit requested role from unsafeMetadata
  const requestedRole = user.unsafeMetadata?.role as string;
  let finalRole = "passenger";

  if (requestedRole === "staff") {
    await prisma.staff.create({
      data: {
        clerkUserId: userId,
        email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        role: "AGENT", // Default role initially
      },
    });
    finalRole = "staff";
  } else {
    // Default to Passenger
    await prisma.passenger.create({
      data: {
        clerkUserId: userId,
        email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      },
    });
    finalRole = "passenger";
  }

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: finalRole },
  });

  return { success: true, role: finalRole };
}
