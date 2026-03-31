"use client";

import { DashboardToastProvider } from "@/components/dashboard/dashboard-toast";

export function DashboardProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardToastProvider>{children}</DashboardToastProvider>;
}
