"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getAllPassengers() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const passengers = await prisma.passenger.findMany({
      include: {
        _count: {
          select: { reservations: true },
        },
        reservations: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: passengers };
  } catch (error) {
    console.error("Error fetching passengers:", error);
    return { success: false, error: "Failed to fetch passengers" };
  }
}
