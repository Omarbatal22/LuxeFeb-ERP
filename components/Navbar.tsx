"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Receipt, CreditCard, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/projects", label: "المشاريع", icon: Briefcase },
  { href: "/expenses", label: "المصاريف", icon: Receipt },
  { href: "/payments", label: "الدفعات", icon: CreditCard },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-primary-700 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            🪑 حسابات الأثاث
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === l.href ? "bg-primary-600 text-white" : "text-primary-100 hover:bg-primary-600 hover:text-white"
                )}
              >
                <l.icon size={18} />
                {l.label}
              </Link>
            ))}
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-primary-800 px-4 pb-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                pathname === l.href ? "bg-primary-600" : "hover:bg-primary-700"
              )}
            >
              <l.icon size={18} />
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
