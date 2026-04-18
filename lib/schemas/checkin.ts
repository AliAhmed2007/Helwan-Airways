import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Passenger Check-In
// ─────────────────────────────────────────────────────────────────────────────
export const CheckInSchema = z.object({
  bookingPassengerId: z.string().min(1),
  boardingGroup: z.enum(["A", "B", "C", "D"]).optional(),
});

export type CheckInValues = z.infer<typeof CheckInSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Baggage Weight Update (staff)
// ─────────────────────────────────────────────────────────────────────────────
export const BaggageWeightSchema = z.object({
  bookingPassengerId: z.string().min(1),
  baggageWeight: z
    .number()
    .min(0, "Weight cannot be negative")
    .max(50, "Maximum baggage weight is 50kg"),
});

export type BaggageWeightValues = z.infer<typeof BaggageWeightSchema>;
