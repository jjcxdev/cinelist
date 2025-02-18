// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderAuth from "@/components/header-auth"; // This is the correct component for auth links
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { Providers } from "@/components/providers";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineList",
  description: "A simple movie/series tracking app.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="container mx-auto gap-4 py-10">
            {!isAuthPage && <HeaderAuth />}
            {isAuthPage ? (
              children
            ) : user ? (
              children
            ) : (
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
                <Button asChild>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </div>
            )}
          </div>
        </Providers>
      </body>
    </html>
  );
}
