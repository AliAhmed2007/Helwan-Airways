import { getStaffSeats, getStaffBaggage } from "@/lib/actions/staff";
import { SeatsBaggageClient } from "./SeatsBaggageClient";
import { KpiCard } from "@/components/staff/KpiCard";
import { Armchair } from "lucide-react";

export const metadata = {
  title: "Seats & Baggage — Helwan Airways Staff",
};

export default async function StaffSeatsBaggagePage() {
  const [seatsRes, baggageRes] = await Promise.all([
    getStaffSeats(),
    getStaffBaggage(),
  ]);

  const seats = seatsRes.success ? seatsRes.data : [];
  const baggage = baggageRes.success ? baggageRes.data : [];

  const totalSeats = seats.length;
  const bookedSeats = seats.filter((s) => s._count.reservations > 0).length;
  const totalBaggage = baggage.length;
  const lostBaggage = baggage.filter((b) => b.status === "LOST").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seats & Baggage</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage aircraft seats and passenger baggage
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
          <Armchair className="h-4 w-4" />
          <span className="text-sm font-medium">{totalSeats} Seats</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Seats" numericValue={totalSeats} sub="Across all aircraft" icon="plane" color="bg-blue-500/10 text-blue-500" index={0} />
        <KpiCard label="Booked Seats" numericValue={bookedSeats} sub="Currently reserved" icon="checkCircle" color="bg-emerald-500/10 text-emerald-500" index={1} />
        <KpiCard label="Total Baggage" numericValue={totalBaggage} sub="Bags tracked" icon="package" color="bg-violet-500/10 text-violet-500" index={2} />
        <KpiCard label="Lost Baggage" numericValue={lostBaggage} sub="Requires investigation" icon="delayed" color="bg-red-500/10 text-red-500" index={3} />
      </div>

      <SeatsBaggageClient seats={seats as never} baggage={baggage as never} />
    </div>
  );
}
