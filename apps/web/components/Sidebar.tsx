"use client";

import { FolderOpen, House, LogOut, Settings } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Sidebar() {
  return (
    <>
      <div className="bg-sidebar text-sidebar-foreground flex h-full w-full max-w-[230px] px-3 py-4">
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
