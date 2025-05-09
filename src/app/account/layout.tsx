// components/Layout.jsx
import { AccountSidebar } from '@/components/AccountSideBar';
import Link from 'next/link';
import { ReactNode } from 'react';

type Props = {
    children:ReactNode
}

const Layout = ({ children }:Props) => {
  return (
    <div className="flex p-3 min-h-screen">
      <AccountSidebar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
