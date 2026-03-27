"use client";

import { useEffect } from "react";
import { useRecentlyViewed, RecentVehicle } from "@/context/RecentlyViewedContext";

export default function RecentViewTracker({ vehicle }: { vehicle: RecentVehicle }) {
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (vehicle) {
      addToRecentlyViewed(vehicle);
    }
  }, [vehicle.id]); // Run once per vehicle ID

  return null; // Invisible component
}
