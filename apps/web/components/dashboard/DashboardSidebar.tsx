"use client";

import { FolderOpen, House, LogOut, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePanelStore } from "@/store/panelStore";
import { Button } from "../ui/button";

export default function DashboardSidebar() {
  const isSidebarOpen = usePanelStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = usePanelStore((state) => state.setIsSidebarOpen);

  return (
    <>
      <div
        className={` ${isSidebarOpen ? "fixed block" : "hidden"} bg-sidebar text-sidebar-foreground top-0 left-0 z-50 mt-13 h-full w-full max-w-[230px] min-w-[50px] border px-3 py-4 md:relative md:my-0 md:block md:w-full md:rounded-none md:border-none md:py-0`}
      >
        <div className="flex items-center justify-end">
          <Button
            size="icon"
            variant="ghost"
            onClick={setIsSidebarOpen}
            className="flex items-center justify-center"
          >
            <X className="block md:hidden" size={16} />
          </Button>
        </div>
        <div className="flex w-full flex-col justify-between gap-4">
          <div className="space-y-4">
            <Link
              href="/home"
              className="hover:bg-accent hover:text-accent-foreground flex items-center justify-start gap-2 rounded-md px-4 py-2 font-semibold hover:cursor-pointer"
            >
              <House size={24} />
              <span>Home</span>
            </Link>
            <Link
              href="/projects"
              className="hover:bg-accent hover:text-accent-foreground flex items-center justify-start gap-2 rounded-md px-4 py-2 font-semibold hover:cursor-pointer"
            >
              <FolderOpen size={24} />
              Projects
            </Link>
            <Link
              href="/settings"
              className="hover:bg-accent hover:text-accent-foreground flex items-center justify-start gap-2 rounded-md px-4 py-2 font-semibold hover:cursor-pointer"
            >
              <Settings size={24} />
              Settings
            </Link>
          </div>
          <div className="w-full">
            <Button
              variant="outline"
              className="flex w-full items-center justify-center gap-3"
            >
              Logout
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
