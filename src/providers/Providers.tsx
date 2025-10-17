'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useCartSync } from '@/hooks/useCartSync'
import { ReactNode } from 'react'

// Component to handle cart synchronization
function CartSync() {
  useCartSync()
  return null
}

interface ProvidersProps {
  children: ReactNode
  session?: any
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <CartSync />
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}