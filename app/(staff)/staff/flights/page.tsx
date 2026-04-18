import { getAllFlights } from "@/lib/actions/flights";
import { FlightsTable } from "@/components/staff/FlightsTable";
import { Plane } from "lucide-react";

export const metadata = {
  title: "Flight Management — Helwan Airways Staff",
};

export default async function StaffFlightsPage() {
  const result = await getAllFlights();
  const flights = result.success ? result.data : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flight Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {flights.length} flights scheduled · Update status and view manifests
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plane className="h-4 w-4" />
          <span className="text-sm font-medium">{flights.length} flights</span>
        </div>
      </div>

      <FlightsTable
        flights={flights.map((f) => ({
          ...f,
          departureTime: f.departureTime.toISOString(),
          arrivalTime: f.arrivalTime.toISOString(),
          _count: {
            bookings: f._count.bookings ?? 0,
          },
        }))}
      />
    </div>
  );
}
