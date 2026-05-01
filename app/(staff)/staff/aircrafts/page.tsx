import { getStaffAircrafts } from "@/lib/actions/staff";
import { AircraftsClient } from "./AircraftsClient";
import { KpiCard } from "@/components/staff/KpiCard";
import { Building2 } from "lucide-react";

export const metadata = {
  title: "Aircrafts — Helwan Airways Staff",
};

export default async function StaffAircraftsPage() {
  const result = await getStaffAircrafts();
  const aircrafts = result.success ? result.data : [];

  const total = aircrafts.length;
  const active = aircrafts.filter((a) => a.status === "ACTIVE").length;
  const maintenance = aircrafts.filter((a) => a.status === "MAINTENANCE").length;
  const totalSeats = aircrafts.reduce((acc, a) => acc + a.totalSeats, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aircrafts</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage fleet aircraft and capacity
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">{total} Fleet</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Aircraft" numericValue={total} sub="In fleet" icon="plane" color="bg-blue-500/10 text-blue-500" index={0} />
        <KpiCard label="Active" numericValue={active} sub="Operational" icon="checkCircle" color="bg-emerald-500/10 text-emerald-500" index={1} />
        <KpiCard label="Maintenance" numericValue={maintenance} sub="Under service" icon="delayed" color="bg-amber-500/10 text-amber-500" index={2} />
        <KpiCard label="Total Capacity" numericValue={totalSeats} sub="Seats across fleet" icon="passengers" color="bg-violet-500/10 text-violet-500" index={3} />
      </div>

      <AircraftsClient data={aircrafts as never} />
    </div>
  );
}
