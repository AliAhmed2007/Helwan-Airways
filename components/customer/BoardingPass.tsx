"use client";

import { useRef } from "react";
import { Plane, Clock, MapPin, User, Luggage, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type BoardingPassData = {
  bookingRef: string;
  passengerName: string;
  flightNumber: string;
  departureAirport: { iataCode: string; city: string; name: string };
  arrivalAirport: { iataCode: string; city: string; name: string };
  departureTime: Date | string;
  arrivalTime: Date | string;
  seatNumber: string;
  seatClass: string;
  gate: string | null;
  boardingGroup: string | null;
  checkInStatus: string;
};

interface BoardingPassProps {
  data: BoardingPassData;
}

const CLASS_LABELS: Record<string, string> = {
  FIRST: "First Class",
  BUSINESS: "Business",
  ECONOMY: "Economy",
};

export function BoardingPass({ data }: BoardingPassProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const dep = new Date(data.departureTime);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3">
      {/* The actual boarding pass card */}
      <div
        ref={printRef}
        className="rounded-2xl border border-border/50 bg-card overflow-hidden"
      >
        {/* Top strip */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Plane className="h-4 w-4 text-primary-foreground" />
            <span className="font-semibold text-primary-foreground text-sm tracking-wide">
              Helwan Airways
            </span>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium",
              data.checkInStatus === "CHECKED_IN"
                ? "bg-green-500/20 text-green-700 dark:text-green-400"
                : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
            )}
          >
            {data.checkInStatus === "CHECKED_IN" ? "Checked In" : "Pending Check-In"}
          </Badge>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Route */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-4xl font-bold tracking-tight">
                {data.departureAirport.iataCode}
              </div>
              <div className="text-sm text-muted-foreground">{data.departureAirport.city}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{format(dep, "HH:mm")}</div>
            </div>

            <div className="flex-1 flex flex-col items-center text-muted-foreground">
              <div className="text-xs mb-1">{data.flightNumber}</div>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-border" />
                <Plane className="h-3.5 w-3.5 rotate-90" />
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="text-xs mt-1">{format(dep, "dd MMM yyyy")}</div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold tracking-tight">
                {data.arrivalAirport.iataCode}
              </div>
              <div className="text-sm text-muted-foreground">{data.arrivalAirport.city}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(data.arrivalTime), "HH:mm")}
              </div>
            </div>
          </div>

          <Separator className="mb-4 opacity-40" />

          {/* Passenger details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Passenger</div>
              <div className="font-semibold text-sm leading-tight">{data.passengerName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Seat</div>
              <div className="font-semibold font-mono">{data.seatNumber || "—"}</div>
              <div className="text-xs text-muted-foreground">{CLASS_LABELS[data.seatClass] ?? data.seatClass}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Gate</div>
              <div className="font-semibold">{data.gate ?? "TBD"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Boarding</div>
              <div className="font-semibold">Group {data.boardingGroup ?? "—"}</div>
            </div>
          </div>

          <Separator className="my-4 border-dashed opacity-40" />

          {/* Bottom: booking ref + QR */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Booking Reference</div>
              <div className="font-mono font-bold text-lg tracking-widest">{data.bookingRef}</div>
            </div>

            {/* QR Code placeholder */}
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center border border-border/50">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Perforated tear line */}
        <div className="relative">
          <div className="absolute inset-x-0 top-0 border-t border-dashed border-border/60" />
          <div className="h-3 bg-muted/20 flex items-center justify-center text-[8px] text-muted-foreground/40 uppercase tracking-widest">
            · · · · · · · · · · · · · · · · · · · · · · · · ·
          </div>
        </div>

        {/* Stub */}
        <div className="px-6 py-3 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>{data.flightNumber} · {data.departureAirport.iataCode}→{data.arrivalAirport.iataCode}</span>
          <span className="font-mono">{data.seatNumber || "—"}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full rounded-xl gap-2"
        onClick={handlePrint}
        id="print-boarding-pass"
      >
        Print Boarding Pass
      </Button>
    </div>
  );
}
