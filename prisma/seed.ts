/**
 * Helwan Airways — Comprehensive Database Seed (v2)
 * Matches schema.prisma exactly:
 *   Airport, Aircraft, Seat, Staff, Flight, FlightSchedule,
 *   Passenger, Reservation, Baggage, Payment, ReservationHistory
 */

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  PrismaClient,
  FlightStatus,
  SeatClass,
  ReservationStatus,
  PaymentMethod,
  PaymentStatus,
  BaggageType,
  BaggageStatus,
  CheckInStatus,
  StaffRole,
  AircraftStatus,
} from "../generated/prisma/client";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
dotenv.config({ path: ".env.local" });

// ─── DB Connection ───────────────────────────────────────────────────────────
const DB_URL = process.env.DATABASE_URL ?? "";
function parseDbUrl(url: string) {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: Number(u.port) || 3306,
      user: u.username,
      password: u.password,
      database: u.pathname.replace("/", ""),
    };
  } catch {
    return { host: "localhost", port: 3306, user: "root", password: "", database: "helwan_airways" };
  }
}
const dbConfig = parseDbUrl(DB_URL);
const adapter = new PrismaMariaDb({ ...dbConfig, connectionLimit: 5, allowPublicKeyRetrieval: true });
const prisma = new PrismaClient({ adapter } as never);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const addHours = (d: Date, h: number) => new Date(d.getTime() + h * 3_600_000);
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);
const rand = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

function bookingRef(): string {
  return Array.from({ length: 8 }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]
  ).join("");
}

// ─── Airport data ─────────────────────────────────────────────────────────────
const AIRPORTS = [
  // Egypt
  { iataCode: "CAI", airportName: "Cairo International Airport",            city: "Cairo",           country: "Egypt",          timezone: "Africa/Cairo" },
  { iataCode: "HRG", airportName: "Hurghada International Airport",         city: "Hurghada",        country: "Egypt",          timezone: "Africa/Cairo" },
  { iataCode: "SSH", airportName: "Sharm El-Sheikh International Airport",  city: "Sharm El-Sheikh", country: "Egypt",          timezone: "Africa/Cairo" },
  { iataCode: "LXR", airportName: "Luxor International Airport",            city: "Luxor",           country: "Egypt",          timezone: "Africa/Cairo" },
  { iataCode: "ASW", airportName: "Aswan International Airport",            city: "Aswan",           country: "Egypt",          timezone: "Africa/Cairo" },
  // Gulf
  { iataCode: "DXB", airportName: "Dubai International Airport",            city: "Dubai",           country: "UAE",            timezone: "Asia/Dubai" },
  { iataCode: "AUH", airportName: "Abu Dhabi International Airport",        city: "Abu Dhabi",       country: "UAE",            timezone: "Asia/Dubai" },
  { iataCode: "DOH", airportName: "Hamad International Airport",            city: "Doha",            country: "Qatar",          timezone: "Asia/Qatar" },
  { iataCode: "RUH", airportName: "King Khalid International Airport",      city: "Riyadh",          country: "Saudi Arabia",   timezone: "Asia/Riyadh" },
  { iataCode: "JED", airportName: "King Abdulaziz International Airport",   city: "Jeddah",          country: "Saudi Arabia",   timezone: "Asia/Riyadh" },
  { iataCode: "KWI", airportName: "Kuwait International Airport",           city: "Kuwait City",     country: "Kuwait",         timezone: "Asia/Kuwait" },
  { iataCode: "MCT", airportName: "Muscat International Airport",           city: "Muscat",          country: "Oman",           timezone: "Asia/Muscat" },
  { iataCode: "BAH", airportName: "Bahrain International Airport",          city: "Manama",          country: "Bahrain",        timezone: "Asia/Bahrain" },
  // Europe
  { iataCode: "LHR", airportName: "Heathrow Airport",                       city: "London",          country: "United Kingdom", timezone: "Europe/London" },
  { iataCode: "CDG", airportName: "Charles de Gaulle Airport",              city: "Paris",           country: "France",         timezone: "Europe/Paris" },
  { iataCode: "FRA", airportName: "Frankfurt Airport",                      city: "Frankfurt",       country: "Germany",        timezone: "Europe/Berlin" },
  { iataCode: "AMS", airportName: "Amsterdam Schiphol Airport",             city: "Amsterdam",       country: "Netherlands",    timezone: "Europe/Amsterdam" },
  { iataCode: "FCO", airportName: "Leonardo da Vinci International Airport",city: "Rome",            country: "Italy",          timezone: "Europe/Rome" },
  { iataCode: "MAD", airportName: "Adolfo Suárez Madrid–Barajas Airport",  city: "Madrid",          country: "Spain",          timezone: "Europe/Madrid" },
  { iataCode: "IST", airportName: "Istanbul Airport",                       city: "Istanbul",        country: "Turkey",         timezone: "Europe/Istanbul" },
  { iataCode: "ATH", airportName: "Athens International Airport",           city: "Athens",          country: "Greece",         timezone: "Europe/Athens" },
  // Americas & Asia
  { iataCode: "JFK", airportName: "John F. Kennedy International Airport",  city: "New York",        country: "USA",            timezone: "America/New_York" },
  { iataCode: "NRT", airportName: "Narita International Airport",           city: "Tokyo",           country: "Japan",          timezone: "Asia/Tokyo" },
] as const;

