import type { Metadata } from "next";
import "../globals.css";
import { VendorSidebar } from "@/components/vendor/SideBar";
import { VendorNavbar } from "@/components/vendor/NavBar";
import { Providers } from "@/providers/Providers";
import { VendorLayoutClient } from "@/components/vendor/VendorLayout";



export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description: "Manage your restaurant",
};

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <body className="antialiased">
        <Providers>
          <div className="flex min-h-screen bg-gray-50">
            {/* Vendor Sidebar */}
            <aside className="hidden md:block fixed inset-y-0 left-0 z-30 w-64 border-r bg-white">
              <VendorSidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 md:pl-64">
              {/* Vendor Navbar */}
              <header className="sticky top-0 z-20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
                <VendorNavbar />
              </header>

              {/* Page Content with Animation */}
              <main className="flex-1 overflow-y-auto">
                <VendorLayoutClient>{children}</VendorLayoutClient>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
