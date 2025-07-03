import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col items-center gap-2 pt-32">
        <div className="text-destructive text-9xl font-bold">404</div>
        <div className="text-center text-2xl font-normal">Page Not Found</div>
        <Button variant="link" className="text-center">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
