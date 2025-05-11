// components/Layout.jsx
import { AccountSidebar } from '@/components/AccountSideBar';
import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
    children:ReactNode
}

const Layout = ({ children }:Props) => {
  return (
    <main>

      <AccountSidebar />
    <div className="flex p-3 min-h-screen">
      <main>{children}</main>
    </div>
    </main>
  );
};

export default Layout;
