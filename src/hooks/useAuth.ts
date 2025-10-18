'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { apiClient, RegisterData, VendorRegisterData } from '@/lib/api'
import { showToast } from '@/lib/toast'
import { useEffect } from 'react'

interface LoginCredentials {
  email: string
  password: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setUser, setLoading, setError, clearAuth } = useAuthStore()

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
    } else {
      setLoading(false)
      if (session?.user) {
        setUser(session.user as any)
        
        // Additional check for vendor role consistency
        if (window.location.pathname.startsWith('/vendor') && session.user.role !== 'vendor') {
          console.warn('User role mismatch: expected vendor, got', session.user.role)
          router.push('/vendor/login')
        }
      } else {
        clearAuth()
      }
    }
  }, [session, status, setUser, setLoading, clearAuth, router])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, isVendor = false }: LoginCredentials & { isVendor?: boolean }) => {
      const result = await signIn('credentials', {
        email,
        password,
        userType: isVendor ? 'vendor' : 'user',
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    },
    onSuccess: () => {
      showToast.success('Login successful! Welcome back.')
      setError(null)
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Login failed'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Vendor login mutation
  const vendorLoginMutation = useMutation({
    mutationFn: async ({ email, password }: LoginCredentials) => {
      const result = await signIn('vendor-credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return result
    },
    onSuccess: () => {
      showToast.success('Vendor login successful! Welcome to your dashboard.')
      setError(null)
      router.push('/vendor')
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Vendor login failed'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await apiClient.register(userData)
      
      // After successful registration, sign in the user
      const result = await signIn('credentials', {
        email: userData.email,
        password: userData.password,
        userType: 'user',
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return response
    },
    onSuccess: () => {
      showToast.success('Registration successful! Welcome to KitchenMode.')
      setError(null)
      router.push('/')
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Registration failed'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Vendor register mutation
  const vendorRegisterMutation = useMutation({
    mutationFn: async (vendorData: VendorRegisterData) => {
      const response = await apiClient.vendorRegister(vendorData)
      
      // After successful registration, sign in the vendor
      const result = await signIn('vendor-credentials', {
        email: vendorData.email,
        password: vendorData.password,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      return response
    },
    onSuccess: () => {
      showToast.success('Vendor registration successful! Welcome to your vendor dashboard.')
      setError(null)
      router.push('/vendor')
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Vendor registration failed'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (userData: any) => apiClient.updateProfile(userData),
    onSuccess: (data) => {
      showToast.success('Profile updated successfully!')
      // Update session and Zustand store
      setUser(data.data)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setError(null)
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Profile update failed'
      showToast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Logout function
  const logout = async () => {
    showToast.info('Logging out...')
    await signOut({ redirect: false })
    clearAuth()
    queryClient.clear()
    showToast.success('Logged out successfully. See you soon!')
    router.push('/login')
  }

  return {
    user: session?.user || null,
    loading: status === 'loading' || loginMutation.isPending || registerMutation.isPending,
    error: useAuthStore(state => state.error),
    isAuthenticated: !!session?.user,
    login: loginMutation.mutate,
    vendorLogin: vendorLoginMutation.mutate,
    register: registerMutation.mutate,
    vendorRegister: vendorRegisterMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    logout,
    loginLoading: loginMutation.isPending,
    registerLoading: registerMutation.isPending,
    updateLoading: updateProfileMutation.isPending
  }
}