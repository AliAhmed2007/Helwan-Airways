"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelReservation } from "@/lib/actions/bookings";
import { Loader2, XCircle } from "lucide-react";

interface CancelBookingButtonProps {
  reservationId: string;
}

export function CancelBookingButton({ reservationId }: CancelBookingButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCancel = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }

    setPending(true);
    const result = await cancelReservation(reservationId);
    setPending(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to cancel booking.");
      setConfirmed(false);
      return;
    }

    toast.success("Booking cancelled", {
      description: "Your refund has been initiated.",
    });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      {confirmed && (
        <p className="text-xs text-destructive font-medium">Are you sure? This cannot be undone.</p>
      )}
      <Button
        variant={confirmed ? "destructive" : "outline"}
        size="sm"
        className="rounded-xl gap-1.5 shrink-0"
        onClick={handleCancel}
        disabled={pending}
        id="cancel-booking-btn"
        suppressHydrationWarning
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        {confirmed ? "Confirm Cancellation" : "Cancel Booking"}
      </Button>
    </div>
  );
}