type IataCode = (typeof AIRPORTS)[number]["iataCode"];

// ─── Aircraft defs ─────────────────────────────────────────────────────────────
const AIRCRAFT_DEFS = [
  { reg: "SU-GBX", model: "Boeing 737-800",          manufacturer: "Boeing",  total: 160, first: 32, business: 48,  economy: 80 },
  { reg: "SU-GCY", model: "Boeing 737 MAX 8",        manufacturer: "Boeing",  total: 160, first: 32, business: 48,  economy: 80 },
  { reg: "SU-GDZ", model: "Boeing 777-300ER",        manufacturer: "Boeing",  total: 360, first: 72, business: 108, economy: 180 },
  { reg: "SU-GEA", model: "Boeing 787-9 Dreamliner", manufacturer: "Boeing",  total: 300, first: 60, business: 90,  economy: 150 },
  { reg: "SU-GFB", model: "Airbus A320neo",          manufacturer: "Airbus",  total: 150, first: 30, business: 45,  economy: 75 },
  { reg: "SU-GGC", model: "Airbus A321neo",          manufacturer: "Airbus",  total: 200, first: 40, business: 60,  economy: 100 },
  { reg: "SU-GHD", model: "Airbus A330-300",         manufacturer: "Airbus",  total: 280, first: 56, business: 84,  economy: 140 },
  { reg: "SU-GIE", model: "Airbus A350-900",         manufacturer: "Airbus",  total: 330, first: 66, business: 99,  economy: 165 },
] as const;

// Model → registrationNum lookup
const MODEL_TO_REG: Record<string, string> = Object.fromEntries(
  AIRCRAFT_DEFS.map((a) => [a.model, a.reg])
);

// ─── Flight defs ──────────────────────────────────────────────────────────────
type FlightDef = {
  no: string;
  from: IataCode;
  to: IataCode;
  dayOffset: number;
  depHour: number;
  durationH: number;
  price: number;
  status?: FlightStatus;
  gate?: string;
  terminal?: string;
  aircraftModel?: string;
  isRoundTrip?: boolean;
  returnDayOffset?: number;
  returnHour?: number;
};

