"use client"
import { queryClient } from '@/lib/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import React, { ReactNode } from 'react'

function AccountLayout({children}:{children:ReactNode}) {
  
  return (
    <>
    <SessionProvider>
      <QueryClientProvider client={queryClient}>

        {children}
        </QueryClientProvider>
    </SessionProvider>
    </>
  )
}

export default AccountLayout