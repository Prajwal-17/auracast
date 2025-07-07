"use client";

import { AlignLeft, Moon, SquarePlay, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePanelStore } from "@/store/panelStore";
import { Button } from "../ui/button";

export default function LivePageNav() {
  const { theme, setTheme } = useTheme();
  const setIsSidebarOpen = usePanelStore((state) => state.setIsSidebarOpen);

  return (
    <>
      <div className="px-7 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <AlignLeft
              size={20}
              onClick={setIsSidebarOpen}
              className="block hover:cursor-pointer md:hidden"
            />
            <span className="mb-1 block text-center text-lg text-neutral-700 md:hidden lg:hidden">
              /
            </span>
            <SquarePlay size={19} />
            <span className="text-foreground text-lg font-extrabold">
              Auracast
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>
    </>
  );
}
