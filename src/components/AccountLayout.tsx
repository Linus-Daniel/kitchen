import React, { ReactNode } from 'react'
import { AuthProvider } from '@/context/authContext'
function AccountLayout({children}:{children:ReactNode}) {
  return (
    <AuthProvider>
        {children}
    </AuthProvider>
  )
}

export default AccountLayout