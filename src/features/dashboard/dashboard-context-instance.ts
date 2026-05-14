import { createContext } from "react";
import type { DashboardAccess } from "@/features/dashboard/dashboard-access";

export const DashboardContext = createContext<DashboardAccess | null>(null);
