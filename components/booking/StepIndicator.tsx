"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { id: 1, label: "Passengers", description: "Passenger details" },
  { id: 2, label: "Seats", description: "Select your seats" },
  { id: 3, label: "Checkout", description: "Baggage & payment" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="relative flex items-center justify-between w-full max-w-md mx-auto">
      {/* Connecting line */}
      <div className="absolute left-0 right-0 top-4 h-px bg-border/60 -z-0" />
      <motion.div
        className="absolute left-0 top-4 h-px bg-primary -z-0"
        initial={{ width: "0%" }}
        animate={{
          width:
            currentStep === 1
              ? "0%"
              : currentStep === 2
              ? "50%"
              : "100%",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />

      {STEPS.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex flex-col items-center gap-2 z-10">
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors duration-300",
                isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : isActive
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                step.id
              )}
            </motion.div>
            <div className="text-center hidden sm:block">
              <div
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
