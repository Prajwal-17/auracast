"use client";

import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";

export default function Home() {
  return (
    <>
      <div>
        <div className="mb-4 w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-4 text-white shadow-lg md:mb-8 md:rounded-xl md:px-8 md:py-6">
          <div className="text-center">
            <p className="text-md font-semibold tracking-wide md:text-lg">
              Capture. Collaborate. Upload — all in studio quality.
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="mx-4 flex flex-col items-center justify-center gap-4 py-9 md:py-14">
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-center">
              <Button className="md:text-md flex w-full items-center justify-center gap-5 px-9 py-7 text-lg font-semibold hover:cursor-pointer md:w-auto">
                <span>
                  <Plus />
                </span>
                <span>Launch Studio</span>
              </Button>

              <span className="text-muted-foreground hidden text-sm md:block">
                or
              </span>

              <Button
                variant="outline"
                className="md:text-md flex w-full items-center justify-center gap-5 px-9 py-7 text-lg font-semibold hover:cursor-pointer md:w-auto"
              >
                <span>
                  <UserPlus />
                </span>
                <span>Join Studio</span>
              </Button>
            </div>

            <div className="text-muted-foreground space-y-2 px-4 py-2 text-center text-xs font-medium sm:text-sm md:py-4">
              <p>
                Launch a new studio session and invite others to collaborate.
              </p>
              <p>Or join an existing studio with a session ID.</p>
            </div>
          </div>

          <div>
            <div className="text-lg font-semibold">Recents</div>
          </div>
        </div>
      </div>
    </>
  );
}
