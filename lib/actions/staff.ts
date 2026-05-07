"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

// ─── Auth guard helper ────────────────────────────────────────────────────────
async function requireStaff() {
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
}

// --- Helper to serialize Prisma Decimal and other complex objects ---
function serializePrisma<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (data instanceof Date) return data;
  // Handle Prisma Decimal
  if (typeof (data as any)?.toNumber === 'function') return (data as any).toNumber() as any;
  if (Array.isArray(data)) return data.map(serializePrisma) as any;
  if (typeof data === 'object') {
    const res: any = {};
    for (const key of Object.keys(data as any)) {
      res[key] = serializePrisma((data as any)[key]);
    }
    return res;
  }
  return data;
}


// ─────────────────────────────────────────────────────────────────────────────
// FLIGHTS
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffFlights() {
  await requireStaff();
  const flights = await prisma.flight.findMany({
    include: {
      depAirport: { select: { iataCode: true, city: true } },
      arrAirport: { select: { iataCode: true, city: true } },
      aircraft: { select: { model: true, manufacturer: true, registrationNum: true } },
      schedules: { orderBy: { departureDate: "desc" }, take: 1 },
      _count: {
        select: {
          reservations: { where: { status: { not: "CANCELLED" } } },
          schedules: true,
          statusHistory: true,
        },
      },
    },
    orderBy: { schedDeparture: "asc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(flights) };
}

export async function createFlight(data: {
  flightNumber: string;
  depAirportId: string;
  arrAirportId: string;
  aircraftId: string;
  schedDeparture: string;
  schedArrival: string;
  basePrice: number;
  isRoundTrip?: boolean;
  returnDate?: string;
}) {
  await requireStaff();
  const flight = await prisma.flight.create({
    data: {
      flightNumber: data.flightNumber,
      depAirportId: data.depAirportId,
      arrAirportId: data.arrAirportId,
      aircraftId: data.aircraftId,
      schedDeparture: new Date(data.schedDeparture),
      schedArrival: new Date(data.schedArrival),
      basePrice: data.basePrice,
      isRoundTrip: data.isRoundTrip ?? false,
      returnDate: data.returnDate ? new Date(data.returnDate) : null,
    },
  });
  revalidatePath("/staff/flights");
  return { success: true as const, data: serializePrisma(flight) };
}

export async function deleteFlight(flightId: string) {
  await requireStaff();
  await prisma.flight.delete({ where: { flightId } });
  revalidatePath("/staff/flights");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLIGHT SCHEDULES
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffSchedules() {
  await requireStaff();
  const schedules = await prisma.flightSchedule.findMany({
    include: {
      flight: {
        include: {
          depAirport: { select: { iataCode: true, city: true } },
          arrAirport: { select: { iataCode: true, city: true } },
        },
      },
    },
    orderBy: { departureDate: "desc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(schedules) };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLIGHT STATUS HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffStatusHistory() {
  await requireStaff();
  const history = await prisma.flightStatusHistory.findMany({
    include: {
      flight: { select: { flightNumber: true, schedDeparture: true } },
      staff: { select: { firstName: true, lastName: true, role: true } },
    },
    orderBy: { changeTime: "desc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(history) };
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSENGERS (staff management)
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffPassengers() {
  await requireStaff();
  const passengers = await prisma.passenger.findMany({
    include: {
      _count: { select: { reservations: true } },
      reservations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, status: true, totalAmount: true, travelClass: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(passengers) };
}

export async function deletePassenger(passengerId: string) {
  await requireStaff();
  await prisma.passenger.delete({ where: { passengerId } });
  revalidatePath("/staff/passengers");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// SEATS
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffSeats() {
  await requireStaff();
  const seats = await prisma.seat.findMany({
    include: {
      aircraft: { select: { registrationNum: true, model: true } },
      _count: {
        select: { reservations: { where: { status: { not: "CANCELLED" } } } },
      },
    },
    orderBy: [{ aircraft: { registrationNum: "asc" } }, { seatNumber: "asc" }],
    take: 1000, // Aircraft seats can be many
  });
  return { success: true as const, data: serializePrisma(seats) };
}

// ─────────────────────────────────────────────────────────────────────────────
// BAGGAGE
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffBaggage() {
  await requireStaff();
  const baggage = await prisma.baggage.findMany({
    include: {
      reservation: {
        include: {
          passenger: { select: { firstName: true, lastName: true, email: true } },
          flight: {
            select: {
              flightNumber: true,
              schedDeparture: true,
              depAirport: { select: { iataCode: true } },
              arrAirport: { select: { iataCode: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(baggage) };
}

export async function updateBaggageStatus(baggageId: string, status: string) {
  await requireStaff();
  await prisma.baggage.update({
    where: { baggageId },
    data: { status: status as never },
  });
  revalidatePath("/staff/seats-baggage");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// RESERVATIONS
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffReservations() {
  await requireStaff();
  const reservations = await prisma.reservation.findMany({
    include: {
      passenger: { select: { firstName: true, lastName: true, email: true, phone: true } },
      flight: {
        include: {
          depAirport: { select: { iataCode: true, city: true } },
          arrAirport: { select: { iataCode: true, city: true } },
        },
      },
      seat: { select: { seatNumber: true, class: true } },
      payments: { select: { status: true, amount: true, paymentMethod: true } },
      baggage: { select: { baggageId: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(reservations) };
}

export async function updateReservationStatus(
  reservationId: string,
  status: string
) {
  await requireStaff();
  const existing = await prisma.reservation.findUnique({
    where: { reservationId },
    select: { status: true },
  });
  if (!existing) return { success: false as const, error: "Not found" };

  await prisma.$transaction([
    prisma.reservation.update({
      where: { reservationId },
      data: { status: status as never },
    }),
    prisma.reservationHistory.create({
      data: {
        reservationId,
        oldStatus: existing.status,
        newStatus: status as never,
        reason: "Updated by staff",
      },
    }),
  ]);
  revalidatePath("/staff/reservations");
  return { success: true as const };
}

export async function staffCancelReservation(reservationId: string) {
  await requireStaff();
  const existing = await prisma.reservation.findUnique({
    where: { reservationId },
    select: { status: true, totalAmount: true },
  });
  if (!existing) return { success: false as const, error: "Not found" };

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
        reason: "Cancelled by staff",
      },
    }),
    prisma.payment.updateMany({
      where: { reservationId, status: "COMPLETED" },
      data: { status: "REFUNDED", refundAmount: existing.totalAmount, refundDate: new Date() },
    }),
  ]);
  revalidatePath("/staff/reservations");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// RESERVATION HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffReservationHistory() {
  await requireStaff();
  const history = await prisma.reservationHistory.findMany({
    include: {
      reservation: {
        include: {
          passenger: { select: { firstName: true, lastName: true, email: true } },
          flight: { select: { flightNumber: true } },
        },
      },
    },
    orderBy: { changeTime: "desc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(history) };
}

// ─────────────────────────────────────────────────────────────────────────────
// AIRCRAFTS
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffAircrafts() {
  await requireStaff();
  const aircrafts = await prisma.aircraft.findMany({
    include: {
      _count: { select: { flights: true, seats: true } },
      flights: {
        where: { status: { in: ["SCHEDULED", "BOARDING", "DELAYED"] } },
        select: { flightId: true, flightNumber: true, status: true },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return { success: true as const, data: serializePrisma(aircrafts) };
}

export async function createAircraft(data: {
  registrationNum: string;
  model: string;
  manufacturer: string;
  totalSeats: number;
  firstClassSeats: number;
  businessSeats: number;
  economySeats: number;
}) {
  await requireStaff();
  const aircraft = await prisma.aircraft.create({ data });
  revalidatePath("/staff/aircrafts");
  return { success: true as const, data: serializePrisma(aircraft) };
}

export async function updateAircraftStatus(aircraftId: string, status: string) {
  await requireStaff();
  await prisma.aircraft.update({
    where: { aircraftId },
    data: { status: status as never },
  });
  revalidatePath("/staff/aircrafts");
  return { success: true as const };
}

export async function deleteAircraft(aircraftId: string) {
  await requireStaff();
  await prisma.aircraft.delete({ where: { aircraftId } });
  revalidatePath("/staff/aircrafts");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// AIRPORTS
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffAirports() {
  await requireStaff();
  const airports = await prisma.airport.findMany({
    include: {
      _count: { select: { departingFlights: true, arrivingFlights: true } },
    },
    orderBy: { city: "asc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(airports) };
}

export async function createAirport(data: {
  iataCode: string;
  airportName: string;
  city: string;
  country: string;
  timezone: string;
}) {
  await requireStaff();
  const airport = await prisma.airport.create({ data });
  revalidatePath("/staff/airports");
  return { success: true as const, data: serializePrisma(airport) };
}

export async function deleteAirport(airportId: string) {
  await requireStaff();
  await prisma.airport.delete({ where: { airportId } });
  revalidatePath("/staff/airports");
  return { success: true as const };
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────
export async function getStaffPayments() {
  await requireStaff();
  const payments = await prisma.payment.findMany({
    include: {
      reservation: {
        include: {
          passenger: { select: { firstName: true, lastName: true, email: true } },
          flight: {
            include: {
              depAirport: { select: { iataCode: true } },
              arrAirport: { select: { iataCode: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return { success: true as const, data: serializePrisma(payments) };
}

export async function refundPayment(paymentId: string) {
  await requireStaff();
  const payment = await prisma.payment.findUnique({
    where: { paymentId },
    select: { amount: true, status: true },
  });
  if (!payment) return { success: false as const, error: "Payment not found" };
  if (payment.status !== "COMPLETED")
    return { success: false as const, error: "Only completed payments can be refunded" };

  await prisma.payment.update({
    where: { paymentId },
    data: { status: "REFUNDED", refundAmount: payment.amount, refundDate: new Date() },
  });
  revalidatePath("/staff/payments");
  return { success: true as const };
}
