import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Shop Inventory",
  description: "Manage shop items, sales, and profit with Firebase + Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Global background & text color black */}
      <body className="bg-gray-50 text-black">
        <Navbar />
        <main className="container mx-auto mt-6">{children}</main>
      </body>
    </html>
  );
}
