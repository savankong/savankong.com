import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import ScrollWatcher from "@/components/ScrollWatcher";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
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
    "Savanrith “Savan” Kong — award-winning executive, the Department of Defense's first Customer Experience Officer, author of Laid Off and Lost, and host of Life Between Titles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${inter.variable}`}>
        <ScrollWatcher />
        {children}
      </body>
    </html>
  );
}