function buildFlightDefs(): FlightDef[] {
  const HIST_ROUTES: Array<{ from: IataCode; to: IataCode; dur: number; price: number; model?: string }> = [
    { from: "CAI", to: "DXB", dur: 3.5, price: 420, model: "Boeing 737-800" },
    { from: "CAI", to: "LHR", dur: 6.5, price: 680, model: "Boeing 787-9 Dreamliner" },
    { from: "CAI", to: "IST", dur: 3,   price: 310, model: "Airbus A320neo" },
    { from: "CAI", to: "CDG", dur: 6,   price: 590, model: "Airbus A330-300" },
    { from: "CAI", to: "RUH", dur: 2.5, price: 380, model: "Boeing 737 MAX 8" },
    { from: "DXB", to: "CAI", dur: 3.5, price: 390, model: "Airbus A321neo" },
    { from: "LHR", to: "CAI", dur: 6,   price: 710, model: "Boeing 777-300ER" },
    { from: "CAI", to: "JFK", dur: 11,  price: 950, model: "Boeing 777-300ER" },
    { from: "CAI", to: "JED", dur: 2.5, price: 290, model: "Airbus A320neo" },
    { from: "CAI", to: "AMS", dur: 5.5, price: 540, model: "Boeing 787-9 Dreamliner" },
    { from: "CAI", to: "FCO", dur: 4,   price: 460, model: "Airbus A321neo" },
    { from: "CAI", to: "DOH", dur: 2,   price: 350, model: "Boeing 737-800" },
    { from: "CAI", to: "FRA", dur: 5.5, price: 560, model: "Airbus A350-900" },
    { from: "CAI", to: "HRG", dur: 1,   price: 110, model: "Airbus A320neo" },
    { from: "CAI", to: "KWI", dur: 2,   price: 320, model: "Airbus A321neo" },
  ];
  const past: FlightDef[] = [];
  const gates = ["A1","A2","B1","B2","C1","D1"];
  let hNum = 600;
  // 3 flights per day × 180 days = 540 historical flights
  for (let d = 180; d >= 1; d--) {
    for (let r = 0; r < 3; r++) {
      const route = HIST_ROUTES[(hNum) % HIST_ROUTES.length];
      past.push({
        no: `HA${hNum++}`,
        from: route.from,
        to: route.to,
        dayOffset: -d,
        depHour: [6,9,13,16][hNum % 4],
        durationH: route.dur,
        price: route.price,
        status: "ARRIVED" as FlightStatus,
        gate: gates[hNum % gates.length],
        terminal: hNum % 2 === 0 ? "T1" : "T2",
        aircraftModel: route.model,
      });
    }
  }

  const future: FlightDef[] = [];
  // Generate 5 flights per day for the next 30 days
  for (let d = 0; d <= 30; d++) {
    for (let r = 0; r < 5; r++) {
      const route = HIST_ROUTES[(hNum) % HIST_ROUTES.length];
      const isRoundTrip = Math.random() < 0.3;
      future.push({
        no: `HA${hNum++}`,
        from: route.from,
        to: route.to,
        dayOffset: d,
        depHour: [5, 8, 12, 15, 20][hNum % 5],
        durationH: route.dur,
        price: route.price,
        status: "SCHEDULED" as FlightStatus,
        gate: gates[hNum % gates.length],
        terminal: hNum % 2 === 0 ? "T1" : "T2",
        aircraftModel: route.model,
        isRoundTrip,
        returnDayOffset: isRoundTrip ? d + Math.floor(Math.random() * 10) + 2 : undefined,
        returnHour: isRoundTrip ? 10 + Math.floor(Math.random() * 8) : undefined,
      });
    }
  }

  // Set some today's flights to different statuses for realism
  const todayFlights = future.filter(f => f.dayOffset === 0);
  if (todayFlights.length >= 5) {
    todayFlights[0].status = "ARRIVED";
    todayFlights[1].status = "DEPARTED";
    todayFlights[2].status = "BOARDING";
    todayFlights[3].status = "DELAYED";
  }

  return [
    ...past,
    ...future,
  ];
}

// ─── Seat generator (matches schema: Seat belongs to Aircraft) ─────────────
function generateSeatData(aircraftId: string, firstClass: number, business: number, economy: number) {
  const seats: Array<{
    aircraftId: string;
    seatNumber: string;
    class: SeatClass;
    isAisle: boolean;
    isWindow: boolean;
    extraPrice: number;
  }> = [];

  const COLS = ["A", "B", "C", "D", "E", "F"] as const;
  const totalRows = Math.ceil((firstClass + business + economy) / COLS.length);
  const firstRows = Math.ceil(firstClass / COLS.length);
  const bizRows = Math.ceil(business / COLS.length);

  for (let row = 1; row <= totalRows; row++) {
    for (const col of COLS) {
      let seatClass: SeatClass = "ECONOMY";
      let extraPrice = 0;

      if (row <= firstRows && firstClass > 0) {
        seatClass = "FIRST";
        extraPrice = 300;
      } else if (row <= firstRows + bizRows) {
        seatClass = "BUSINESS";
        extraPrice = 120;
      }

      const isWindow = col === "A" || col === "F";
      const isAisle = col === "C" || col === "D";

      seats.push({
        aircraftId,
        seatNumber: `${row}${col}`,
        class: seatClass,
        isAisle,
        isWindow,
        extraPrice,
      });
    }
  }
  return seats;
}

// ─── Passenger name pool ──────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Ahmed", "Mohamed", "Omar", "Ali", "Hassan", "Ibrahim", "Youssef",
  "Mahmoud", "Khaled", "Tariq", "Sara", "Nour", "Fatima", "Layla",
  "Amira", "James", "Emma", "William", "Charlotte", "Oliver",
  "Sophia", "Benjamin", "Isabella", "Lucas", "Mia", "Liam", "Noah",
  "Elijah", "Ava", "Diana", "Jean", "Pierre", "Marie", "Hans",
  "Anna", "Kenji", "Yuki", "Adam", "Sana", "Karim",
] as const;

