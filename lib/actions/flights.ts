"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  FlightSearchSchema,
  FlightStatusUpdateSchema,
  type FlightSearchValues,
  type FlightStatusUpdateValues,
} from "@/lib/schemas/flight";
import { auth } from "@clerk/nextjs/server";

// ─────────────────────────────────────────────────────────────────────────────
// Search Flights (public) — queries FlightSchedules for a specific date
// ─────────────────────────────────────────────────────────────────────────────
export async function searchFlights(input: FlightSearchValues) {
  const parsed = FlightSearchSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid search parameters" };
  }

  const { fromIata, toIata, departureDate, passengers } = parsed.data;

  const startOfDay = new Date(departureDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(departureDate);
  endOfDay.setHours(23, 59, 59, 999);

  const schedules = await prisma.flightSchedule.findMany({
    where: {
      scheduleStatus: { not: "CANCELLED" },
      departureDate: { gte: startOfDay, lte: endOfDay },
      flight: {
        status: { not: "CANCELLED" },
        depAirport: { iataCode: fromIata.toUpperCase() },
        arrAirport: { iataCode: toIata.toUpperCase() },
      },
    },
    include: {
      flight: {
        include: {
          depAirport: true,
          arrAirport: true,
          aircraft: {
            select: {
              aircraftId: true,
              model: true,
              manufacturer: true,
              totalSeats: true,
              firstClassSeats: true,
              businessSeats: true,
              economySeats: true,
              seats: {
                select: {
                  seatId: true,
                  class: true,
                  seatNumber: true,
                  extraPrice: true,
                  reservations: { select: { reservationId: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { departureDate: "asc" },
  });

  return { success: true as const, data: schedules };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get All Public Flights (no auth) — used by the customer /flights page
// Returns all non-cancelled FlightSchedules ordered by departure date
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllPublicFlights() {
  const schedules = await prisma.flightSchedule.findMany({
    where: {
      scheduleStatus: { not: "CANCELLED" },
      flight: { status: { not: "CANCELLED" } },
    },
    include: {
      flight: {
        include: {
          depAirport: true,
          arrAirport: true,
          aircraft: {
            select: {
              aircraftId: true,
              model: true,
              manufacturer: true,
              totalSeats: true,
              firstClassSeats: true,
              businessSeats: true,
              economySeats: true,
              seats: {
                select: {
                  seatId: true,
                  class: true,
                  seatNumber: true,
                  extraPrice: true,
                  reservations: { select: { reservationId: true } },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { departureDate: "asc" },
  });

  return { success: true as const, data: schedules };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Single Flight with full detail (public) — by flightId
// ─────────────────────────────────────────────────────────────────────────────
export async function getFlightById(flightId: string) {
  const flight = await prisma.flight.findUnique({
    where: { flightId },
    include: {
      depAirport: true,
      arrAirport: true,
      aircraft: {
        include: {
          seats: {
            orderBy: [{ class: "asc" }, { seatNumber: "asc" }],
            include: {
              reservations: {
                where: { status: { not: "CANCELLED" } },
                select: { reservationId: true, flightId: true },
              },
            },
          },
        },
      },
      schedules: {
        orderBy: { departureDate: "asc" },
      },
      _count: {
        select: { reservations: { where: { status: { not: "CANCELLED" } } } },
      },
    },
  });

  if (!flight) {
    return { success: false as const, error: "Flight not found" };
  }

  return { success: true as const, data: flight };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get All Flights (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAllFlights() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const flights = await prisma.flight.findMany({
    include: {
      depAirport: true,
      arrAirport: true,
      aircraft: {
        select: {
          model: true,
          manufacturer: true,
          totalSeats: true,
          registrationNum: true,
        },
      },
      schedules: {
        orderBy: { departureDate: "desc" },
        take: 1,
      },
      _count: {
        select: {
          reservations: { where: { status: { not: "CANCELLED" } } },
        },
      },
    },
    orderBy: { schedDeparture: "asc" },
  });

  return { success: true as const, data: flights };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Flight Status (staff only) — also logs to FlightStatusHistory
// ─────────────────────────────────────────────────────────────────────────────
export async function updateFlightStatus(input: FlightStatusUpdateValues) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = FlightStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { flightId, status, gate, terminal } = parsed.data;

  // Get old status for audit log
  const existing = await prisma.flight.findUnique({
    where: { flightId },
    select: { status: true },
  });

  if (!existing) {
    return { success: false as const, error: "Flight not found" };
  }

  // Find staff record linked to this Clerk user
  const staffRecord = userId
    ? await prisma.staff.findUnique({
        where: { clerkUserId: userId },
        select: { staffId: true },
      })
    : null;

  await prisma.$transaction(async (tx) => {
    // Update flight status
    await tx.flight.update({
      where: { flightId },
      data: { status },
    });

    // Update the latest schedule's gate/terminal if provided
    if (gate || terminal) {
      const latestSchedule = await tx.flightSchedule.findFirst({
        where: { flightId },
        orderBy: { departureDate: "desc" },
      });
      if (latestSchedule) {
        await tx.flightSchedule.update({
          where: { scheduleId: latestSchedule.scheduleId },
          data: {
            ...(gate && { gate }),
            ...(terminal && { terminal }),
          },
        });
      }
    }

    // Log to FlightStatusHistory
    await tx.flightStatusHistory.create({
      data: {
        flightId,
        oldStatus: existing.status,
        newStatus: status,
        changedBy: staffRecord?.staffId ?? null,
      },
    });
  });

  revalidatePath("/staff/flights");
  revalidatePath(`/staff/flights/${flightId}`);

  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get All Airports (public — for search widget autocomplete)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAirports() {
  const airports = await prisma.airport.findMany({
    orderBy: { city: "asc" },
    select: {
      airportId: true,
      iataCode: true,
      airportName: true,
      city: true,
      country: true,
    },
  });
  return { success: true as const, data: airports };
}
