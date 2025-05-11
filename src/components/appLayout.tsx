// components/AppWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/cartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/authContext";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) return <>{children}</>;

  return (
    <AuthProvider>
      <CartProvider>
        <Header />
        {children}
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}
