"use client";

import { motion } from "framer-motion";
import { VendorAuthGuard } from "./VendorAuthGuard";

interface VendorLayoutClientProps {
  children: React.ReactNode;
}

export function VendorLayoutClient({ children }: VendorLayoutClientProps) {
  return (
    <VendorAuthGuard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-4 sm:p-6 lg:p-8 mx-auto w-full max-w-screen-2xl"
      >
        {children}
      </motion.div>
    </VendorAuthGuard>
  );
}
