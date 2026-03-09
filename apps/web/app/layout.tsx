import type React from "react";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "RateMyGame — Calificá tus partidos de fútbol",
  description:
    "Creá un partido, compartí el link con tu equipo y que todos califiquen el rendimiento de cada jugador. Sin apps, sin registro obligatorio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" className={`dark ${inter.className}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
