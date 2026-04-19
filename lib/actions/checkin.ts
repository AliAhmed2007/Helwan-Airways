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

  const reservation = await prisma.reservation.update({
    where: { reservationId: parsed.data.bookingPassengerId },
    data: {
      checkInStatus: "CHECKED_IN",
      ...(parsed.data.boardingGroup && {
        boardingGroup: parsed.data.boardingGroup,
      }),
    },
    select: { flightId: true },
  });

  revalidatePath(`/staff/flights/${reservation.flightId}/manifest`);

  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// Undo Check-In (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function undoCheckIn(reservationId: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const reservation = await prisma.reservation.update({
    where: { reservationId },
    data: { checkInStatus: "NOT_CHECKED_IN", boardingGroup: null },
    select: { flightId: true },
  });

  revalidatePath(`/staff/flights/${reservation.flightId}/manifest`);

  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Baggage Weight (staff only) — updates first checked baggage record
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

  // parsed.data.bookingPassengerId is now the reservationId
  const reservation = await prisma.reservation.findUnique({
    where: { reservationId: parsed.data.bookingPassengerId },
    include: { baggage: { take: 1 } },
  });

  if (!reservation) {
    return { success: false as const, error: "Reservation not found" };
  }

  if (reservation.baggage[0]) {
    await prisma.baggage.update({
      where: { baggageId: reservation.baggage[0].baggageId },
      data: { weightKg: parsed.data.baggageWeight },
    });
  } else {
    // Auto-create a baggage entry if none exists
    await prisma.baggage.create({
      data: {
        reservationId: parsed.data.bookingPassengerId,
        baggageType: "CHECKED",
        weightKg: parsed.data.baggageWeight,
        fee: 25,
      },
    });
  }

  revalidatePath(`/staff/flights/${reservation.flightId}/manifest`);

  return { success: true as const };
}
