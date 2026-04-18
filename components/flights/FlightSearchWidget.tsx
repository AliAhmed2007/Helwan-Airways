"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Search, ArrowLeftRight, Users, Plane } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { FlightSearchSchema, type FlightSearchValues } from "@/lib/schemas/flight";
import { getAirports } from "@/lib/actions/flights";

type Airport = { id: string; iataCode: string; name: string; city: string; country: string };

export function FlightSearchWidget() {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [fromQuery, setFromQuery] = useState("");
  const [toQuery, setToQuery] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [selectedFrom, setSelectedFrom] = useState<Airport | null>(null);
  const [selectedTo, setSelectedTo] = useState<Airport | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FlightSearchValues>({
    resolver: zodResolver(FlightSearchSchema),
    defaultValues: {
      passengers: 1,
      tripType: "one-way",
    },
  });

  useEffect(() => {
    getAirports().then((res) => {
      if (res.success) setAirports(res.data);
    });
  }, []);

  const filteredFrom = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(fromQuery.toLowerCase()) ||
      a.iataCode.toLowerCase().includes(fromQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(fromQuery.toLowerCase())
  ).slice(0, 6);

  const filteredTo = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(toQuery.toLowerCase()) ||
      a.iataCode.toLowerCase().includes(toQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(toQuery.toLowerCase())
  ).slice(0, 6);

  const swapCities = () => {
    const prevFrom = selectedFrom;
    const prevTo = selectedTo;
    const prevFromQuery = fromQuery;
    const prevToQuery = toQuery;
    setSelectedFrom(prevTo);
    setSelectedTo(prevFrom);
    setFromQuery(prevToQuery);
    setToQuery(prevFromQuery);
    if (prevTo) setValue("fromIata", prevTo.iataCode);
    if (prevFrom) setValue("toIata", prevFrom.iataCode);
  };

  const onSubmit = (data: FlightSearchValues) => {
    const params = new URLSearchParams({
      from: data.fromIata,
      to: data.toIata,
      date: data.departureDate,
      passengers: String(data.passengers),
      tripType: data.tripType,
      ...(data.returnDate ? { returnDate: data.returnDate } : {}),
    });
    router.push(`/flights?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Trip type selector */}
      <div className="flex gap-2 mb-4">
        {(["one-way", "round-trip"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setTripType(type);
              setValue("tripType", type);
            }}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              tripType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {type === "one-way" ? "One Way" : "Round Trip"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-start">
        {/* From */}
        <div className="relative" ref={fromRef}>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">From</Label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 transition-shadow",
              errors.fromIata ? "border-destructive" : "border-border/60 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
            )}
          >
            <input
              type="text"
              value={fromQuery}
              onChange={(e) => {
                setFromQuery(e.target.value);
                setShowFromDropdown(true);
                if (!e.target.value) {
                  setSelectedFrom(null);
                  setValue("fromIata", "");
                }
              }}
              onFocus={() => setShowFromDropdown(true)}
              placeholder={selectedFrom ? `${selectedFrom.iataCode} — ${selectedFrom.city}` : "City or airport"}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Plane className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          {errors.fromIata && (
            <p className="text-xs text-destructive mt-1">{errors.fromIata.message}</p>
          )}
          <AnimatePresence>
            {showFromDropdown && filteredFrom.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border/60 rounded-xl shadow-lg overflow-hidden"
                onMouseDown={(e) => e.preventDefault()}
              >
                {filteredFrom.map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => {
                      setSelectedFrom(airport);
                      setFromQuery(`${airport.iataCode} — ${airport.city}`);
                      setValue("fromIata", airport.iataCode);
                      setShowFromDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium">{airport.city}</span>
                    <span className="text-xs text-muted-foreground font-mono">{airport.iataCode}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Swap button */}
        <div className="flex items-end pb-0.5">
          <button
            type="button"
            onClick={swapCities}
            className="mt-6 p-2.5 rounded-full border border-border/60 bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Swap departure and arrival"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        {/* To */}
        <div className="relative" ref={toRef}>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">To</Label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 transition-shadow",
              errors.toIata ? "border-destructive" : "border-border/60 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
            )}
          >
            <input
              type="text"
              value={toQuery}
              onChange={(e) => {
                setToQuery(e.target.value);
                setShowToDropdown(true);
                if (!e.target.value) {
                  setSelectedTo(null);
                  setValue("toIata", "");
                }
              }}
              onFocus={() => setShowToDropdown(true)}
              placeholder={selectedTo ? `${selectedTo.iataCode} — ${selectedTo.city}` : "City or airport"}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Plane className="h-4 w-4 text-muted-foreground shrink-0 rotate-90" />
          </div>
          {errors.toIata && (
            <p className="text-xs text-destructive mt-1">{errors.toIata.message}</p>
          )}
          <AnimatePresence>
            {showToDropdown && filteredTo.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border/60 rounded-xl shadow-lg overflow-hidden"
                onMouseDown={(e) => e.preventDefault()}
              >
                {filteredTo.map((airport) => (
                  <button
                    key={airport.id}
                    type="button"
                    onClick={() => {
                      setSelectedTo(airport);
                      setToQuery(`${airport.iataCode} — ${airport.city}`);
                      setValue("toIata", airport.iataCode);
                      setShowToDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium">{airport.city}</span>
                    <span className="text-xs text-muted-foreground font-mono">{airport.iataCode}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Date + Passengers row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Departure Date */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">Departure</Label>
          <Controller
            control={control}
            name="departureDate"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "w-full flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left bg-background transition-shadow",
                    errors.departureDate ? "border-destructive" : "border-border/60 hover:border-primary/50"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className={!field.value ? "text-muted-foreground" : ""}>
                    {field.value ? format(new Date(field.value), "dd MMM yyyy") : "Select date"}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.departureDate && (
            <p className="text-xs text-destructive mt-1">{errors.departureDate.message}</p>
          )}
        </div>

        {/* Return Date (round-trip only) */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">Return</Label>
          <Controller
            control={control}
            name="returnDate"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger
                  disabled={tripType === "one-way"}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm text-left bg-background transition-all",
                    tripType === "one-way" ? "opacity-40 cursor-not-allowed" : "border-border/60 hover:border-primary/50"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className={!field.value ? "text-muted-foreground" : ""}>
                    {field.value ? format(new Date(field.value), "dd MMM yyyy") : "Select date"}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        {/* Passengers */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">Passengers</Label>
          <div className={cn(
            "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5",
            errors.passengers ? "border-destructive" : "border-border/60 focus-within:border-primary/50"
          )}>
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="number"
              min={1}
              max={9}
              {...register("passengers", { valueAsNumber: true })}
              className="flex-1 bg-transparent text-sm outline-none w-full"
            />
          </div>
          {errors.passengers && (
            <p className="text-xs text-destructive mt-1">{errors.passengers.message}</p>
          )}
        </div>
      </div>

      {/* Search button */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full rounded-xl font-semibold gap-2"
        id="search-flights-btn"
      >
        <Search className="h-4 w-4" />
        {isSubmitting ? "Searching..." : "Search Flights"}
      </Button>
    </form>
  );
}
