"use client";

import { SessionProvider } from "next-auth/react";
import { CompareProvider } from "@/context/CompareContext";
import { RecentlyViewedProvider } from "@/context/RecentlyViewedContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CompareProvider>
        <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
      </CompareProvider>
    </SessionProvider>
  );
}
