"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CompleteBookingSchema } from "@/lib/schemas/booking";
import type { CompleteBookingValues } from "@/lib/schemas/booking";
import { nanoid } from "nanoid";

// Inline tiny nanoid-like function to avoid extra dep
function generateBookingRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Booking (authenticated customers)
// ─────────────────────────────────────────────────────────────────────────────
export async function createBooking(
  flightId: string,
  formData: CompleteBookingValues
) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "You must be signed in to book" };
  }

  const parsed = CompleteBookingSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0].message,
    };
  }

  const { passengers, seatAssignments, baggageInfo } = parsed.data;

  // Get the flight to calculate pricing
  const flight = await prisma.flight.findUnique({
    where: { id: flightId },
    select: { basePrice: true },
  });

  if (!flight) {
    return { success: false as const, error: "Flight not found" };
  }

  // Validate all seats are still available
  const seatIds = seatAssignments.map((sa) => sa.seatId);
  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds }, status: "AVAILABLE" },
  });

  if (seats.length !== seatIds.length) {
    return {
      success: false as const,
      error: "One or more selected seats are no longer available. Please reselect your seats.",
    };
  }

  // Calculate total price
  const baseTotal = Number(flight.basePrice) * passengers.length;
  const baggageTotal = baggageInfo.reduce(
    (acc, b) => acc + b.checkedBags * 25,
    0
  ); // $25 per bag
  const seatUpgrades = seats.reduce(
    (acc, s) => acc + Number(s.extraPrice),
    0
  );
  const totalPrice = baseTotal + baggageTotal + seatUpgrades;

  const bookingRef = generateBookingRef();

  // Create booking + passengers + mark seats occupied in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        clerkUserId: userId,
        flightId,
        status: "CONFIRMED",
        totalPrice,
        bookingRef,
      },
    });

    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      const seatAssignment = seatAssignments[i];
      const baggage = baggageInfo[i];

      await tx.bookingPassenger.create({
        data: {
          bookingId: newBooking.id,
          seatId: seatAssignment.seatId,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          dateOfBirth: new Date(passenger.dateOfBirth),
          passportNumber: passenger.passportNumber,
          nationality: passenger.nationality,
          email: passenger.email,
          phone: passenger.phone,
          checkedBags: baggage.checkedBags,
          mealPreference: baggage.mealPreference,
        },
      });

      // Mark seat as occupied
      await tx.seat.update({
        where: { id: seatAssignment.seatId },
        data: { status: "OCCUPIED" },
      });
    }

    return newBooking;
  });

  revalidatePath("/dashboard");

  return {
    success: true as const,
    data: { bookingId: booking.id, bookingRef },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get User Bookings (authenticated user's own bookings)
// ─────────────────────────────────────────────────────────────────────────────
export async function getUserBookings() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const bookings = await prisma.booking.findMany({
    where: { clerkUserId: userId },
    include: {
      flight: {
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      },
      passengers: {
        include: {
          seat: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true as const, data: bookings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Booking By ID (for boarding pass view)
// ─────────────────────────────────────────────────────────────────────────────
export async function getBookingById(bookingId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, clerkUserId: userId },
    include: {
      flight: {
        include: {
          departureAirport: true,
          arrivalAirport: true,
        },
      },
      passengers: {
        include: { seat: true },
      },
    },
  });

  if (!booking) {
    return { success: false as const, error: "Booking not found" };
  }

  return { success: true as const, data: booking };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Flight Manifest (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function getFlightManifest(flightId: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const bookings = await prisma.booking.findMany({
    where: { flightId, status: { not: "CANCELLED" } },
    include: {
      passengers: {
        include: { seat: true },
      },
    },
  });

  // Flatten passengers with booking ref
  const manifest = bookings.flatMap((b) =>
    b.passengers.map((p) => ({
      ...p,
      bookingRef: b.bookingRef,
    }))
  );

  return { success: true as const, data: manifest };
}
