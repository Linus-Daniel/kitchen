import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      phone?: string
      avatar?: string
      businessName?: string
      businessDescription?: string
      businessCategory?: string
      preferences?: any
      isEmailVerified?: boolean
      address?: any
      addresses?: any[]
      dateOfBirth?: string
      gender?: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    phone?: string
    avatar?: string
    businessName?: string
    businessDescription?: string
    businessCategory?: string
    preferences?: any
    isEmailVerified?: boolean
    address?: any
    addresses?: any[]
    dateOfBirth?: string
    gender?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    phone?: string
    avatar?: string
    businessName?: string
    businessDescription?: string
    businessCategory?: string
    preferences?: any
    isEmailVerified?: boolean
    address?: any
    addresses?: any[]
    dateOfBirth?: string
    gender?: string
  }
}