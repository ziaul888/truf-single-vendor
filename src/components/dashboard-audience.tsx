"use client";

import { createContext, useContext } from "react";
import type { DashboardAudience } from "@/hooks/useMe";

const DashboardAudienceContext = createContext<DashboardAudience>("staff");

export function DashboardAudienceProvider({
  audience,
  children,
}: {
  audience: DashboardAudience;
  children: React.ReactNode;
}) {
  return (
    <DashboardAudienceContext.Provider value={audience}>
      {children}
    </DashboardAudienceContext.Provider>
  );
}

export const useDashboardAudience = () => useContext(DashboardAudienceContext);
