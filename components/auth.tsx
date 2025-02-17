// src/components/AuthForm.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInAction, signUpAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

interface AuthFormProps {
  mode?: "sign-in" | "sign-up";
}

export default function AuthForm({ mode = "sign-in" }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get("error");
  const success = searchParams.get("success");

  const handleSubmit = async (formData: FormData) => {
    if (mode === "sign-in") {
      await signInAction(formData);
    } else {
      await signUpAction(formData);
    }
    router.refresh();
    //No need to route as we route after the forms are complete
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {mode === "sign-in" ? "Sign in" : "Create an account"}
          </CardTitle>
          <CardDescription>
            Enter your email and password to{" "}
            {mode === "sign-in" ? "sign in" : "create an account"}
          </CardDescription>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              {mode === "sign-in" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {mode === "sign-in" ? (
              <p>
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Link href="/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
