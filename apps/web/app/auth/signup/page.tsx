"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod/v4";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const signupSchema: z.ZodObject = z.object({
  name: z.string().min(3, { message: "Name must be atleast 3 characters" }),
  email: z.email({ message: "Email is invalid" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters" }),
});

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSignup() {
    setLoading(true);
    try {
      const validatedSchema = signupSchema.safeParse({
        name,
        email,
        password,
      });

      if (!validatedSchema.success) {
        const newErrors: { [key: string]: string } = {};
        validatedSchema.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          newErrors[field] = issue.message;
        });

        setFieldErrors(newErrors);
        setLoading(false);
        return;
      }

      const {
        email: validatedEmail,
        password: validatedPassword,
        name: validatedName,
      } = validatedSchema.data;

      const { data, error } = await authClient.signUp.email({
        email: validatedEmail as string,
        password: validatedPassword as string,
        name: validatedName as string,
      });

      if (data) {
        toast.success("Account creation successful");
        router.push("/");
      }

      if (error) {
        toast.error(error.message);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong");
      console.log("Sign up error", error);
    }
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen w-full items-center justify-center">
        <div className="bg-card text-card-foreground border-border mx-5 w-full max-w-sm rounded-xl px-6 py-5 shadow-2xl sm:mx-10 md:mx-auto md:max-w-md">
          <div className="mb-5">
            <div className="mb-2 w-full">
              <h2 className="text-3xl font-semibold">Create an account</h2>
            </div>
            <div className="text-muted-foreground text-md text-left">
              Enter your email below to create your account
            </div>
          </div>
          <div className="w-full space-y-5">
            <div className="group">
              <Button
                type="button"
                variant="outline"
                className="focus-visible:ring-background border-input flex w-full items-center justify-center rounded-3xl font-semibold group-hover:cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="2443"
                  height="2500"
                  preserveAspectRatio="xMidYMid"
                  viewBox="0 0 256 262"
                  id="google"
                >
                  <path
                    fill="#4285F4"
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                  ></path>
                  <path
                    fill="#EB4335"
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  ></path>
                </svg>
                Sign Up With Google
              </Button>
            </div>

            <div className="relative flex w-full items-center justify-center">
              <Separator className="text-muted-foreground" />
              <span className="bg-background text-muted-foreground absolute px-3 text-xs font-semibold">
                OR
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  disabled={loading}
                  placeholder="Rock"
                  type="text"
                  value={name}
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-background"
                  onChange={(e) => {
                    setName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, name: "" }));
                  }}
                />
                {fieldError.name && (
                  <div className="text-destructive my-0 flex items-center justify-start gap-1 px-3 text-xs font-medium">
                    <CircleAlert size={13} />
                    {fieldError.name}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  disabled={loading}
                  placeholder="m@example.com"
                  type="email"
                  value={email}
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-background"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                />
                {fieldError.email && (
                  <div className="text-destructive my-0 flex items-center justify-start gap-1 px-3 text-xs font-medium">
                    <CircleAlert size={13} />
                    {fieldError.email}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  disabled={loading}
                  type="password"
                  value={password}
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-background"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                />
                {fieldError.password && (
                  <div className="text-destructive my-0 flex items-center justify-start gap-1 px-3 text-xs font-medium">
                    <CircleAlert size={13} />
                    {fieldError.password}
                  </div>
                )}
              </div>
              <div className="mt-6">
                <Button
                  className="text-primary-foreground focus-visible:ring-background border-input w-full font-semibold hover:cursor-pointer"
                  disabled={loading}
                  type="submit"
                  variant="default"
                  onClick={handleSignup}
                >
                  {loading && (
                    <LoaderCircle size={14} className="animate-spin" />
                  )}
                  {loading ? "Creating Account ..." : "Create Account"}
                </Button>
              </div>
              <div className="text-muted-foreground text-center text-sm font-medium">
                Already have an account?
                <Link className="text-blue-500" href="/auth/signin">
                  {"  "}
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
