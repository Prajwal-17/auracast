"use client";

import { Button } from "@/components/ui/button";
import { usePanelStore } from "@/store/panelStore";
import { PanelLeft, Plus, UserPlus } from "lucide-react";

export default function Home() {
  const setIsSidebarOpen = usePanelStore((state) => state.setIsSidebarOpen);

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
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

          {/* Experience studio-grade video and audio, built for creators. */}
          {/* <div className="w-full text-center">
            Capture. Collaborate. Upload — all in studio quality.
          </div> */}
        </div>

        <div className="flex-1">
          <div className="flex flex-col items-center justify-center gap-5 py-24">
            <div className="flex w-full items-center justify-center gap-3">
              <Button
                variant="default"
                className="flex items-center justify-center gap-3 !px-14 py-7 text-sm font-semibold"
              >
                <Plus size={20} />
                Launch Studio
              </Button>
              <div className="text-muted-foreground">or</div>
              <Button
                variant="outline"
                className="px-10 py-6 text-sm font-semibold"
              >
                <UserPlus />
                Join Studio
              </Button>
            </div>
            <div>
              Start a new studio session and invite others, or join with a room
              code.
            </div>
          </div>
          <div>Recents</div>
        </div>
      </div>
    </>
  );
}
