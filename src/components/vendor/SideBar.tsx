"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChartArea,
  Cog,
  DollarSign,
  House,
  Package,
  ShoppingCart,
  Star,
  Users,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const vendorNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/vendor",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/vendor/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
  },
  {
    title: "Analytics",
    href: "/vendor/analytics",
    icon: ChartArea,
  },
  {
    title: "Withdraw",
    href: "/vendor/withdraw",
    icon: DollarSign,
  },
  {
    title: "Customers",
    href: "/vendor/customers",
    icon: Users,
  },
  {
    title: "Reviews",
    href: "/vendor/reviews",
    icon: Star,
  },
  {
    title: "Settings",
    href: "/vendor/settings",
    icon: Cog,
  },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b">
        <Link
          href="/vendor"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <House className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Vendor Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {vendorNavItems.map((item, index) => {
            // Exact match for dashboard, starts with for others
            const isActive =
              item.href === "/vendor"
                ? pathname === "/vendor"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
