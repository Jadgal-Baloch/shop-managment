"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { name: "Inventory", path: "/inventory" },
  { name: "Add Item", path: "/add-item" },
  { name: "Sell", path: "/sell" },
  { name: "History", path: "/history" },
  { name: "View Reports", path: "/report" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl sm:text-2xl font-bold hover:text-green-400 transition">
          🛒 Shop Manager
        </Link>

        {/* Hamburger Menu for Mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* Links */}
        <div
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-4 md:gap-6 absolute md:static top-16 left-0 w-full md:w-auto bg-gray-800 md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out z-10`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-base sm:text-lg hover:text-green-400 transition ${
                pathname === link.path ? "font-bold text-green-400 underline" : "text-gray-300"
              }`}
              onClick={() => setIsOpen(false)} // Close menu on link click
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}