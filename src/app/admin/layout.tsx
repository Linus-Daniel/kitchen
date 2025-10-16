"use client";
import { AdminSidebar } from "@/components/admin/sideBar";
import { AdminNavbar } from "@/components/admin/navBar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/Providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>
          <div className="flex min-h-screen bg-background">
            {/* Sidebar - Fixed width and position */}
            <div className="hidden md:block fixed inset-y-0 left-0 z-30 w-64 border-r bg-background">
              <AdminSidebar />
            </div>

            {/* Main content area - Offset for sidebar */}
            <div className="flex flex-col flex-1 md:pl-64">
              {/* Navbar - Sticky positioned */}
              <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <AdminNavbar />
              </header>

              {/* Main content with padding and animation */}
              <main className="flex-1 overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "p-4 sm:p-6 lg:p-8 mx-auto",
                    "w-full max-w-screen-2xl" // Using standard screen size instead of 9xl
                  )}
                >
                  {children}
                </motion.div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
