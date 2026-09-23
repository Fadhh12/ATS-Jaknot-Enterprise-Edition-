"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (pathname === "/login") return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface-alt">
        <div className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" aria-label="Loading" role="status" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main-content" className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-14 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
