import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Flight Search
// ─────────────────────────────────────────────────────────────────────────────
export const FlightSearchSchema = z.object({
  fromIata: z
    .string()
    .length(3, "Please select a departure airport")
    .toUpperCase(),
  toIata: z
    .string()
    .length(3, "Please select an arrival airport")
    .toUpperCase(),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  passengers: z
    .number()
    .min(1, "At least 1 passenger")
    .max(9, "Maximum 9 passengers"),
  tripType: z.enum(["one-way", "round-trip"]),
});

export type FlightSearchValues = z.infer<typeof FlightSearchSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Staff: Flight Status Update
// ─────────────────────────────────────────────────────────────────────────────
export const FlightStatusUpdateSchema = z.object({
  flightId: z.string().min(1),
  status: z.enum([
    "SCHEDULED",
    "BOARDING",
    "DELAYED",
    "DEPARTED",
    "ARRIVED",
    "CANCELLED",
  ]),
  gate: z.string().optional(),
  terminal: z.string().optional(),
  delayReason: z.string().optional(),
});

export type FlightStatusUpdateValues = z.infer<typeof FlightStatusUpdateSchema>;
