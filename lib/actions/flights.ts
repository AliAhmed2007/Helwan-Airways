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
// Search Flights (public)
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

  const flights = await prisma.flight.findMany({
    where: {
      departureAirport: { iataCode: fromIata.toUpperCase() },
      arrivalAirport: { iataCode: toIata.toUpperCase() },
      departureTime: { gte: startOfDay, lte: endOfDay },
      status: { not: "CANCELLED" },
      // Ensure enough available seats
      seats: {
        some: { status: "AVAILABLE" },
      },
    },
    include: {
      departureAirport: true,
      arrivalAirport: true,
      seats: {
        where: { status: "AVAILABLE" },
        select: { id: true, status: true },
      },
      _count: {
        select: { seats: true },
      },
    },
    orderBy: { departureTime: "asc" },
  });

  // Filter flights with enough seats for the passenger count
  const available = flights.filter((f) => f.seats.length >= passengers);

  return { success: true as const, data: available };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Single Flight (public)
// ─────────────────────────────────────────────────────────────────────────────
export async function getFlightById(id: string) {
  const flight = await prisma.flight.findUnique({
    where: { id },
    include: {
      departureAirport: true,
      arrivalAirport: true,
      seats: {
        orderBy: [{ row: "asc" }, { column: "asc" }],
      },
      _count: {
        select: {
          bookings: true,
          seats: { where: { status: "AVAILABLE" } },
        },
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
      departureAirport: true,
      arrivalAirport: true,
      _count: {
        select: {
          bookings: true,
          seats: { where: { status: "OCCUPIED" } },
        },
      },
    },
    orderBy: { departureTime: "asc" },
  });

  return { success: true as const, data: flights };
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Flight Status (staff only)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateFlightStatus(input: FlightStatusUpdateValues) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "staff") {
    return { success: false as const, error: "Unauthorized" };
  }

  const parsed = FlightStatusUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0].message };
  }

  const { flightId, status, gate, terminal } = parsed.data;

  await prisma.flight.update({
    where: { id: flightId },
    data: {
      status,
      ...(gate && { gate }),
      ...(terminal && { terminal }),
    },
  });

  revalidatePath("/staff/flights");
  revalidatePath(`/staff/flights/${flightId}`);

  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// Get All Airports (for search widget autocomplete)
// ─────────────────────────────────────────────────────────────────────────────
export async function getAirports() {
  const airports = await prisma.airport.findMany({
    orderBy: { city: "asc" },
    select: {
      id: true,
      iataCode: true,
      name: true,
      city: true,
      country: true,
    },
  });
  return { success: true as const, data: airports };
}
