import { getStaffAirports } from "@/lib/actions/staff";
import { AirportsClient } from "./AirportsClient";
import { KpiCard } from "@/components/staff/KpiCard";
import { MapPin } from "lucide-react";

export const metadata = {
  title: "Airports — Helwan Airways Staff",
};

export default async function StaffAirportsPage() {
  const result = await getStaffAirports();
  const airports = result.success ? result.data : [];

  const total = airports.length;
  const countries = new Set(airports.map((a) => a.country)).size;
  const totalDepartures = airports.reduce((acc, a) => acc + a._count.departingFlights, 0);
  const totalArrivals = airports.reduce((acc, a) => acc + a._count.arrivingFlights, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Airports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage airports in the network
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <MapPin className="h-4 w-4" />
          <span className="text-sm font-medium">{total} Airports</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Airports" numericValue={total} sub="In the network" icon="map" color="bg-blue-500/10 text-blue-500" index={0} />
        <KpiCard label="Countries" numericValue={countries} sub="Unique countries" icon="plane" color="bg-emerald-500/10 text-emerald-500" index={1} />
        <KpiCard label="Total Departures" numericValue={totalDepartures} sub="Outbound flights" icon="ontime" color="bg-violet-500/10 text-violet-500" index={2} />
        <KpiCard label="Total Arrivals" numericValue={totalArrivals} sub="Inbound flights" icon="checkCircle" color="bg-amber-500/10 text-amber-500" index={3} />
      </div>

      <AirportsClient data={airports as never} />
    </div>
  );
}
