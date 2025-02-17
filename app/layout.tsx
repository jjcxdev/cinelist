// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HeaderAuth from "@/components/header-auth"; // This is the correct component for auth links
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineList",
  description: "A simple movie/series tracking app.",
};

async function getSession() {
  const supabase = await createClient();
  return await supabase.auth.getSession();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await getSession();

  // Get the current pathname from headers
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container mx-auto gap-4 py-10">
          <HeaderAuth />
          {isAuthPage ? children : session ? children : <h1>Please sign in</h1>}
        </div>
      </body>
    </html>
  );
}
