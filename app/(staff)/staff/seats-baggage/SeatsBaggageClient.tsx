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
          searchPlaceholder="Search seat number..."
        />
      </TabsContent>

      <TabsContent value="baggage">
        <DataTable
          columns={baggageColumns}
          data={baggage}
          searchKey="tag"
          searchPlaceholder="Search baggage tag..."
        />
      </TabsContent>
    </Tabs>
  );
}
