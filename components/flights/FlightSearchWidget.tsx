"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Search, ArrowLeftRight, Users, Plane, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { FlightSearchSchema, type FlightSearchValues } from "@/lib/schemas/flight";
import { getAirports } from "@/lib/actions/flights";

type Airport = { airportId: string; iataCode: string; airportName: string; city: string; country: string };

interface FlightSearchWidgetProps {
  orientation?: "horizontal" | "vertical";
}

export function FlightSearchWidget({ orientation = "horizontal" }: FlightSearchWidgetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isVertical = orientation === "vertical";

  const updateUrlParams = (updates: Record<string, string | null>) => {
    if (pathname === "/flights") {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          if (params.has(key)) {
            params.delete(key);
            changed = true;
          }
        } else {
          if (params.get(key) !== value) {
            params.set(key, value);
            changed = true;
          }
        }
      });
      if (changed) {
        router.push(`/flights?${params.toString()}`, { scroll: false });
      }
    }
  };

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
    defaultValues: { passengers: 1, tripType: "one-way" },
  });

  // Load airports
  useEffect(() => {
    getAirports().then((res) => {
      if (res.success) {
        setAirports(res.data);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync from URL params whenever they or airports change
  useEffect(() => {
    if (airports.length === 0) return;

    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const dateParam = searchParams.get("date");
    const passengersParam = searchParams.get("passengers");
    const tripTypeParam = searchParams.get("tripType") as "one-way" | "round-trip" | null;

    if (fromParam) {
      const fromAirport = airports.find((a) => a.iataCode === fromParam.toUpperCase());
      if (fromAirport) {
        setSelectedFrom((prev) => {
          if (prev?.iataCode !== fromAirport.iataCode) {
            setFromQuery(`${fromAirport.iataCode} — ${fromAirport.city}`);
            setValue("fromIata", fromAirport.iataCode);
            return fromAirport;
          }
          return prev;
        });
      }
    } else {
      setSelectedFrom((prev) => {
        if (prev !== null) {
          setFromQuery("");
          setValue("fromIata", "");
        }
        return null;
      });
    }

    if (toParam) {
      const toAirport = airports.find((a) => a.iataCode === toParam.toUpperCase());
      if (toAirport) {
        setSelectedTo((prev) => {
          if (prev?.iataCode !== toAirport.iataCode) {
            setToQuery(`${toAirport.iataCode} — ${toAirport.city}`);
            setValue("toIata", toAirport.iataCode);
            return toAirport;
          }
          return prev;
        });
      }
    } else {
      setSelectedTo((prev) => {
        if (prev !== null) {
          setToQuery("");
          setValue("toIata", "");
        }
        return null;
      });
    }

    if (dateParam) setValue("departureDate", dateParam);

    if (passengersParam) {
      setValue("passengers", parseInt(passengersParam) || 1);
    } else {
      setValue("passengers", 1);
    }

    if (tripTypeParam) {
      setTripType(tripTypeParam);
      setValue("tripType", tripTypeParam);
    } else {
      setTripType("one-way");
      setValue("tripType", "one-way");
    }
  }, [searchParams, airports, setValue]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredFrom = airports
    .filter(
      (a) =>
        a.city.toLowerCase().includes(fromQuery.toLowerCase()) ||
        a.iataCode.toLowerCase().includes(fromQuery.toLowerCase()) ||
        a.airportName.toLowerCase().includes(fromQuery.toLowerCase())
    )
    .filter((a) => !selectedFrom || a.iataCode !== selectedFrom.iataCode);

  const filteredTo = airports
    .filter(
      (a) =>
        a.city.toLowerCase().includes(toQuery.toLowerCase()) ||
        a.iataCode.toLowerCase().includes(toQuery.toLowerCase()) ||
        a.airportName.toLowerCase().includes(toQuery.toLowerCase())
    )
    .filter((a) => !selectedTo || a.iataCode !== selectedTo.iataCode);

  const selectFrom = (airport: Airport) => {
    setSelectedFrom(airport);
    setFromQuery(`${airport.iataCode} — ${airport.city}`);
    setValue("fromIata", airport.iataCode);
    setShowFromDropdown(false);
    updateUrlParams({ from: airport.iataCode });
  };

  const selectTo = (airport: Airport) => {
    setSelectedTo(airport);
    setToQuery(`${airport.iataCode} — ${airport.city}`);
    setValue("toIata", airport.iataCode);
    setShowToDropdown(false);
    updateUrlParams({ to: airport.iataCode });
  };

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
    else setValue("fromIata", "");
    if (prevFrom) setValue("toIata", prevFrom.iataCode);
    else setValue("toIata", "");

    updateUrlParams({
      from: prevTo?.iataCode || null,
      to: prevFrom?.iataCode || null,
    });
  };

  const onSubmit = (data: FlightSearchValues) => {
    const params = new URLSearchParams({
      from: data.fromIata,
      to: data.toIata,
      passengers: String(data.passengers),
      tripType: data.tripType,
    });
    router.push(`/flights?${params.toString()}`);
  };

  const AirportDropdown = ({
    items,
    onSelect,
    show,
  }: {
    items: Airport[];
    onSelect: (a: Airport) => void;
    show: boolean;
  }) => (
    <AnimatePresence>
      {show && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border border-border/60 bg-popover shadow-xl max-h-64 overflow-y-auto overflow-x-hidden"
        >
          {items.map((airport) => (
            <button
              key={airport.airportId}
              type="button"
              onMouseDown={() => onSelect(airport)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                <MapPin className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">{airport.city}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {airport.airportName} · {airport.country}
                </div>
              </div>
              <span className="shrink-0 ml-auto font-mono text-xs font-bold text-foreground bg-muted rounded-md px-1.5 py-0.5">
                {airport.iataCode}
              </span>
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

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
              updateUrlParams({ tripType: type });
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

      {/* From / Swap / To Layout */}
      <div
        className={cn(
          "grid items-start relative",
          isVertical ? "grid-cols-1 gap-1" : "grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3"
        )}
      >
        {/* From */}
        <div className="relative z-20 mb-3" ref={fromRef}>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">
            From
          </Label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 transition-shadow",
              errors.fromIata
                ? "border-destructive"
                : "border-border/60 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
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
                  updateUrlParams({ from: null });
                }
              }}
              onFocus={() => setShowFromDropdown(true)}
              placeholder="City or airport"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Plane className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          {errors.fromIata && (
            <p className="text-xs text-destructive mt-1">{errors.fromIata.message}</p>
          )}
          <AirportDropdown
            items={filteredFrom}
            onSelect={selectFrom}
            show={showFromDropdown}
          />
        </div>

        {/* Swap button */}
        <div
          className={cn(
            "flex relative z-10",
            isVertical ? "justify-center -my-3" : "items-end pb-0.5"
          )}
        >
          <button
            type="button"
            onClick={swapCities}
            className={cn(
              "p-2.5 rounded-full border border-border/60 bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
              isVertical ? "rotate-90 shadow-sm" : "mt-6"
            )}
            aria-label="Swap departure and arrival"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        {/* To */}
        <div className="relative z-20" ref={toRef}>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">
            To
          </Label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 transition-shadow",
              errors.toIata
                ? "border-destructive"
                : "border-border/60 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20"
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
                  updateUrlParams({ to: null });
                }
              }}
              onFocus={() => setShowToDropdown(true)}
              placeholder="City or airport"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Plane className="h-4 w-4 text-muted-foreground shrink-0 rotate-90" />
          </div>
          {errors.toIata && (
            <p className="text-xs text-destructive mt-1">{errors.toIata.message}</p>
          )}
          <AirportDropdown
            items={filteredTo}
            onSelect={selectTo}
            show={showToDropdown}
          />
        </div>
      </div>

      {/* Passengers Layout */}
      <div
        className={cn(
          "grid gap-3 pt-2",
          isVertical ? "grid-cols-1" : "grid-cols-1"
        )}
      >

        {/* Passengers */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wide">
            Passengers
          </Label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5",
              errors.passengers
                ? "border-destructive"
                : "border-border/60 focus-within:border-primary/50"
            )}
          >
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="number"
              min={1}
              max={9}
              {...register("passengers", {
                valueAsNumber: true,
                onChange: (e) => updateUrlParams({ passengers: e.target.value }),
              })}
              className="flex-1 bg-transparent text-sm outline-none w-full"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full rounded-xl font-semibold gap-2 mt-2"
      >
        <Search className="h-4 w-4" />
        {isSubmitting ? "Searching..." : "Search Flights"}
      </Button>
    </form>
  );
}