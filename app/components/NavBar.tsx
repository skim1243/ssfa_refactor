"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import Image from "next/image";

export type NavLink = {
  href: string;
  label: string;
  className?: string;
};

export type NavBarProps = {
  brandLogoSrc?: string;
  links?: NavLink[];
};

export default function NavBar({
  brandLogoSrc = "/SSFA-Logo.png",
  links = [
    { href: "/", label: "Home", className: "hover:bg-gray-100" },
    { href: "/donate", label: "Donate", className: "bg-[var(--color-yellow-light)] text-black hover:bg-[var(--color-yellow)]" },
    { href: "/apply", label: "Apply", className: "bg-[var(--color-blue-light)] text-black hover:bg-[var(--color-blue)]" },
    { href: "/about", label: "About", className: "hover:bg-gray-100" },
    { href: "/events", label: "Events", className: "hover:bg-gray-100" },
    { href: "/contact", label: "Contact", className: "hover:bg-gray-100" },
  ],
}: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full h-20 bg-white shadow-md">
      <div className="mx-auto flex h-full items-center justify-between px-8 sm:px-12">
        <div className="flex items-center gap-3 h-full">
          <Link href="/" className="text-base tracking-tight text-foreground h-full">
             <Image src={brandLogoSrc} alt="SSFA Logo" width={100} height={100} className="h-[100%] w-auto" />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`uppercase text-[16px] text-black font-sans transition-colors px-3 py-2 ${link.className || ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            {mobileOpen ? (
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3.75 5.25a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm0 6a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Zm.75 5.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-black/10 md:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <div className="grid gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base text-black font-sans transition-colors px-3 py-2 ${link.className || ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}