const LAST_NAMES = [
  "Hassan", "Ibrahim", "Ali", "Mohamed", "Salem", "Khalil", "Nasser",
  "Farouk", "Mansour", "Abdel", "Smith", "Johnson", "Brown", "Taylor",
  "Anderson", "Wilson", "Garcia", "Martinez", "Lee", "Walker",
  "Dupont", "Bernard", "Müller", "Schmidt", "Fischer", "Tanaka", "Suzuki",
  "Yamamoto", "Wang", "Chen", "Kim", "Park", "Costa", "Rossi",
] as const;

const NATIONALITIES = [
  "Egyptian", "British", "French", "German", "American", "Saudi",
  "Emirati", "Qatari", "Turkish", "Italian", "Spanish", "Dutch",
  "Japanese", "Greek", "Kuwaiti",
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Helwan Airways — Comprehensive Seed (schema-aligned)\n");

  // ─── 1. Clear in dependency order ─────────────────────────────────────────
  console.log("🗑  Clearing old data…");
  await prisma.reservationHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.baggage.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.flightStatusHistory.deleteMany();
  await prisma.flightSchedule.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.aircraft.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.airport.deleteMany();
  console.log("   ✓ Cleared");

  // ─── 2. Airports ───────────────────────────────────────────────────────────
  console.log("🏢 Seeding airports…");
  const createdAirports = await Promise.all(
    AIRPORTS.map((a) =>
      prisma.airport.create({
        data: {
          iataCode: a.iataCode,
          airportName: a.airportName,
          city: a.city,
          country: a.country,
          timezone: a.timezone,
        },
      })
    )
  );
  const airportMap = new Map(createdAirports.map((a) => [a.iataCode, a.airportId]));
  console.log(`   ✓ ${createdAirports.length} airports`);

  // ─── 3. Staff ──────────────────────────────────────────────────────────────
  console.log("👷 Seeding staff…");
  const staffMembers = await Promise.all([
    prisma.staff.create({ data: { firstName: "Mona",   lastName: "Saeed",   email: "mona.saeed@helwan.air",   role: "ADMIN",      department: "Operations", isActive: true } }),
    prisma.staff.create({ data: { firstName: "Tarek",  lastName: "Khalil",  email: "tarek.khalil@helwan.air", role: "MANAGER",    department: "Flight Ops", isActive: true } }),
    prisma.staff.create({ data: { firstName: "Rania",  lastName: "Fawzy",   email: "rania.fawzy@gmail.com",  role: "AGENT",      department: "Reservations", isActive: true } }),
    prisma.staff.create({ data: { firstName: "Karim",  lastName: "Hassan",  email: "karim.hassan@helwan.air", role: "GATE_AGENT", department: "Ground Ops", isActive: true } }),
    prisma.staff.create({ data: { firstName: "Layla",  lastName: "Mostafa", email: "layla.mostafa@helwan.air",role: "PILOT",      department: "Flight Crew", isActive: true } }),
    prisma.staff.create({ data: { firstName: "Hassan", lastName: "Omar",    email: "hassan.omar@helwan.air",  role: "CABIN_CREW", department: "Cabin Services", isActive: true } }),
  ]);
  console.log(`   ✓ ${staffMembers.length} staff`);

  // ─── 4. Aircraft + Seats ───────────────────────────────────────────────────
  console.log("✈️  Seeding aircraft & seats…");
  const aircraftMap = new Map<string, { aircraftId: string; seats: { seatId: string; class: SeatClass; seatNumber: string }[] }>();

  for (const def of AIRCRAFT_DEFS) {
    const aircraft = await prisma.aircraft.create({
      data: {
        registrationNum: def.reg,
        model: def.model,
        manufacturer: def.manufacturer,
        totalSeats: def.total,
        firstClassSeats: def.first,
        businessSeats: def.business,
        economySeats: def.economy,
        status: "ACTIVE" as AircraftStatus,
      },
    });

    const seatData = generateSeatData(aircraft.aircraftId, def.first, def.business, def.economy);
    // Trim to exact total
    const trimmed = seatData.slice(0, def.total);
    await prisma.seat.createMany({ data: trimmed });

    const seats = await prisma.seat.findMany({
      where: { aircraftId: aircraft.aircraftId },
      select: { seatId: true, class: true, seatNumber: true },
    });

    aircraftMap.set(def.model, { aircraftId: aircraft.aircraftId, seats });
  }
  console.log(`   ✓ ${AIRCRAFT_DEFS.length} aircraft with full seat maps`);

  // ─── 5. Flights + Schedules ────────────────────────────────────────────────
  console.log("🛫 Seeding flights & schedules…");
  const now = new Date();
  now.setMinutes(0, 0, 0);

  const flightDefs = buildFlightDefs();

  // Build a round-robin model picker for flights without a specified model
  const FALLBACK_MODELS = AIRCRAFT_DEFS.map((a) => a.model);
  let modelRR = 0;

  // map: flightNumber → { flightId, aircraft, scheduleId }
  type CreatedFlight = {
    flightId: string;
    flightNumber: string;
    basePrice: any;
    status: FlightStatus;
    schedDeparture: Date;
    schedArrival: Date;
    aircraftId: string;
    seats: { seatId: string; class: SeatClass; seatNumber: string }[];
    scheduleId: string;
    gate: string | null;
    terminal: string | null;
  };

  const createdFlights: CreatedFlight[] = [];

  for (const fd of flightDefs) {
    const depAirportId = airportMap.get(fd.from);
    const arrAirportId = airportMap.get(fd.to);
    if (!depAirportId || !arrAirportId) continue;

    const baseDate = addDays(now, fd.dayOffset);
    baseDate.setHours(fd.depHour, 0, 0, 0);
    const depTime = baseDate;
    const arrTime = addHours(depTime, fd.durationH);

    // Pick model and aircraft
    const model = fd.aircraftModel ?? FALLBACK_MODELS[modelRR++ % FALLBACK_MODELS.length];
    const aircraftEntry = aircraftMap.get(model) ?? [...aircraftMap.values()][0];

    const flight = await prisma.flight.create({
      data: {
        flightNumber: fd.no,
        depAirportId,
        arrAirportId,
        aircraftId: aircraftEntry.aircraftId,
        schedDeparture: depTime,
        schedArrival: arrTime,
        isRoundTrip: fd.isRoundTrip ?? false,
        returnDate: fd.returnDayOffset !== undefined ? (() => {
          const rDate = addDays(now, fd.returnDayOffset);
          rDate.setHours(fd.returnHour ?? 12, 0, 0, 0);
          return rDate;
        })() : null,
        basePrice: fd.price,
        status: fd.status ?? "SCHEDULED",
        createdByStaff: staffMembers[1].staffId,
      },
    });

    // Create FlightSchedule for this flight instance
    const schedule = await prisma.flightSchedule.create({
      data: {
        flightId: flight.flightId,
        departureDate: depTime,
        scheduleStatus:
          fd.status === "CANCELLED"
            ? "CANCELLED"
            : fd.status === "ARRIVED" || fd.status === "DEPARTED"
            ? "COMPLETED"
            : fd.status === "DELAYED"
            ? "DELAYED"
            : "SCHEDULED",
        gate: fd.gate ?? null,
        terminal: fd.terminal ?? null,
      },
    });

    createdFlights.push({
      ...flight,
      aircraftId: aircraftEntry.aircraftId,
      seats: aircraftEntry.seats,
      scheduleId: schedule.scheduleId,
      gate: fd.gate ?? null,
      terminal: fd.terminal ?? null,
    });
  }

  console.log(`   ✓ ${createdFlights.length} flights with schedules`);

  // ─── 6. Passengers & Reservations ─────────────────────────────────────────
  console.log("🎫 Seeding passengers & reservations…");

  const reservationsData: any[] = [];
  const paymentsData: any[] = [];
  const baggagesData: any[] = [];
  const passengersData: any[] = [];

  let passengerIdx = 0;
  let reservationCount = 0;
  let baggageCounter = 1;
  let paymentCounter = 1;

  // Passengers created so far (to avoid duplicate email)
  const passengerEmailMap = new Map<string, string>(); // email → passengerId

  async function getOrCreatePassenger(overrides: {
    firstName: string;
    lastName: string;
    nationality?: string;
    email?: string;
    clerkUserId?: string;
  }) {
    passengerIdx++;
    const firstName = overrides.firstName;
    const lastName = overrides.lastName;
    const nationality = overrides.nationality ?? rand(NATIONALITIES);
    const email = overrides.email ?? `${firstName.toLowerCase()}.${lastName.toLowerCase()}${passengerIdx}@example.com`;

    if (passengerEmailMap.has(email)) {
      return passengerEmailMap.get(email)!;
    }

    const dob = new Date(
      1965 + Math.floor(Math.random() * 40),
      Math.floor(Math.random() * 12),
      1 + Math.floor(Math.random() * 28)
    );

    const passengerId = randomUUID();
    const p = {
      passengerId,
      firstName,
      lastName,
      email,
      phone: `+2010${Math.floor(10000000 + Math.random() * 89999999)}`,
      gender: Math.random() > 0.5 ? "MALE" : "FEMALE",
      dateOfBirth: dob,
      passportNum: `${nationality.substring(0, 2).toUpperCase()}${Math.floor(10000000 + Math.random() * 89999999)}`,
      nationality,
      clerkUserId: overrides.clerkUserId ?? null,
    };
    passengersData.push(p);
    passengerEmailMap.set(email, passengerId);
    return passengerId;
  }

  // Tracks used (flightId, seatId) to avoid re-booking same seat on same flight
  const usedSeats = new Set<string>(); // `${flightId}::${seatId}`

  function getAvailableSeats(
    flight: CreatedFlight,
    count: number,
    preferClass?: SeatClass
  ) {
    const pool = flight.seats.filter((s) => {
      const key = `${flight.flightId}::${s.seatId}`;
      if (usedSeats.has(key)) return false;
      if (preferClass) return s.class === preferClass;
      return true;
    });
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  async function createReservation(opts: {
    clerkUserId: string;
    passengerId: string;
    flight: CreatedFlight;
    seat: { seatId: string; class: SeatClass } | null;
    status: ReservationStatus;
    checkInStatus?: CheckInStatus;
    boardingGroup?: string | null;
    specialReq?: string;
    basePrice: number;
    paymentDate?: Date;
  }) {
    const { clerkUserId, passengerId, flight, seat, status, checkInStatus, boardingGroup, specialReq, basePrice, paymentDate } = opts;
    const seatExtraPrice = seat?.class === "FIRST" ? 300 : seat?.class === "BUSINESS" ? 120 : 0;
    const totalAmount = basePrice + seatExtraPrice;

    const ref = bookingRef();
    const resId = randomUUID();
    const res = {
      reservationId: resId,
      bookingRef: ref,
      clerkUserId,
      passengerId,
      flightId: flight.flightId,
      scheduleId: flight.scheduleId,
      seatId: seat?.seatId ?? null,
      travelClass: seat?.class ?? "ECONOMY",
      totalAmount,
      status,
      specialReq: specialReq ?? null,
      checkInStatus: checkInStatus ?? "NOT_CHECKED_IN",
      boardingGroup: boardingGroup ?? null,
    };
    reservationsData.push(res);

    if (seat) {
      usedSeats.add(`${flight.flightId}::${seat.seatId}`);
    }

    // Create payment for confirmed/completed
    if (status === "CONFIRMED" || status === "COMPLETED") {
      const pDate = paymentDate ?? new Date();
      paymentsData.push({
        paymentId: randomUUID(),
        reservationId: resId,
        amount: totalAmount,
        paymentMethod: rand(["CREDIT_CARD", "DEBIT_CARD", "ONLINE", "BANK_TRANSFER"] as const) as PaymentMethod,
        status: "COMPLETED" as PaymentStatus,
        transactRef: `TXN${String(paymentCounter++).padStart(10, "0")}`,
        paymentDate: pDate,
        createdAt: pDate,
      });
    }

    // Add baggage for 60% of confirmed passengers
    if ((status === "CONFIRMED" || status === "COMPLETED") && Math.random() < 0.6) {
      baggagesData.push({
        baggageId: randomUUID(),
        reservationId: resId,
        baggageType: Math.random() < 0.2 ? ("CARRY_ON" as BaggageType) : ("CHECKED" as BaggageType),
        weightKg: +(15 + Math.random() * 18).toFixed(1),
        status: (status === "COMPLETED" ? "DELIVERED" : "CHECKED_IN") as BaggageStatus,
        tag: `BG${String(baggageCounter++).padStart(8, "0")}`,
        fee: Math.random() < 0.3 ? +(Math.floor(Math.random() * 80) + 20) : 0,
      });
    }

    reservationCount++;
    return res;
  }

  // ── Demo Clerk User IDs (you set your real Clerk user ID here) ─────────────
  const DEMO_CLERK_IDS = [
    "user_2abc123def456ghi789jkl",
    "user_3mno456pqr789stu012vwx",
    "user_4yza789bcd012efg345hij",
    "user_5klm012nop345qrs678tuv",
    "user_6wxy345zab678cde901fgh",
  ];

  // ── Create the main demo passenger ─────────────────────────────────────────
  const demoPaxId = await getOrCreatePassenger({
    firstName: "Ahmed",
    lastName: "Hassan",
    nationality: "Egyptian",
    email: "ahmed.hassan.demo@example.com",
    clerkUserId: DEMO_CLERK_IDS[0],
  });

  // ── Demo user: past bookings ────────────────────────────────────────────────
  for (const flightNo of ["HA901", "HA902", "HA917", "HA907", "HA910"]) {
    const f = createdFlights.find((fl) => fl.flightNumber === flightNo);
    if (!f) continue;
    const preferClass: SeatClass = flightNo === "HA902" ? "BUSINESS" : "ECONOMY";
    const seatChoices = getAvailableSeats(f, 1, preferClass);
    if (!seatChoices[0]) continue;

    await createReservation({
      clerkUserId: DEMO_CLERK_IDS[0],
      passengerId: demoPaxId,
      flight: f,
      seat: seatChoices[0],
      status: "COMPLETED",
      checkInStatus: "CHECKED_IN",
      boardingGroup: "A",
      basePrice: Number(f.basePrice ?? 500),
    });
  }

  // ── Demo user: cancelled booking ────────────────────────────────────────────
  const cancelledFlight = createdFlights.find((f) => f.flightNumber === "HA998");
  if (cancelledFlight) {
    await createReservation({
      clerkUserId: DEMO_CLERK_IDS[0],
      passengerId: demoPaxId,
      flight: cancelledFlight,
      seat: null,
      status: "CANCELLED",
      basePrice: Number(cancelledFlight.basePrice ?? 945),
    });
  }

  // ── Demo user: upcoming bookings ────────────────────────────────────────────
  for (const flightNo of ["HA201", "HA202", "HA203"]) {
    const f = createdFlights.find((fl) => fl.flightNumber === flightNo);
    if (!f) continue;
    const preferClass: SeatClass = flightNo === "HA202" ? "FIRST" : "ECONOMY";
    const seatChoices = getAvailableSeats(f, 1, preferClass);
    if (!seatChoices[0]) continue;

    await createReservation({
      clerkUserId: DEMO_CLERK_IDS[0],
      passengerId: demoPaxId,
      flight: f,
      seat: seatChoices[0],
      status: "CONFIRMED",
      checkInStatus: "NOT_CHECKED_IN",
      basePrice: Number(f.basePrice ?? 500),
    });
  }

  // ── Bulk fill: past & today flights (40–80% occupancy) ────────────────────
  const flightsToFill = createdFlights.filter(
    (f) =>
      f.status === "ARRIVED" ||
      f.status === "DEPARTED" ||
      f.status === "BOARDING" ||
      f.status === "DELAYED" ||
      (f.status === "SCHEDULED" &&
        new Date(f.schedDeparture).toDateString() === new Date().toDateString())
  );

  for (const flight of flightsToFill) {
    // Fill FIRST seats (target ~20% of booked), then BUSINESS (~30%), then ECONOMY (~50%)
    const firstSeats  = getAvailableSeats(flight, flight.seats.length, "FIRST");
    const bizSeats    = getAvailableSeats(flight, flight.seats.length, "BUSINESS");
    const econSeats   = getAvailableSeats(flight, flight.seats.length, "ECONOMY");
    const fillRate    = 0.4 + Math.random() * 0.4;
    const toFill = [
      ...firstSeats.slice(0, Math.ceil(firstSeats.length * fillRate)),
      ...bizSeats.slice(0,   Math.ceil(bizSeats.length  * fillRate)),
      ...econSeats.slice(0,  Math.ceil(econSeats.length * fillRate)),
    ];

    const isPast = flight.status === "ARRIVED" || flight.status === "DEPARTED";
    const flightDate = new Date(flight.schedDeparture);

    let i = 0;
    while (i < toFill.length) {
      const groupSize = Math.min(1 + Math.floor(Math.random() * 3), toFill.length - i);
      const group = toFill.slice(i, i + groupSize);
      const clerkUserId = DEMO_CLERK_IDS[1 + Math.floor(Math.random() * (DEMO_CLERK_IDS.length - 1))];
      const paxId = await getOrCreatePassenger({ firstName: rand(FIRST_NAMES), lastName: rand(LAST_NAMES) });
      const status: ReservationStatus = isPast ? "COMPLETED" : "CONFIRMED";
      const checkIn: CheckInStatus =
        flight.status === "ARRIVED" || flight.status === "BOARDING"
          ? "CHECKED_IN"
          : Math.random() < 0.55 ? "CHECKED_IN" : "NOT_CHECKED_IN";

      for (const seat of group) {
        await createReservation({
          clerkUserId,
          passengerId: paxId,
          flight,
          seat,
          status,
          checkInStatus: checkIn,
          boardingGroup: checkIn === "CHECKED_IN" ? rand(["A", "B", "C", "D"] as const) : null,
          basePrice: Number(flight.basePrice ?? 400),
          paymentDate: flightDate,
        });
      }
      i += groupSize;
    }
  }

  // ── Bulk fill: future flights (15–35% advance bookings) ────────────────────
  const futureFlights = createdFlights.filter(
    (f) =>
      f.status === "SCHEDULED" &&
      new Date(f.schedDeparture) > new Date() &&
      new Date(f.schedDeparture).toDateString() !== new Date().toDateString()
  );

  for (const flight of futureFlights) {
    const allSeats = getAvailableSeats(flight, flight.seats.length);
    const fillCount = Math.floor(allSeats.length * (0.1 + Math.random() * 0.3));
    const toFill = allSeats.slice(0, fillCount);

    let i = 0;
    while (i < toFill.length) {
      const groupSize = Math.min(1 + Math.floor(Math.random() * 4), toFill.length - i);
      const group = toFill.slice(i, i + groupSize);

      const clerkUserId = DEMO_CLERK_IDS[Math.floor(Math.random() * DEMO_CLERK_IDS.length)];
      const paxFirst = rand(FIRST_NAMES);
      const paxLast = rand(LAST_NAMES);
      // No clerkUserId for bulk passengers — unique constraint
      const paxId = await getOrCreatePassenger({ firstName: paxFirst, lastName: paxLast });

      for (const seat of group) {
        await createReservation({
          clerkUserId,
          passengerId: paxId,
          flight,
          seat,
          status: "CONFIRMED",
          checkInStatus: "NOT_CHECKED_IN",
          basePrice: Number(flight.basePrice ?? 400),
        });
      }
      i += groupSize;
    }
  }

  // ─── Batch Inserts ─────────────────────────────────────────────────────────────
  console.log(`   📦 Batch inserting ${passengersData.length} passengers...`);
  const CHUNK_SIZE = 5000;
  for (let i = 0; i < passengersData.length; i += CHUNK_SIZE) {
    await prisma.passenger.createMany({ data: passengersData.slice(i, i + CHUNK_SIZE) });
  }
  
  console.log(`   📦 Batch inserting ${reservationsData.length} reservations...`);
  for (let i = 0; i < reservationsData.length; i += CHUNK_SIZE) {
    await prisma.reservation.createMany({ data: reservationsData.slice(i, i + CHUNK_SIZE) });
  }
  for (let i = 0; i < paymentsData.length; i += CHUNK_SIZE) {
    await prisma.payment.createMany({ data: paymentsData.slice(i, i + CHUNK_SIZE) });
  }
  for (let i = 0; i < baggagesData.length; i += CHUNK_SIZE) {
    await prisma.baggage.createMany({ data: baggagesData.slice(i, i + CHUNK_SIZE) });
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  const [airports, aircraft, seats, flights, schedules, passengers, reservations, payments, baggage] =
    await Promise.all([
      prisma.airport.count(),
      prisma.aircraft.count(),
      prisma.seat.count(),
      prisma.flight.count(),
      prisma.flightSchedule.count(),
      prisma.passenger.count(),
      prisma.reservation.count(),
      prisma.payment.count(),
      prisma.baggage.count(),
    ]);

  console.log("\n✅ Seeding complete!\n");
  console.log(`   🏢 Airports:      ${airports}`);
  console.log(`   🛩  Aircraft:      ${aircraft}`);
  console.log(`   💺 Seats:         ${seats}`);
  console.log(`   ✈️  Flights:       ${flights}`);
  console.log(`   📅 Schedules:     ${schedules}`);
  console.log(`   👤 Passengers:    ${passengers}`);
  console.log(`   🎫 Reservations:  ${reservations}`);
  console.log(`   💳 Payments:      ${payments}`);
  console.log(`   🧳 Baggage:       ${baggage}`);
  console.log(`\n   Demo Clerk User ID: ${DEMO_CLERK_IDS[0]}`);
  console.log("   Set this as your Clerk user's publicMetadata.role = 'staff' to access staff panel\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
