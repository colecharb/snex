import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hexagonal Snake",
  description: "Classic snake game on a hexagonal lattice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
