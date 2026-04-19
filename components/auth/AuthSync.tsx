"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { syncUserRole } from "@/lib/actions/auth";
import { toast } from "sonner";

export function AuthSync() {
  const { user, isLoaded } = useUser();
  const syncing = useRef(false);

  useEffect(() => {
    // Only attempt sync if user is logged in but lacks a role assignment in publicMetadata
    if (isLoaded && user && !user.publicMetadata?.role && !syncing.current) {
      syncing.current = true;
      syncUserRole()
        .then((result) => {
          if (result.success) {
            // Role successfully attributed on the server - reload local cache to apply
            user.reload();
          } else {
            console.error("Auth sync failed:", result.error);
          }
        })
        .catch((error) => {
          console.error("Auth sync error:", error);
        })
        .finally(() => {
          syncing.current = false;
        });
    }
  }, [isLoaded, user]);

  return null;
}
