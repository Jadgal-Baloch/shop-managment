"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Inventory", path: "/inventory" },
  { name: "Add Item", path: "/add-item" },
  { name: "Sell", path: "/sell" },
  { name: "History", path: "/history" },
  { name: "View Reports", path: "/report" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          🛒 Shop Manager
        </Link>

        {/* Links */}
        <div className="flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`hover:underline ${
                pathname === link.path ? "font-bold underline" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
