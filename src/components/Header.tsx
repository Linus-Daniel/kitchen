"use client";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [10, 100], [1, 2]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Work", href: "/work" },
    { name: "Studio", href: "#about" },
    { name: "Insights", href: "/blogs" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      style={{ opacity: headerOpacity }}
      className={`fixed w-full z-50 transition-colors duration-500 ${
        isScrolled ? "bg-white/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="text-2xl font-light tracking-tight">
              <span className="block font-bold">Umason Studio</span>
              <span className="block text-xs tracking-widest">ARCHITECTURE</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block"
          >
            <ul className="flex space-x-8">
              {navItems.map((item, index) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="relative group text-sm font-medium tracking-wider"
                  >
                    {item.name}
                    <span className="absolute left-0 -bottom-1 w-0 h-px bg-amber-500 transition-all group-hover:w-full"></span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="space-y-1.5">
              <motion.span
                animate={
                  menuOpen
                    ? { rotate: 45, y: 6, backgroundColor: "#f59e0b" }
                    : { rotate: 0, backgroundColor: "#1c1917" }
                }
                className="block w-6 h-px bg-stone-900"
              ></motion.span>
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-6 h-px bg-stone-900"
              ></motion.span>
              <motion.span
                animate={
                  menuOpen
                    ? { rotate: -45, y: -6, backgroundColor: "#f59e0b" }
                    : { rotate: 0, backgroundColor: "#1c1917" }
                }
                className="block w-6 h-px bg-stone-900"
              ></motion.span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <ul className="py-4 space-y-4">
                {navItems.map((item) => (
                  <motion.li
                    key={item.name}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className="block py-2 text-lg"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}