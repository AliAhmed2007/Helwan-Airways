import { getStaffFlights, getStaffSchedules, getStaffStatusHistory } from "@/lib/actions/staff";
import { FlightsClient } from "./FlightsClient";
import { KpiCard } from "@/components/staff/KpiCard";
import { Plane } from "lucide-react";

export const metadata = {
  title: "Flights — Helwan Airways Staff",
};

export default async function StaffFlightsPage() {
  const [flightsRes, schedulesRes, historyRes] = await Promise.all([
    getStaffFlights(),
    getStaffSchedules(),
    getStaffStatusHistory(),
  ]);

  const flights = flightsRes.success ? flightsRes.data : [];
  const schedules = schedulesRes.success ? schedulesRes.data : [];
  const statusHistory = historyRes.success ? historyRes.data : [];

  const totalFlights = flights.length;
  const activeFlights = flights.filter((f) =>
    ["SCHEDULED", "BOARDING", "DEPARTED"].includes(f.status)
  ).length;
  const delayedFlights = flights.filter((f) => f.status === "DELAYED").length;
  const cancelledFlights = flights.filter((f) => f.status === "CANCELLED").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Flights</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage flights, schedules and status history
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Plane className="h-4 w-4" />
          <span className="text-sm font-medium">{totalFlights} Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Flights" numericValue={totalFlights} sub="In system" icon="plane" color="bg-blue-500/10 text-blue-500" index={0} />
        <KpiCard label="Active" numericValue={activeFlights} sub="Scheduled or boarding" icon="ontime" color="bg-emerald-500/10 text-emerald-500" index={1} />
        <KpiCard label="Delayed" numericValue={delayedFlights} sub="Requires attention" icon="delayed" color="bg-amber-500/10 text-amber-500" index={2} />
        <KpiCard label="Cancelled" numericValue={cancelledFlights} sub="This period" icon="xCircle" color="bg-red-500/10 text-red-500" index={3} />
      </div>

      <FlightsClient
        flights={flights as never}
        schedules={schedules as never}
        statusHistory={statusHistory as never}
      />
    </div>
  );
}
