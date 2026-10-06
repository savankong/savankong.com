import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import ScrollWatcher from "@/components/ScrollWatcher";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const inter = Instrument_Sans({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Savan Kong",
  description:
    "Savan Kong is CEO and co-founder of Your Roster, the network of government experts giving the human feedback that makes AI models work for government. He created Light-Lux and hosts Life Between Titles.",
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
