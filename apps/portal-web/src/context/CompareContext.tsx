"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompareVehicle {
  id: string;
  title: string;
  image?: string;
  price: number;
  currency: string;
}

interface CompareContextType {
  items: CompareVehicle[];
  addToCompare: (vehicle: CompareVehicle) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareVehicle[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("autouy_compare");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse compare items", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("autouy_compare", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCompare = (vehicle: CompareVehicle) => {
    if (items.find((i) => i.id === vehicle.id)) return false;
    if (items.length >= 3) {
      return false;
    }
    setItems((prev) => [...prev, vehicle]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCompare = () => {
    setItems([]);
  };

  const isInCompare = (id: string) => {
    return items.some((i) => i.id === id);
  };

  return (
    <CompareContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
