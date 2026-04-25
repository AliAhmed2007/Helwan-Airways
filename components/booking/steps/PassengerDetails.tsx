"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CompleteBookingValues } from "@/lib/schemas/booking";
import { cn } from "@/lib/utils";

const NATIONALITIES = [
  "Egyptian", "Emirati", "British", "American", "French", "German",
  "Turkish", "Saudi Arabian", "Qatari", "Dutch", "Other",
];

interface PassengerDetailsProps {
  form: UseFormReturn<CompleteBookingValues>;
  maxPassengers: number;
}

export function PassengerDetails({ form, maxPassengers }: PassengerDetailsProps) {
  const { register, formState: { errors }, control, setValue } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "passengers",
  });

  const addPassenger = () => {
    if (fields.length < maxPassengers) {
      append({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        passportNumber: "",
        nationality: "",
        email: "",
        phone: "",
      });

      const currentSeats = form.getValues("seatAssignments") || [];
      form.setValue("seatAssignments", [
        ...currentSeats,
        { passengerId: currentSeats.length, seatId: "", seatNumber: "" },
      ]);

      const currentBaggage = form.getValues("baggageInfo") || [];
      form.setValue("baggageInfo", [
        ...currentBaggage,
        { passengerId: currentBaggage.length, checkedBags: 0, mealPreference: "NONE" },
      ]);
    }
  };

  const removePassenger = (index: number) => {
    remove(index);

    const currentSeats = form.getValues("seatAssignments") || [];
    const newSeats = currentSeats
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, passengerId: i }));
    form.setValue("seatAssignments", newSeats);

    const currentBaggage = form.getValues("baggageInfo") || [];
    const newBaggage = currentBaggage
      .filter((_, i) => i !== index)
      .map((b, i) => ({ ...b, passengerId: i }));
    form.setValue("baggageInfo", newBaggage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Passenger Details</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Enter information as it appears on the passport
          </p>
        </div>
        {fields.length < maxPassengers && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5"
            onClick={addPassenger}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Add Passenger
          </Button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {fields.map((field, index) => {
          const passengerErrors = errors.passengers?.[index];
          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              layout
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">
                    {index === 0 ? "Primary Passenger" : `Passenger ${index + 1}`}
                  </h3>
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removePassenger(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <Input
                    {...register(`passengers.${index}.firstName`)}
                    placeholder="John"
                    className={cn(
                      "rounded-xl",
                      passengerErrors?.firstName && "border-destructive"
                    )}
                    id={`passenger-${index}-firstName`}
                  />
                  {passengerErrors?.firstName && (
                    <p className="text-xs text-destructive">{passengerErrors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <Input
                    {...register(`passengers.${index}.lastName`)}
                    placeholder="Doe"
                    className={cn(
                      "rounded-xl",
                      passengerErrors?.lastName && "border-destructive"
                    )}
                    id={`passenger-${index}-lastName`}
                  />
                  {passengerErrors?.lastName && (
                    <p className="text-xs text-destructive">{passengerErrors.lastName.message}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                  <Input
                    type="date"
                    {...register(`passengers.${index}.dateOfBirth`)}
                    className={cn(
                      "rounded-xl",
                      passengerErrors?.dateOfBirth && "border-destructive"
                    )}
                    id={`passenger-${index}-dob`}
                  />
                  {passengerErrors?.dateOfBirth && (
                    <p className="text-xs text-destructive">{passengerErrors.dateOfBirth.message}</p>
                  )}
                </div>

                {/* Passport Number */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Passport Number</Label>
                  <Input
                    {...register(`passengers.${index}.passportNumber`)}
                    placeholder="A12345678"
                    className={cn(
                      "rounded-xl font-mono uppercase",
                      passengerErrors?.passportNumber && "border-destructive"
                    )}
                    id={`passenger-${index}-passport`}
                  />
                  {passengerErrors?.passportNumber && (
                    <p className="text-xs text-destructive">{passengerErrors.passportNumber.message}</p>
                  )}
                </div>

                {/* Nationality */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nationality</Label>
                  <Select
                    onValueChange={(val: string | null) =>
                      setValue(`passengers.${index}.nationality`, val ?? "")
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        "rounded-xl",
                        passengerErrors?.nationality && "border-destructive"
                      )}
                      id={`passenger-${index}-nationality`}
                    >
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {passengerErrors?.nationality && (
                    <p className="text-xs text-destructive">{passengerErrors.nationality.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <Input
                    type="email"
                    {...register(`passengers.${index}.email`)}
                    placeholder="john@example.com"
                    className={cn(
                      "rounded-xl",
                      passengerErrors?.email && "border-destructive"
                    )}
                    id={`passenger-${index}-email`}
                  />
                  {passengerErrors?.email && (
                    <p className="text-xs text-destructive">{passengerErrors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Phone Number</Label>
                  <Input
                    type="tel"
                    {...register(`passengers.${index}.phone`)}
                    placeholder="+20 123 456 7890"
                    className={cn(
                      "rounded-xl",
                      passengerErrors?.phone && "border-destructive"
                    )}
                    id={`passenger-${index}-phone`}
                  />
                  {passengerErrors?.phone && (
                    <p className="text-xs text-destructive">{passengerErrors.phone.message}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
