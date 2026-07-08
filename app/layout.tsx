import type { Metadata } from "next";
import { Anton, Inter, Lora } from "next/font/google";
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

const lora = Lora({
  variable: "--font-lora",
  weight: ["400", "500"],
  style: ["normal", "italic"],
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
      <body className={`${anton.variable} ${inter.variable} ${lora.variable}`}>
        {children}
      </body>
    </html>
  );
}
