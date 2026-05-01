"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import {
  reservationColumns, historyColumns,
  type ReservationRow, type ReservationHistoryRow,
} from "./columns";

interface ReservationsClientProps {
  reservations: ReservationRow[];
  history: ReservationHistoryRow[];
}

export function ReservationsClient({ reservations, history }: ReservationsClientProps) {
  return (
    <Tabs defaultValue="reservations" className="space-y-4">
      <TabsList className="bg-muted/50 rounded-xl">
        <TabsTrigger value="reservations" className="rounded-lg text-sm">
          Reservations <span className="ml-2 text-xs text-muted-foreground">({reservations.length})</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="rounded-lg text-sm">
          History <span className="ml-2 text-xs text-muted-foreground">({history.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="reservations">
        <DataTable
          columns={reservationColumns}
          data={reservations}
          searchKey="bookingRef"
          searchPlaceholder="Search booking reference..."
        />
      </TabsContent>

      <TabsContent value="history">
        <DataTable
          columns={historyColumns}
          data={history}
          searchKey="reason"
          searchPlaceholder="Search by reason..."
        />
      </TabsContent>
    </Tabs>
  );
}
