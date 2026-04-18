"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { CompleteBookingValues } from "@/lib/schemas/booking";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SeatClass = "FIRST" | "BUSINESS" | "ECONOMY";
type SeatStatus = "AVAILABLE" | "OCCUPIED" | "BLOCKED";

type Seat = {
  id: string;
  seatNumber: string;
  row: number;
  column: string;
  class: SeatClass;
  status: SeatStatus;
  extraPrice: number | string;
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
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  BUSINESS: {
    available: "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/60",
    selected: "bg-blue-500 border-blue-500 text-white",
    label: "Business",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  ECONOMY: {
    available: "bg-muted/50 border-border hover:bg-muted hover:border-primary/30",
    selected: "bg-primary border-primary text-primary-foreground",
    label: "Economy",
    badge: "bg-muted text-muted-foreground",
  },
};

const COLUMNS = ["A", "B", "C", "D", "E", "F"];

export function SeatMap({ seats, form, passengerCount }: SeatMapProps) {
  const { setValue, watch, formState: { errors } } = form;
  const seatAssignments = watch("seatAssignments") ?? [];

  // Build seat lookup
  const seatMap = new Map(seats.map((s) => [`${s.row}${s.column}`, s]));

  // Track selected seat IDs
  const selectedSeatIds = seatAssignments.map((a) => a.seatId).filter(Boolean);

  // Find which passenger index owns which seat
  const getPassengerForSeat = (seatId: string) =>
    seatAssignments.findIndex((a) => a.seatId === seatId);

  // Next passenger who needs a seat
  const nextPassengerIndex = seatAssignments.findIndex((a) => !a.seatId);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "OCCUPIED" || seat.status === "BLOCKED") return;

    const existingIndex = getPassengerForSeat(seat.id);

    if (existingIndex !== -1) {
      // Deselect this seat
      const updated = [...seatAssignments];
      updated[existingIndex] = { ...updated[existingIndex], seatId: "", seatNumber: "" };
      setValue("seatAssignments", updated, { shouldValidate: true });
      return;
    }

    if (selectedSeatIds.length >= passengerCount) return;

    const updated = [...seatAssignments];
    const targetIndex = nextPassengerIndex !== -1 ? nextPassengerIndex : 0;
    updated[targetIndex] = {
      passengerId: targetIndex,
      seatId: seat.id,
      seatNumber: seat.seatNumber,
    };
    setValue("seatAssignments", updated, { shouldValidate: true });
  };

  // Group seats by row
  const rows = Array.from({ length: 30 }, (_, i) => i + 1);

  const getSeatLabel = (seatId: string) => {
    const idx = getPassengerForSeat(seatId);
    if (idx === -1) return null;
    return `P${idx + 1}`;
  };

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

      {/* Aircraft section labels */}
      <div className="overflow-x-auto">
        <div className="min-w-[320px] max-w-[500px] mx-auto">
          {/* Aisle indicators */}
          <div className="grid grid-cols-[40px_repeat(6,1fr)] gap-1 mb-2 text-xs text-muted-foreground text-center">
            <div />
            {COLUMNS.map((col) => (
              <div key={col} className="font-mono font-medium">
                {col}
              </div>
            ))}
          </div>

          {/* Class sections */}
          <div className="space-y-px">
            {rows.map((row) => {
              const isFirstClass = row <= 2;
              const isBusinessClass = row > 2 && row <= 6;
              const showSectionLabel =
                row === 1 || row === 3 || row === 7;

              return (
                <div key={row}>
                  {showSectionLabel && (
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider my-2 ml-10 font-medium">
                      {isFirstClass || row === 1
                        ? "— First Class —"
                        : row === 3
                        ? "— Business Class —"
                        : "— Economy Class —"}
                    </div>
                  )}
                  <div className="grid grid-cols-[40px_repeat(3,1fr)_8px_repeat(3,1fr)] gap-1 items-center">
                    <div className="text-xs text-muted-foreground font-mono text-right pr-1.5">
                      {row}
                    </div>
                    {/* Left 3 seats (A, B, C) */}
                    {["A", "B", "C"].map((col) => {
                      const seat = seatMap.get(`${row}${col}`);
                      if (!seat) return <div key={col} />;

                      const isOccupied = seat.status === "OCCUPIED" || seat.status === "BLOCKED";
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const seatLabel = getSeatLabel(seat.id);
                      const classes = CLASS_COLORS[seat.class];

                      return (
                        <Tooltip key={col}>
                          <TooltipTrigger
                            className="contents"
                          >
                            <motion.button
                              type="button"
                              whileHover={!isOccupied ? { scale: 1.1 } : undefined}
                              whileTap={!isOccupied ? { scale: 0.95 } : undefined}
                              onClick={() => handleSeatClick(seat)}
                              disabled={isOccupied}
                              className={cn(
                                "h-7 w-full rounded border text-[10px] font-semibold transition-all duration-150",
                                isOccupied
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
                            {Number(seat.extraPrice) > 0 && (
                              <p className="text-muted-foreground">+${seat.extraPrice}</p>
                            )}
                            {isOccupied && <p className="text-muted-foreground">Occupied</p>}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}

                    {/* Aisle */}
                    <div />

                    {/* Right 3 seats (D, E, F) */}
                    {["D", "E", "F"].map((col) => {
                      const seat = seatMap.get(`${row}${col}`);
                      if (!seat) return <div key={col} />;

                      const isOccupied = seat.status === "OCCUPIED" || seat.status === "BLOCKED";
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const seatLabel = getSeatLabel(seat.id);
                      const classes = CLASS_COLORS[seat.class];

                      return (
                        <Tooltip key={col}>
                          <TooltipTrigger className="contents">
                            <motion.button
                              type="button"
                              whileHover={!isOccupied ? { scale: 1.1 } : undefined}
                              whileTap={!isOccupied ? { scale: 0.95 } : undefined}
                              onClick={() => handleSeatClick(seat)}
                              disabled={isOccupied}
                              className={cn(
                                "h-7 w-full rounded border text-[10px] font-semibold transition-all duration-150",
                                isOccupied
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
                            {Number(seat.extraPrice) > 0 && (
                              <p className="text-muted-foreground">+${seat.extraPrice}</p>
                            )}
                            {isOccupied && <p className="text-muted-foreground">Occupied</p>}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
