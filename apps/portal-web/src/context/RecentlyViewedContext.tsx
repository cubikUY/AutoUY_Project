"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface RecentVehicle {
  id: string;
  title: string;
  image?: string;
  price: number;
  currency: string;
  brandName?: string;
  year?: number;
  mileage?: number;
}

interface RecentlyViewedContextType {
  recentItems: RecentVehicle[];
  addToRecentlyViewed: (vehicle: RecentVehicle) => void;
  clearHistory: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentItems, setRecentItems] = useState<RecentVehicle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("autouy_recent_history");
    if (saved) {
      try {
        setRecentItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("autouy_recent_history", JSON.stringify(recentItems));
    }
  }, [recentItems, isLoaded]);

  const addToRecentlyViewed = (vehicle: RecentVehicle) => {
    setRecentItems((prev) => {
      // Remove the car if it's already in the list (to move it to top)
      const filtered = prev.filter((i) => i.id !== vehicle.id);
      // Limit to 8 items
      const newList = [vehicle, ...filtered].slice(0, 8);
      return newList;
    });
  };

  const clearHistory = () => {
    setRecentItems([]);
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentItems,
        addToRecentlyViewed,
        clearHistory,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
