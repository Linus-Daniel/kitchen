"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icons } from "../icons";
import { cn } from "@/lib/utils";
import { adminNavItems } from "@/constants/navigations";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-y-0 left-0 z-10 w-64 border-r border-gray-200 bg-white">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <Link href="/admin/" className="flex items-center gap-2">
          <motion.p 
              className="text-lg font-bold text-amber-600 flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="mr-1">🍔</span>
              <span>FoodExpress</span>
            </motion.p>
              <span>Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {adminNavItems.map((item, index) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = Icons[item.icon as keyof typeof Icons];
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <li>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-amber-500 text-primary-foreground"
                          : "hover:bg-amber-100 hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                      {item.count && (
                        <span className="ml-auto bg-primary/20 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  </li>
                </motion.div>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}