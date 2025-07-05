"use client";

import { Button } from "@/components/ui/button";
import { usePanelStore } from "@/store/panelStore";
import { PanelLeft } from "lucide-react";

export default function Projects() {
  const setIsSidebarOpen = usePanelStore((state) => state.setIsSidebarOpen);

  return (
    <>
      <div>
        <div>
          <Button
            onClick={setIsSidebarOpen}
            className="rounded-full"
            size="icon"
            variant="ghost"
          >
            <PanelLeft size={8} />
          </Button>
        </div>
        <div>Projects</div>
      </div>
    </>
  );
}
