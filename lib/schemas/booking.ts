import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Passenger Details
// ─────────────────────────────────────────────────────────────────────────────
export const PassengerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date < new Date();
    }, "Please enter a valid date of birth"),
  passportNumber: z
    .string()
    .min(6, "Passport number must be at least 6 characters")
    .max(20)
    .regex(/^[A-Z0-9]+$/i, "Passport number must be alphanumeric"),
  nationality: z.string().min(2, "Nationality is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+\d\s\-()]+$/, "Please enter a valid phone number"),
});

export type PassengerFormValues = z.infer<typeof PassengerSchema>;

export const PassengerDetailsStepSchema = z.object({
  passengers: z
    .array(PassengerSchema)
    .min(1, "At least one passenger is required"),
});

export type PassengerDetailsStepValues = z.infer<
  typeof PassengerDetailsStepSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Seat Selection
// ─────────────────────────────────────────────────────────────────────────────
export const SeatAssignmentSchema = z.object({
  passengerId: z.number(), // index in passengers array
  seatId: z.string().min(1, "Please select a seat"),
  seatNumber: z.string().min(1),
});

export const SeatSelectionStepSchema = z.object({
  seatAssignments: z
    .array(SeatAssignmentSchema)
    .min(1, "Please assign seats to all passengers"),
});

export type SeatSelectionStepValues = z.infer<typeof SeatSelectionStepSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Baggage & Extras
// ─────────────────────────────────────────────────────────────────────────────
export const MealPreferenceEnum = z.enum([
  "NONE",
  "VEGETARIAN",
  "VEGAN",
  "HALAL",
  "KOSHER",
]);

export const BaggagePassengerSchema = z.object({
  passengerId: z.number(),
  checkedBags: z
    .number()
    .min(0, "Minimum 0 bags")
    .max(3, "Maximum 3 checked bags"),
  mealPreference: MealPreferenceEnum,
});

export const BaggageStepSchema = z.object({
  baggageInfo: z.array(BaggagePassengerSchema),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({
      message: "You must agree to the terms and conditions to proceed",
    }),
  }),
});

export type BaggageStepValues = z.infer<typeof BaggageStepSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Complete Booking Form (combined across all steps)
// ─────────────────────────────────────────────────────────────────────────────
export const CompleteBookingSchema = PassengerDetailsStepSchema.merge(
  SeatSelectionStepSchema
).merge(BaggageStepSchema);

export type CompleteBookingValues = z.infer<typeof CompleteBookingSchema>;
