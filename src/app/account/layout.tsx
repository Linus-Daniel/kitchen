// Force dynamic rendering for all account pages
export const dynamic = 'force-dynamic'

// components/Layout.jsx
import AccountLayout from "@/components/AccountLayout";
import { AccountSidebar } from "@/components/AccountSideBar";
import { ReactNode } from "react";
import "../globals.css"

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (

    <html>
      <body>

      <div className="flex flex-col md:flex-row w-full min-h-screen">
        <AccountLayout>
          <AccountSidebar />

          <main className="flex-1 md:ml-64">{children}</main>
        </AccountLayout>
      </div>
      </body>
    </html>
  );
};

export default Layout;
