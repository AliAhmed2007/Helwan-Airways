"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CompleteBookingValues } from "@/lib/schemas/booking";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SeatClass = "FIRST" | "BUSINESS" | "ECONOMY";

type Seat = {
  seatId: string;
  seatNumber: string;
  class: SeatClass;
  extraPrice: number;
  isOccupied: boolean;
};

interface SeatMapProps {
  seats: Seat[];
  form: UseFormReturn<CompleteBookingValues>;
  passengerCount: number;
}

const CLASS_COLORS = {
  FIRST: {
    available: "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/60",
    selected: "bg-amber-500 border-amber-500 text-white",
    label: "First Class",
  },
  BUSINESS: {
    available: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/60",
    selected: "bg-blue-500 border-blue-500 text-white",
    label: "Business",
  },
  ECONOMY: {
    available: "bg-muted/50 border-border hover:bg-muted hover:border-primary/30",
    selected: "bg-primary border-primary text-primary-foreground",
    label: "Economy",
  },
};

const COLUMNS = ["A", "B", "C", "D", "E", "F"];

// Parse seatNumber like "3A" → { row: 3, col: "A" }
function parseSeat(seatNumber: string): { row: number; col: string } {
  const match = seatNumber.match(/^(\d+)([A-F])$/);
  if (!match) return { row: 0, col: "" };
  return { row: parseInt(match[1]), col: match[2] };
}

export function SeatMap({ seats, form, passengerCount }: SeatMapProps) {
  const { setValue, watch } = form;
  const seatAssignments = watch("seatAssignments") ?? [];

  // Build a lookup: "3A" → Seat
  const seatMap = new Map(seats.map((s) => [s.seatNumber, s]));

  // Derive grid dimensions from actual seats
  const rows = seats.reduce((max, s) => {
    const { row } = parseSeat(s.seatNumber);
    return Math.max(max, row);
  }, 0);

  // Selected seatIds
  const selectedSeatIds = seatAssignments.map((a) => a.seatId).filter(Boolean);

  const getPassengerForSeat = (seatId: string) =>
    seatAssignments.findIndex((a) => a.seatId === seatId);

  const nextPassengerIndex = seatAssignments.findIndex((a) => !a.seatId);

  const handleSeatClick = (seat: Seat) => {
    if (seat.isOccupied) return;

    const existingIndex = getPassengerForSeat(seat.seatId);
    if (existingIndex !== -1) {
      const updated = [...seatAssignments];
      updated[existingIndex] = { ...updated[existingIndex], seatId: "", seatNumber: "" };
      setValue("seatAssignments", updated, { shouldValidate: true });
      return;
    }

    if (selectedSeatIds.length >= passengerCount) return;

    const updated = [...seatAssignments];
    const targetIndex = nextPassengerIndex !== -1 ? nextPassengerIndex : 0;
    updated[targetIndex] = { passengerId: targetIndex, seatId: seat.seatId, seatNumber: seat.seatNumber };
    setValue("seatAssignments", updated, { shouldValidate: true });
  };

  const getSeatLabel = (seatId: string) => {
    const idx = getPassengerForSeat(seatId);
    return idx === -1 ? null : `P${idx + 1}`;
  };

  // Section headers
  const getSectionLabel = (row: number) => {
    // We check the first seat of this row to determine its class
    const firstSeat = COLUMNS.map((col) => seatMap.get(`${row}${col}`)).find(Boolean);
    if (!firstSeat) return null;
    return CLASS_COLORS[firstSeat.class].label;
  };

  // Determine section break rows (where class changes)
  const sectionBreaks = new Set<number>();
  let prevClass: SeatClass | null = null;
  for (let r = 1; r <= rows; r++) {
    const seat = COLUMNS.map((col) => seatMap.get(`${r}${col}`)).find(Boolean);
    if (!seat) continue;
    if (seat.class !== prevClass) {
      sectionBreaks.add(r);
      prevClass = seat.class;
    }
  }

  function renderSeatButton(rowNum: number, col: string) {
    const key = `${rowNum}${col}`;
    const seat = seatMap.get(key);
    if (!seat) return <div key={col} />;

    const isSelected = selectedSeatIds.includes(seat.seatId);
    const seatLabel = getSeatLabel(seat.seatId);
    const classes = CLASS_COLORS[seat.class];

    return (
      <Tooltip key={col}>
        <TooltipTrigger className="contents">
          <motion.button
            type="button"
            whileHover={!seat.isOccupied ? { scale: 1.1 } : undefined}
            whileTap={!seat.isOccupied ? { scale: 0.95 } : undefined}
            onClick={() => handleSeatClick(seat)}
            disabled={seat.isOccupied}
            className={cn(
              "h-7 w-full rounded border text-[10px] font-semibold transition-all duration-150",
              seat.isOccupied
                ? "bg-muted/30 border-border/30 cursor-not-allowed opacity-40"
                : isSelected
                ? classes.selected
                : classes.available
            )}
            aria-label={`Seat ${seat.seatNumber} ${seat.class}`}
          >
            {isSelected ? seatLabel : ""}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{seat.seatNumber} — {classes.label}</p>
          {seat.extraPrice > 0 && <p className="text-muted-foreground">+${seat.extraPrice}</p>}
          {seat.isOccupied && <p className="text-muted-foreground">Occupied</p>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Select Your Seats</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select {passengerCount} seat{passengerCount > 1 ? "s" : ""} for your party.{" "}
          {selectedSeatIds.filter(Boolean).length}/{passengerCount} selected.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        {Object.entries(CLASS_COLORS).map(([cls, colors]) => (
          <div key={cls} className="flex items-center gap-1.5">
            <div className={cn("w-5 h-5 rounded border", colors.available)} />
            <span className="text-muted-foreground">{colors.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border bg-muted-foreground/20 border-border" />
          <span className="text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded border bg-primary border-primary" />
          <span className="text-muted-foreground">Your seat</span>
        </div>
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[320px] max-w-[500px] mx-auto">
          {/* Column headers */}
          <div className="grid grid-cols-[40px_repeat(3,1fr)_8px_repeat(3,1fr)] gap-1 mb-2 text-xs text-muted-foreground text-center">
            <div />
            {["A", "B", "C"].map((col) => <div key={col} className="font-mono font-medium">{col}</div>)}
            <div />
            {["D", "E", "F"].map((col) => <div key={col} className="font-mono font-medium">{col}</div>)}
          </div>

          <div className="space-y-px">
            {Array.from({ length: rows }, (_, i) => i + 1).map((row) => (
              <div key={row}>
                {sectionBreaks.has(row) && (
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider my-2 ml-10 font-medium">
                    — {getSectionLabel(row)} —
                  </div>
                )}
                <div className="grid grid-cols-[40px_repeat(3,1fr)_8px_repeat(3,1fr)] gap-1 items-center">
                  <div className="text-xs text-muted-foreground font-mono text-right pr-1.5">{row}</div>
                  {["A", "B", "C"].map((col) => renderSeatButton(row, col))}
                  <div />
                  {["D", "E", "F"].map((col) => renderSeatButton(row, col))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected seats summary */}
      {seatAssignments.some((a) => a.seatId) && (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
          <h4 className="text-sm font-medium mb-2">Your Selections</h4>
          <div className="space-y-1">
            {seatAssignments.map((a, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Passenger {idx + 1}</span>
                <span className={a.seatId ? "font-mono font-medium" : "text-muted-foreground"}>
                  {a.seatNumber || "Not selected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
