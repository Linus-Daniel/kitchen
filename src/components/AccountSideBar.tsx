// components/AccountSideBar.jsx
"use client";

import { useAuth } from "@/hooks/useAuth";
import {
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";

const navItems = [
  { href: "/account", icon: FiUser, label: "Dashboard" },
  { href: "/account/orders", icon: FiClock, label: "My Orders" },
  { href: "/account/addresses", icon: FiMapPin, label: "Addresses" },
  { href: "/account/payment", icon: FiCreditCard, label: "Payment Methods" },
];

export const AccountSidebar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    setIsMobileMenuOpen(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pathname]);

  const UserAvatar = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => (
    <div className={clsx(
      "bg-amber-100 rounded-full flex items-center justify-center text-amber-600",
      size === "sm" && "w-8 h-8",
      size === "md" && "w-10 h-10",
      size === "lg" && "w-12 h-12"
    )}>
      <FiUser size={size === "sm" ? 16 : 20} />
    </div>
  );

  const NavLink = ({ href, icon: Icon, label }: typeof navItems[0]) => (
    <Link
      href={href}
      className={clsx(
        "flex items-center p-3 rounded-lg font-medium transition",
        pathname === href
          ? "text-amber-600 bg-amber-50"
          : "text-gray-600 hover:bg-gray-50"
      )}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Icon className="mr-3" />
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white border-b sticky top-0 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center text-gray-700 space-x-2"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle Account Menu"
        >
          {isMobileMenuOpen ? (
            <FiX size={24} className="text-amber-600" />
          ) : (
            <FiMenu size={24} />
          )}
          <span className="font-medium">Menu</span>
        </button>
        <div className="flex items-center">
          <UserAvatar size="sm" />
          <span className="text-sm font-medium truncate max-w-[120px] ml-2">
            {user?.name}
          </span>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed h-full bg-white rounded-xl shadow-sm p-6 w-64">
        <div className="flex items-center mb-6">
          <UserAvatar size="lg" />
          <div className="ml-4 overflow-hidden">
            <h3 className="font-bold truncate">{user?.name}</h3>
            <p className="text-sm text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.aside
              className="fixed inset-y-0 left-0 z-40 w-72 max-w-full bg-white overflow-y-auto shadow-lg"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative flex items-center px-6 py-4 border-b">
                <UserAvatar size="md" />
                <div className="ml-4 overflow-hidden">
                  <h3 className="font-bold truncate">{user?.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  aria-label="Close menu"
                >
                  <FiX size={24} />
                </button>
              </div>

              <nav className="space-y-1 p-4">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
                <button
                  onClick={logout}
                  className="w-full flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                >
                  <FiLogOut className="mr-3" />
                  Logout
                </button>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};