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

  let dateFilter = {};
  if (departureDate) {
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate);
    endOfDay.setHours(23, 59, 59, 999);
    dateFilter = { departureDate: { gte: startOfDay, lte: endOfDay } };
  }

  const schedules = await prisma.flightSchedule.findMany({
    where: {
      scheduleStatus: { not: "CANCELLED" },
      ...dateFilter,
      flight: {
        status: { in: ["SCHEDULED", "DELAYED"] },
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
      flight: { status: { in: ["SCHEDULED", "DELAYED"] } },
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

// ─────────────────────────────────────────────────────────────────────────────
// Get Featured Destinations (public — for home page destination cards)
// ─────────────────────────────────────────────────────────────────────────────
export async function getFeaturedDestinations() {
  // Fetch upcoming flights from CAI to discover real reachable destinations
  const upcomingFlights = await prisma.flight.findMany({
    where: {
      depAirport: { iataCode: "CAI" },
      schedDeparture: { gte: new Date() },
      status: { in: ["SCHEDULED", "DELAYED"] },
    },
    include: {
      arrAirport: true
    },
    orderBy: { basePrice: "asc" }
  });

  const uniqueCountries = new Set<string>();
  const destinations = [];
  
  const gradients = [
    { gradient: "from-blue-500/20 to-indigo-500/20", accent: "blue" },
    { gradient: "from-amber-500/20 to-orange-500/20", accent: "amber" },
    { gradient: "from-red-500/20 to-rose-500/20", accent: "red" },
    { gradient: "from-emerald-500/20 to-teal-500/20", accent: "emerald" },
    { gradient: "from-violet-500/20 to-purple-500/20", accent: "violet" },
    { gradient: "from-sky-500/20 to-blue-500/20", accent: "sky" },
    { gradient: "from-pink-500/20 to-rose-500/20", accent: "pink" },
    { gradient: "from-yellow-500/20 to-amber-500/20", accent: "yellow" }
  ];

  let colorIdx = 0;

  for (const flight of upcomingFlights) {
      const airport = flight.arrAirport;
      if (airport.iataCode === "CAI") continue; // should already be true, but just in case
      if (uniqueCountries.has(airport.country)) continue;

      uniqueCountries.add(airport.country);

      let emoji = "🌍";
      switch (airport.country) {
          case "Egypt": emoji = "🇪🇬"; break;
          case "UAE": emoji = "🇦🇪"; break;
          case "United Kingdom": emoji = "🇬🇧"; break;
          case "Turkey": emoji = "🇹🇷"; break;
          case "France": emoji = "🇫🇷"; break;
          case "USA": emoji = "🇺🇸"; break;
          case "Qatar": emoji = "🇶🇦"; break;
          case "Germany": emoji = "🇩🇪"; break;
          case "Netherlands": emoji = "🇳🇱"; break;
          case "Saudi Arabia": emoji = "🇸🇦"; break;
          case "Spain": emoji = "🇪🇸"; break;
          case "Japan": emoji = "🇯🇵"; break;
          case "Kuwait": emoji = "🇰🇼"; break;
          case "Oman": emoji = "🇴🇲"; break;
          case "Bahrain": emoji = "🇧🇭"; break;
          case "Italy": emoji = "🇮🇹"; break;
          case "Greece": emoji = "🇬🇷"; break;
      }

      destinations.push({
         city: airport.city,
         country: airport.country,
         iata: airport.iataCode,
         price: `from $${Number(flight.basePrice)}`,
         emoji,
         gradient: gradients[colorIdx % gradients.length].gradient,
         accent: gradients[colorIdx % gradients.length].accent
      });
      colorIdx++;

      if (destinations.length >= 6) break;
  }

  return { success: true as const, data: destinations };
}
