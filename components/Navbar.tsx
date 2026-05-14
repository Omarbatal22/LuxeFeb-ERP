"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, Receipt, CreditCard, Tag, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/projects", label: "المشاريع", icon: Briefcase },
  { href: "/expenses", label: "سجل المصاريف", icon: Receipt },
  { href: "/payments", label: "سجل الدفعات", icon: CreditCard },
  { href: "/expense-types", label: "بنود الصرف", icon: Tag },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-primary-900 text-white sticky top-0 z-50 shadow-md border-b border-primary-800/50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-l from-white via-primary-100 to-primary-300">
            🪑 حسابات الأثاث
          </Link>
          <div className="hidden md:flex items-center gap-1.5">
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                    isActive
                      ? "bg-primary-700 text-white shadow-xs"
                      : "text-primary-100/80 hover:bg-primary-800/60 hover:text-white"
                  )}
                >
                  <l.icon size={18} className={isActive ? "text-primary-300" : "opacity-80"} />
                  {l.label}
                </Link>
              );
            })}
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-primary-800 text-primary-100" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-primary-950/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-1.5 border-t border-primary-800">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all",
                  isActive ? "bg-primary-800 text-white" : "text-primary-200 hover:bg-primary-900 text-white"
                )}
              >
                <l.icon size={20} className={isActive ? "text-primary-400" : "opacity-70"} />
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
