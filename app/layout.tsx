import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import ScrollWatcher from "@/components/ScrollWatcher";
import "./globals.css";

const display = Instrument_Serif({
  variable: "--font-display",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Savan Kong",
  description:
    "Savan Kong is CEO and co-founder of Your Roster, creator of Light-Lux, and host of the Life Between Titles podcast. Previously the Department of Defense's first Customer Experience Officer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${inter.variable}`}>
        <ScrollWatcher />
        {children}
      </body>
    </html>
  );
}
