"use client";

import { usePanelStore } from "@/store/panelStore";
import HomeNav from "../HomeNav";
import Sidebar from "../Sidebar";

export default function DashboardLayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const isSidebarOpen = usePanelStore((state) => state.isSidebarOpen);

  return (
    <>
      <div className="bg-sidebar flex h-screen min-h-screen flex-col">
        <HomeNav />
        <div className="mb-2 flex h-full overflow-hidden">
          {isSidebarOpen && <Sidebar />}
          <main className="bg-background mx-2 h-full flex-1 overflow-y-auto rounded-sm border px-3 py-3">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
