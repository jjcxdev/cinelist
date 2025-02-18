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
import { createClient } from "@/utils/supabase/client";

interface AuthFormProps {
  mode?: "sign-in" | "sign-up" | "invite";
  email?: string;
}

export default function AuthForm({
  mode = "sign-in",
  email = "",
}: AuthFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams.get("error");
  const success = searchParams.get("success");

  // If in invite mode, use the provided email
  const [emailState, setEmailState] = useState(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "invite") {
      if (password !== confirmPassword) {
        router.push("/auth/invite?error=Passwords do not match");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        router.push(`/auth/invite?error=${error.message}`);
        return;
      }

      router.push("/protected?success=Password set successfully");
    } else {
      const formData = new FormData();
      formData.append("email", emailState);
      formData.append("password", password);

      if (mode === "sign-in") {
        await signInAction(formData);
      } else {
        await signUpAction(formData);
      }
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {mode === "invite"
              ? "Set Your Password"
              : mode === "sign-in"
                ? "Sign in"
                : "Create an account"}
          </CardTitle>
          <CardDescription>
            {mode === "invite"
              ? "Please set a password for your account"
              : `Enter your email and password to ${mode === "sign-in" ? "sign in" : "create an account"}`}
          </CardDescription>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-500 text-sm">{success}</div>}
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={emailState}
                onChange={(e) => setEmailState(e.target.value)}
                disabled={mode === "invite"}
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
            {mode === "invite" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
            <Button type="submit" className="w-full">
              {mode === "invite"
                ? "Set Password"
                : mode === "sign-in"
                  ? "Sign in"
                  : "Sign up"}
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
            ) : mode === "sign-up" ? (
              <p>
                Already have an account?{" "}
                <Link href="/sign-in" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
