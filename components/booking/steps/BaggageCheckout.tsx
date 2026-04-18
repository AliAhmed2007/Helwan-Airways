"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { Minus, Plus, Luggage, Utensils, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CompleteBookingValues } from "@/lib/schemas/booking";
import { cn } from "@/lib/utils";

const MEAL_OPTIONS = [
  { value: "NONE", label: "Standard Meal", description: "Chef's selection" },
  { value: "VEGETARIAN", label: "Vegetarian", description: "Plant-based menu" },
  { value: "VEGAN", label: "Vegan", description: "100% plant-based" },
  { value: "HALAL", label: "Halal", description: "Halal certified" },
  { value: "KOSHER", label: "Kosher", description: "Kosher certified" },
];

const BAG_PRICE_PER_BAG = 25;
const BASE_PRICE_PER_PERSON = 0; // Will be passed as prop

interface BaggageCheckoutProps {
  form: UseFormReturn<CompleteBookingValues>;
  flightPrice: number;
  passengers: { firstName: string; lastName: string }[];
  seatExtras: number;
}

export function BaggageCheckout({ form, flightPrice, passengers, seatExtras }: BaggageCheckoutProps) {
  const { control, watch, formState: { errors } } = form;
  const baggageInfo = watch("baggageInfo") ?? [];
  const agreeToTerms = watch("agreeToTerms");

  const subtotal = flightPrice * passengers.length;
  const baggageTotal = baggageInfo.reduce((acc, b) => acc + (b?.checkedBags ?? 0) * BAG_PRICE_PER_BAG, 0);
  const total = subtotal + baggageTotal + seatExtras;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Baggage & Checkout</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Choose your baggage allowance and meal preferences
        </p>
      </div>

      {/* Per-passenger baggage */}
      <div className="space-y-4">
        {passengers.map((passenger, index) => {
          const bags = baggageInfo[index]?.checkedBags ?? 0;
          const meal = baggageInfo[index]?.mealPreference ?? "NONE";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-border/50 bg-card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <span className="font-medium text-sm">
                  {passenger.firstName} {passenger.lastName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Checked Bags */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Luggage className="h-3.5 w-3.5" />
                    Checked Bags <span className="ml-auto">+${BAG_PRICE_PER_BAG}/bag</span>
                  </div>
                  <Controller
                    control={control}
                    name={`baggageInfo.${index}.checkedBags`}
                    render={({ field }) => (
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => field.onChange(Math.max(0, (field.value ?? 0) - 1))}
                          disabled={(field.value ?? 0) === 0}
                          id={`passenger-${index}-bags-decrease`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <motion.span
                          key={field.value}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className="w-6 text-center font-semibold tabular-nums"
                        >
                          {field.value ?? 0}
                        </motion.span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => field.onChange(Math.min(3, (field.value ?? 0) + 1))}
                          disabled={(field.value ?? 0) === 3}
                          id={`passenger-${index}-bags-increase`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          ${((field.value ?? 0) * BAG_PRICE_PER_BAG).toFixed(2)}
                        </span>
                      </div>
                    )}
                  />
                </div>

                {/* Meal Preference */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Utensils className="h-3.5 w-3.5" />
                    Meal Preference
                  </div>
                  <Controller
                    control={control}
                    name={`baggageInfo.${index}.mealPreference`}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "NONE"}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="rounded-xl text-sm"
                          id={`passenger-${index}-meal`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div>
                                <div className="font-medium text-sm">{opt.label}</div>
                                <div className="text-xs text-muted-foreground">{opt.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="rounded-2xl border border-border/50 bg-card p-5">
        <h3 className="font-semibold text-sm mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Base fare × {passengers.length} passenger{passengers.length > 1 ? "s" : ""}
            </span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {seatExtras > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seat upgrades</span>
              <span>${seatExtras.toFixed(2)}</span>
            </div>
          )}

          {baggageTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Checked bags</span>
              <span>${baggageTotal.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Taxes & fees</span>
            <span>Included</span>
          </div>

          <Separator className="my-2 opacity-50" />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {[
          { icon: Shield, text: "Secure payment" },
          { icon: CheckCircle2, text: "Instant confirmation" },
          { icon: Luggage, text: "Free cancellation within 24h" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5" />
            {text}
          </div>
        ))}
      </div>

      {/* Terms checkbox */}
      <Controller
        control={control}
        name="agreeToTerms"
        render={({ field }) => (
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={field.value === true}
              onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
              className="mt-0.5"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I agree to the{" "}
              <a href="#" className="text-foreground underline underline-offset-2">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-foreground underline underline-offset-2">
                Privacy Policy
              </a>
              . I confirm that all passenger details are correct.
            </Label>
          </div>
        )}
      />
      {errors.agreeToTerms && (
        <p className="text-xs text-destructive">{errors.agreeToTerms.message}</p>
      )}
    </div>
  );
}
