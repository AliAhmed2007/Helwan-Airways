"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import {
  seatColumns, baggageColumns,
  type SeatRow, type BaggageRow,
} from "./columns";

interface SeatsBaggageClientProps {
  seats: SeatRow[];
  baggage: BaggageRow[];
}

export function SeatsBaggageClient({ seats, baggage }: SeatsBaggageClientProps) {
  return (
    <Tabs defaultValue="seats" className="space-y-4">
      <TabsList className="bg-muted/50 rounded-xl">
        <TabsTrigger value="seats" className="rounded-lg text-sm">
          Seats <span className="ml-2 text-xs text-muted-foreground">({seats.length})</span>
        </TabsTrigger>
        <TabsTrigger value="baggage" className="rounded-lg text-sm">
          Baggage <span className="ml-2 text-xs text-muted-foreground">({baggage.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="seats">
        <DataTable
          columns={seatColumns}
          data={seats}
          searchKey="seatNumber"
          searchPlaceholder="Search seat number…"
          filters={[
            {
              columnId: "class",
              label: "Class",
              options: [
                { label: "First",    value: "FIRST" },
                { label: "Business", value: "BUSINESS" },
                { label: "Economy",  value: "ECONOMY" },
              ],
            },
          ]}
        />
      </TabsContent>

      <TabsContent value="baggage">
        <DataTable
          columns={baggageColumns}
          data={baggage}
          searchKey="tag"
          searchPlaceholder="Search baggage tag…"
          filters={[
            {
              columnId: "status",
              label: "Status",
              options: [
                { label: "Checked In",  value: "CHECKED_IN" },
                { label: "Loaded",      value: "LOADED" },
                { label: "In Transit",  value: "IN_TRANSIT" },
                { label: "Delivered",   value: "DELIVERED" },
                { label: "Lost",        value: "LOST" },
              ],
            },
            {
              columnId: "baggageType",
              label: "Type",
              options: [
                { label: "Checked",   value: "CHECKED" },
                { label: "Carry-on",  value: "CARRY_ON" },
                { label: "Oversized", value: "OVERSIZED" },
              ],
            },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}
