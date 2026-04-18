"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import {
  CheckInSchema,
  BaggageWeightSchema,
  type CheckInValues,
  type BaggageWeightValues,
} from "@/lib/schemas/checkin";

// ─────────────────────────────────────────────────────────────────────────────
// Check In Passenger (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function checkInPassenger(input: CheckInValues) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = CheckInSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const passenger = await prisma.bookingPassenger.update({
    where: { id: parsed.data.bookingPassengerId },
    data: {
      checkInStatus: "CHECKED_IN",
      ...(parsed.data.boardingGroup && {
        boardingGroup: parsed.data.boardingGroup,
      }),
    },
    include: {
      booking: {
        select: { flightId: true },
      },
    },
  });

  revalidatePath(
    `/staff/flights/${passenger.booking.flightId}/manifest`
  );

  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// Undo Check-In (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function undoCheckIn(bookingPassengerId: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const passenger = await prisma.bookingPassenger.update({
    where: { id: bookingPassengerId },
    data: { checkInStatus: "NOT_CHECKED_IN", boardingGroup: null },
    include: {
      booking: { select: { flightId: true } },
    },
  });

  revalidatePath(
    `/staff/flights/${passenger.booking.flightId}/manifest`
  );

  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Baggage Weight (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateBaggageWeight(input: BaggageWeightValues) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = BaggageWeightSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const passenger = await prisma.bookingPassenger.update({
    where: { id: parsed.data.bookingPassengerId },
    data: { baggageWeight: parsed.data.baggageWeight },
    include: {
      booking: { select: { flightId: true } },
    },
  });

  revalidatePath(
    `/staff/flights/${passenger.booking.flightId}/manifest`
  );

  return { success: true as const };
}
