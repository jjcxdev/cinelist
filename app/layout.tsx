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
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
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
          <div className="mx-auto">
            {!isAuthPage && <HeaderAuth />}
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
