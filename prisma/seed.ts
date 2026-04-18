import { PrismaClient, FlightStatus, SeatClass, SeatStatus } from "../lib/generated/prisma";

const prisma = new PrismaClient();

const AIRPORTS = [
  { iataCode: "CAI", name: "Cairo International Airport", city: "Cairo", country: "Egypt", timezone: "Africa/Cairo" },
  { iataCode: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", timezone: "Asia/Dubai" },
  { iataCode: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom", timezone: "Europe/London" },
  { iataCode: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", timezone: "Europe/Paris" },
  { iataCode: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", timezone: "America/New_York" },
  { iataCode: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul" },
  { iataCode: "DOH", name: "Hamad International Airport", city: "Doha", country: "Qatar", timezone: "Asia/Qatar" },
  { iataCode: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
  { iataCode: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", timezone: "Europe/Berlin" },
  { iataCode: "HRG", name: "Hurghada International Airport", city: "Hurghada", country: "Egypt", timezone: "Africa/Cairo" },
  { iataCode: "SSH", name: "Sharm El-Sheikh Airport", city: "Sharm El-Sheikh", country: "Egypt", timezone: "Africa/Cairo" },
  { iataCode: "RUH", name: "King Khalid International Airport", city: "Riyadh", country: "Saudi Arabia", timezone: "Asia/Riyadh" },
];

function generateSeats(flightId: string) {
  const seats = [];
  const columns = ["A", "B", "C", "D", "E", "F"];
  
  for (let row = 1; row <= 30; row++) {
    for (const col of columns) {
      let seatClass: SeatClass = "ECONOMY";
      let extraPrice = 0;
      
      if (row <= 2) {
        seatClass = "FIRST";
        extraPrice = 150;
      } else if (row <= 6) {
        seatClass = "BUSINESS";
        extraPrice = 75;
      }

      // Randomly occupy ~40% of seats
      const isOccupied = Math.random() < 0.4;
      
      seats.push({
        flightId,
        seatNumber: `${row}${col}`,
        row,
        column: col,
        class: seatClass,
        status: isOccupied ? ("OCCUPIED" as SeatStatus) : ("AVAILABLE" as SeatStatus),
        extraPrice,
      });
    }
  }
  return seats;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.bookingPassenger.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.airport.deleteMany();

  // Create airports
  const createdAirports = await Promise.all(
    AIRPORTS.map((a) => prisma.airport.create({ data: a }))
  );

  const airportMap = Object.fromEntries(
    createdAirports.map((a) => [a.iataCode, a.id])
  );

  const now = new Date();
  const addHours = (date: Date, h: number) =>
    new Date(date.getTime() + h * 3600000);
  const addDays = (date: Date, d: number) =>
    new Date(date.getTime() + d * 86400000);

  // Define flights
  const flightsData = [
    // Today's flights
    { flightNumber: "HA101", from: "CAI", to: "DXB", dep: addHours(now, 2), arr: addHours(now, 5), price: 420, status: "BOARDING" as FlightStatus, gate: "B12" },
    { flightNumber: "HA102", from: "CAI", to: "LHR", dep: addHours(now, 4), arr: addHours(now, 11), price: 680, status: "SCHEDULED" as FlightStatus, gate: "A7" },
    { flightNumber: "HA103", from: "DXB", to: "CAI", dep: addHours(now, 3), arr: addHours(now, 6), price: 390, status: "DELAYED" as FlightStatus, gate: "C4" },
    { flightNumber: "HA104", from: "LHR", to: "CAI", dep: addHours(now, 6), arr: addHours(now, 13), price: 710, status: "SCHEDULED" as FlightStatus, gate: "D9" },
    { flightNumber: "HA105", from: "CAI", to: "IST", dep: addHours(now, 1), arr: addHours(now, 4), price: 310, status: "DEPARTED" as FlightStatus, gate: "B3" },
    { flightNumber: "HA106", from: "CAI", to: "CDG", dep: addHours(now, 8), arr: addHours(now, 15), price: 590, status: "SCHEDULED" as FlightStatus, gate: "A2" },
    { flightNumber: "HA107", from: "DOH", to: "CAI", dep: addHours(now, 5), arr: addHours(now, 8), price: 450, status: "SCHEDULED" as FlightStatus, gate: "F1" },
    { flightNumber: "HA108", from: "CAI", to: "RUH", dep: addHours(now, 7), arr: addHours(now, 10), price: 380, status: "BOARDING" as FlightStatus, gate: "B8" },
    
    // Tomorrow's flights
    { flightNumber: "HA201", from: "CAI", to: "DXB", dep: addDays(addHours(now, 2), 1), arr: addDays(addHours(now, 5), 1), price: 430, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA202", from: "CAI", to: "LHR", dep: addDays(addHours(now, 6), 1), arr: addDays(addHours(now, 13), 1), price: 720, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA203", from: "CAI", to: "JFK", dep: addDays(addHours(now, 3), 1), arr: addDays(addHours(now, 14), 1), price: 950, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA204", from: "IST", to: "CAI", dep: addDays(addHours(now, 4), 1), arr: addDays(addHours(now, 7), 1), price: 295, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA205", from: "CAI", to: "FRA", dep: addDays(addHours(now, 9), 1), arr: addDays(addHours(now, 15), 1), price: 560, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA206", from: "CAI", to: "AMS", dep: addDays(addHours(now, 7), 1), arr: addDays(addHours(now, 13), 1), price: 540, status: "SCHEDULED" as FlightStatus },
    
    // Day after
    { flightNumber: "HA301", from: "CAI", to: "DXB", dep: addDays(addHours(now, 2), 2), arr: addDays(addHours(now, 5), 2), price: 410, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA302", from: "CAI", to: "HRG", dep: addDays(addHours(now, 1), 2), arr: addDays(addHours(now, 2), 2), price: 120, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA303", from: "CAI", to: "SSH", dep: addDays(addHours(now, 3), 2), arr: addDays(addHours(now, 4), 2), price: 130, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA304", from: "DXB", to: "LHR", dep: addDays(addHours(now, 5), 2), arr: addDays(addHours(now, 13), 2), price: 580, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA305", from: "LHR", to: "JFK", dep: addDays(addHours(now, 8), 2), arr: addDays(addHours(now, 16), 2), price: 620, status: "SCHEDULED" as FlightStatus },
    { flightNumber: "HA306", from: "CAI", to: "DOH", dep: addDays(addHours(now, 10), 2), arr: addDays(addHours(now, 13), 2), price: 350, status: "SCHEDULED" as FlightStatus },
  ];

  // Create flights and their seats
  for (const fd of flightsData) {
    const flight = await prisma.flight.create({
      data: {
        flightNumber: fd.flightNumber,
        departureAirportId: airportMap[fd.from],
        arrivalAirportId: airportMap[fd.to],
        departureTime: fd.dep,
        arrivalTime: fd.arr,
        status: fd.status,
        basePrice: fd.price,
        totalSeats: 180,
        gate: fd.gate ?? null,
        terminal: fd.gate ? "T1" : null,
      },
    });

    const seats = generateSeats(flight.id);
    await prisma.seat.createMany({ data: seats });
  }

  console.log(`✅ Created ${flightsData.length} flights with seats`);
  console.log(`✅ Created ${AIRPORTS.length} airports`);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
