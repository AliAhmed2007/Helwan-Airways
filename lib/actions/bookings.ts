"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CompleteBookingSchema } from "@/lib/schemas/booking";
import type { CompleteBookingValues } from "@/lib/schemas/booking";

// ─── Booking ref generator ────────────────────────────────────────────────────
function generateBookingRef(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Reservations (one per passenger)
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

  // Get the flight and its aircraft seats
  const flight = await prisma.flight.findUnique({
    where: { flightId },
    include: {
      aircraft: {
        include: {
          seats: {
            where: { seatId: { in: seatAssignments.map((s) => s.seatId) } },
            include: {
              reservations: {
                where: { status: { not: "CANCELLED" }, flightId },
              },
            },
          },
        },
      },
    },
  });

  if (!flight) {
    return { success: false as const, error: "Flight not found" };
  }

  // Validate all seats are still available for this flight
  const seatIds = seatAssignments.map((sa) => sa.seatId);
  const conflictingSeats = flight.aircraft.seats.filter(
    (s) => s.reservations.length > 0
  );

  if (conflictingSeats.length > 0) {
    return {
      success: false as const,
      error:
        "One or more selected seats are no longer available. Please reselect your seats.",
    };
  }

  // Ensure/create Passenger profile for this Clerk user
  const leadPassengerData = passengers[0];
  let passengerProfile = await prisma.passenger.findUnique({
    where: { clerkUserId: userId },
  });

  if (!passengerProfile) {
    passengerProfile = await prisma.passenger.create({
      data: {
        clerkUserId: userId,
        firstName: leadPassengerData.firstName,
        lastName: leadPassengerData.lastName,
        email: leadPassengerData.email,
        phone: leadPassengerData.phone,
        passportNum: leadPassengerData.passportNumber,
        nationality: leadPassengerData.nationality,
        dateOfBirth: new Date(leadPassengerData.dateOfBirth),
      },
    });
  }

  const sharedBookingRef = generateBookingRef();

  // Create one Reservation per passenger in a transaction
  const reservations = await prisma.$transaction(async (tx) => {
    const created = [];

    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];
      const seatAssignment = seatAssignments[i];
      const baggage = baggageInfo[i];

      // For additional passengers, create separate Passenger records
      let paxProfile = passengerProfile!;
      if (i > 0) {
        // Check if this email already has a passenger
        const existing = await tx.passenger.findUnique({
          where: { email: passenger.email },
        });
        if (existing) {
          paxProfile = existing;
        } else {
          paxProfile = await tx.passenger.create({
            data: {
              firstName: passenger.firstName,
              lastName: passenger.lastName,
              email: passenger.email,
              phone: passenger.phone,
              passportNum: passenger.passportNumber,
              nationality: passenger.nationality,
              dateOfBirth: new Date(passenger.dateOfBirth),
            },
          });
        }
      }

      const seat = flight.aircraft.seats.find(
        (s) => s.seatId === seatAssignment.seatId
      );
      const seatExtra = seat ? Number(seat.extraPrice) : 0;
      const baggageFee = baggage.checkedBags * 25;
      const totalAmount = Number(flight.basePrice) + seatExtra + baggageFee;

      const reservation = await tx.reservation.create({
        data: {
          bookingRef: i === 0 ? sharedBookingRef : `${sharedBookingRef}${i + 1}`,
          clerkUserId: userId,
          passengerId: paxProfile.passengerId,
          flightId,
          seatId: seatAssignment.seatId,
          travelClass: seat?.class ?? "ECONOMY",
          totalAmount,
          status: "CONFIRMED",
          specialReq: null,
        },
      });

      // Create baggage entries if any checked bags
      if (baggage.checkedBags > 0) {
        for (let b = 0; b < baggage.checkedBags; b++) {
          await tx.baggage.create({
            data: {
              reservationId: reservation.reservationId,
              baggageType: "CHECKED",
              status: "CHECKED_IN",
              fee: 25,
            },
          });
        }
      }

      // Create payment record
      await tx.payment.create({
        data: {
          reservationId: reservation.reservationId,
          amount: totalAmount,
          paymentMethod: "CREDIT_CARD",
          status: "COMPLETED",
          transactRef: `TXN-${reservation.reservationId.slice(0, 8).toUpperCase()}`,
        },
      });

      created.push(reservation);
    }

    return created;
  });

  revalidatePath("/dashboard");

  return {
    success: true as const,
    data: {
      reservationId: reservations[0].reservationId,
      bookingRef: sharedBookingRef,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get User Reservations (authenticated customer)
// ─────────────────────────────────────────────────────────────────────────────
export async function getUserBookings() {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const reservations = await prisma.reservation.findMany({
    where: { clerkUserId: userId },
    include: {
      flight: {
        include: {
          depAirport: true,
          arrAirport: true,
          aircraft: { select: { model: true, manufacturer: true } },
        },
      },
      schedule: true,
      seat: true,
      passenger: true,
      baggage: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true as const, data: reservations };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Single Reservation (for boarding pass)
// ─────────────────────────────────────────────────────────────────────────────
export async function getBookingById(reservationId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const reservation = await prisma.reservation.findFirst({
    where: { reservationId, clerkUserId: userId },
    include: {
      flight: {
        include: {
          depAirport: true,
          arrAirport: true,
          aircraft: { select: { model: true, manufacturer: true, registrationNum: true } },
        },
      },
      schedule: true,
      seat: true,
      passenger: true,
      baggage: true,
      payments: true,
    },
  });

  if (!reservation) {
    return { success: false as const, error: "Reservation not found" };
  }

  return { success: true as const, data: reservation };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Flight Manifest (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function getFlightManifest(flightId: string) {
  const { sessionClaims, userId } = await auth();
  let role = (sessionClaims?.metadata as { role?: string })?.role;

  // Fallback: session claims metadata may not be populated — fetch directly
  if (!role && userId) {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata?.role as string | undefined;
  }

  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const reservations = await prisma.reservation.findMany({
    where: { flightId, status: { not: "CANCELLED" } },
    include: {
      passenger: true,
      seat: true,
      baggage: true,
    },
    orderBy: [{ boardingGroup: "asc" }, { createdAt: "asc" }],
  });

  const manifest = reservations.map((r) => ({
    reservationId: r.reservationId,
    bookingRef: r.bookingRef,
    firstName: r.passenger.firstName,
    lastName: r.passenger.lastName,
    email: r.passenger.email,
    phone: r.passenger.phone,
    nationality: r.passenger.nationality,
    passportNum: r.passenger.passportNum,
    seatNumber: r.seat?.seatNumber ?? null,
    seatClass: r.seat?.class ?? r.travelClass,
    checkInStatus: r.checkInStatus,
    boardingGroup: r.boardingGroup,
    baggageCount: r.baggage.length,
    totalBaggageWeight: r.baggage.reduce(
      (acc, b) => acc + Number(b.weightKg ?? 0),
      0
    ),
  }));

  return { success: true as const, data: manifest };
}


// ─────────────────────────────────────────────────────────────────────────────
// Cancel Reservation (customer) — only allowed > 48 h before departure
// ─────────────────────────────────────────────────────────────────────────────
export async function cancelReservation(reservationId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false as const, error: "Not authenticated" };
  }

  const existing = await prisma.reservation.findFirst({
    where: { reservationId, clerkUserId: userId },
    select: {
      reservationId: true,
      status: true,
      totalAmount: true,
      flight: { select: { schedDeparture: true } },
    },
  });

  if (!existing) {
    return { success: false as const, error: "Reservation not found" };
  }
  if (existing.status === "CANCELLED") {
    return { success: false as const, error: "Reservation already cancelled" };
  }

  const hoursUntilDeparture =
    (new Date(existing.flight.schedDeparture).getTime() - Date.now()) / 36e5;

  if (hoursUntilDeparture < 48) {
    return {
      success: false as const,
      error: "Cancellations are only allowed more than 48 hours before departure.",
    };
  }

  await prisma.$transaction([
    prisma.reservation.update({
      where: { reservationId },
      data: { status: "CANCELLED" },
    }),
    prisma.reservationHistory.create({
      data: {
        reservationId,
        oldStatus: existing.status,
        newStatus: "CANCELLED",
        reason: "Cancelled by customer",
      },
    }),
    prisma.payment.updateMany({
      where: { reservationId, status: "COMPLETED" },
      data: { status: "REFUNDED", refundAmount: existing.totalAmount, refundDate: new Date() },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${reservationId}`);
  return { success: true as const };
}

