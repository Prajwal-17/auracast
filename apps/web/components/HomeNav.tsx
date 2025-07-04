"use client"

import { Moon, SquarePlay, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function HomeNav() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className="px-7 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-2">
            <SquarePlay size={25} />
            <span className="text-foreground text-xl font-extrabold">
              Riverside
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hover:bg-muted rounded-full p-2 transition-colors"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </>
  );
}
