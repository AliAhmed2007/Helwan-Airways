import { getAllPassengers } from "@/lib/actions/passengers";
import { PassengersClient } from "./PassengersClient";
import { KpiCard } from "@/components/staff/KpiCard";
import { Users } from "lucide-react";

export const metadata = {
  title: "Passengers — Helwan Airways Staff",
};

export default async function StaffPassengersPage() {
  const result = await getAllPassengers();
  const passengers = result.success && result.data ? result.data : [];

  const totalPassengers = passengers.length;
  const recentBookings = passengers.filter(
    (p) => p.reservations && p.reservations.length > 0 && 
           new Date(p.reservations[0].createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;
  const topTravelers = passengers.filter(p => p._count.reservations >= 5).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Passengers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage passenger records and booking history
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">{totalPassengers} Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          label="Total Passengers"
          numericValue={totalPassengers}
          sub="Registered in the system"
          icon="passengers"
          color="bg-blue-500/10 text-blue-500"
          index={0}
        />
        <KpiCard
          label="Active This Month"
          numericValue={recentBookings}
          sub="Booked in the last 30 days"
          icon="calendar"
          color="bg-emerald-500/10 text-emerald-500"
          index={1}
        />
        <KpiCard
          label="Frequent Flyers"
          numericValue={topTravelers}
          sub="5+ total reservations"
          icon="checkCircle"
          color="bg-amber-500/10 text-amber-500"
          index={2}
        />
      </div>

      <PassengersClient data={passengers} />
    </div>
  );
}
