import { getStaffReservations, getStaffReservationHistory } from "@/lib/actions/staff";
import { ReservationsClient } from "./ReservationsClient";
import { KpiCard } from "@/components/staff/KpiCard";
import { CalendarCheck } from "lucide-react";

export const metadata = {
  title: "Reservations — Helwan Airways Staff",
};

export default async function StaffReservationsPage() {
  const [reservationsRes, historyRes] = await Promise.all([
    getStaffReservations(),
    getStaffReservationHistory(),
  ]);

  const reservations = reservationsRes.success ? reservationsRes.data : [];
  const history = historyRes.success ? historyRes.data : [];

  const total = reservations.length;
  const confirmed = reservations.filter((r) => r.status === "CONFIRMED").length;
  const cancelled = reservations.filter((r) => r.status === "CANCELLED").length;
  const totalRevenue = reservations
    .filter((r) => r.status !== "CANCELLED")
    .reduce((acc, r) => acc + Number(r.totalAmount), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage bookings, status changes and reservation history
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <CalendarCheck className="h-4 w-4" />
          <span className="text-sm font-medium">{total} Total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Reservations" numericValue={total} sub="All time" icon="calendar" color="bg-blue-500/10 text-blue-500" index={0} />
        <KpiCard label="Confirmed" numericValue={confirmed} sub="Active bookings" icon="checkCircle" color="bg-emerald-500/10 text-emerald-500" index={1} />
        <KpiCard label="Cancelled" numericValue={cancelled} sub="Cancelled bookings" icon="xCircle" color="bg-red-500/10 text-red-500" index={2} />
        <KpiCard label="Total Revenue" numericValue={totalRevenue} prefix="$" sub="Non-cancelled bookings" icon="revenue" color="bg-amber-500/10 text-amber-500" index={3} />
      </div>

      <ReservationsClient reservations={reservations as never} history={history as never} />
    </div>
  );
}
