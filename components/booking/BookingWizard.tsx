"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { PassengerDetails } from "./steps/PassengerDetails";
import { SeatMap } from "./steps/SeatMap";
import { BaggageCheckout } from "./steps/BaggageCheckout";
import { CompleteBookingSchema, type CompleteBookingValues } from "@/lib/schemas/booking";
import { createBooking } from "@/lib/actions/bookings";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type Seat = {
  seatId: string;
  seatNumber: string;
  class: "FIRST" | "BUSINESS" | "ECONOMY";
  extraPrice: number;
  isOccupied: boolean;
};

interface BookingWizardProps {
  flightId: string;
  flightPrice: number;
  seats: Seat[];
  passengerCount: number;
}

const STEP_FIELDS: Record<number, (keyof CompleteBookingValues)[]> = {
  1: ["passengers"],
  2: ["seatAssignments"],
  3: ["baggageInfo", "agreeToTerms"],
};

export function BookingWizard({
  flightId,
  flightPrice,
  seats,
  passengerCount,
}: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CompleteBookingValues>({
    resolver: zodResolver(CompleteBookingSchema),
    mode: "onChange",
    defaultValues: {
      passengers: Array.from({ length: passengerCount }, () => ({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passportNumber: "",
        nationality: "",
        email: "",
        phone: "",
      })),
      seatAssignments: Array.from({ length: passengerCount }, (_, i) => ({
        passengerId: i,
        seatId: "",
        seatNumber: "",
      })),
      baggageInfo: Array.from({ length: passengerCount }, (_, i) => ({
        passengerId: i,
        checkedBags: 0,
        mealPreference: "NONE" as const,
      })),
      agreeToTerms: undefined,
    },
  });

  const { trigger, watch, getValues } = form;

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[step];
    const valid = await trigger(fieldsToValidate);
    if (!valid) return;

    // Extra check for step 2: all passengers must have a seat
    if (step === 2) {
      const assignments = getValues("seatAssignments");
      const allAssigned = assignments.every((a) => a.seatId);
      if (!allAssigned) {
        toast.error("Please select a seat for every passenger");
        return;
      }
    }

    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async (data: CompleteBookingValues) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Confirming your booking...");

    try {
      const result = await createBooking(flightId, data);

      if (!result.success) {
        toast.dismiss(loadingToast);
        toast.error(result.error ?? "Booking failed. Please try again.");
        return;
      }

      toast.dismiss(loadingToast);
      toast.success("Booking confirmed!", {
        description: `Your booking reference is ${result.data.bookingRef}`,
      });

      router.push(`/dashboard?booking=${result.data.reservationId}`);
    } catch {
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate seat extras
  const seatAssignments = watch("seatAssignments") ?? [];
  const seatExtras = seatAssignments.reduce((acc, assignment) => {
    if (!assignment.seatId) return acc;
    const seat = seats.find((s) => s.seatId === assignment.seatId);
    return acc + (seat ? Number(seat.extraPrice) : 0);
  }, 0);

  const passengers = watch("passengers") ?? [];

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content with slide animation */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {step === 1 && (
              <PassengerDetails form={form} maxPassengers={passengerCount} />
            )}
            {step === 2 && (
              <SeatMap
                seats={seats}
                form={form}
                passengerCount={passengerCount}
              />
            )}
            {step === 3 && (
              <BaggageCheckout
                form={form}
                flightPrice={flightPrice}
                passengers={passengers}
                seatExtras={seatExtras}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            className="gap-1.5 rounded-xl"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              className="gap-1.5 rounded-xl"
              onClick={handleNext}
              id={`booking-step-${step}-next`}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="gap-2 rounded-xl min-w-[140px]"
              disabled={isSubmitting}
              id="confirm-booking-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  Confirm Booking
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
