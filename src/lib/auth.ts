import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/db'
import User from '@/models/User'
import Vendor from '@/models/Vendor'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        try {
          let user = null
          const isVendor = credentials.userType === 'vendor'

          if (isVendor) {
            // Login as vendor
            user = await Vendor.findOne({ email: credentials.email }).select('+password')
            if (!user) {
              throw new Error('Invalid email or password')
            }
          } else {
            // Login as regular user
            user = await User.findOne({ email: credentials.email }).select('+password')
            if (!user) {
              throw new Error('Invalid email or password')
            }
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          // Return user data that will be stored in the session
          return {
            id: user._id.toString(),
            email: user.email,
            name: isVendor ? user.businessName : user.name,
            role: isVendor ? 'vendor' : user.role || 'user',
            phone: user.phone,
            avatar: user.avatar,
            businessName: isVendor ? user.businessName : undefined,
            businessDescription: isVendor ? user.businessDescription : undefined,
            businessCategory: isVendor ? user.businessCategory : undefined,
            preferences: user.preferences,
            isEmailVerified: user.isEmailVerified,
            address: user.address,
            addresses: user.addresses,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender
          }
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed')
        }
      }
    }),
    CredentialsProvider({
      id: 'vendor-credentials',
      name: 'vendor-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        try {
          const vendor = await Vendor.findOne({ email: credentials.email }).select('+password')
          if (!vendor) {
            throw new Error('Invalid email or password')
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, vendor.password)
          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          return {
            id: vendor._id.toString(),
            email: vendor.email,
            name: vendor.businessName,
            role: 'vendor',
            phone: vendor.phone,
            avatar: vendor.avatar,
            businessName: vendor.businessName,
            businessDescription: vendor.businessDescription,
            businessCategory: vendor.businessCategory,
            preferences: vendor.preferences,
            isEmailVerified: vendor.isEmailVerified,
            address: vendor.address
          }
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persist user data to the token on sign in
      if (user) {
        token.role = user.role
        token.phone = user.phone
        token.avatar = user.avatar
        token.businessName = user.businessName
        token.businessDescription = user.businessDescription
        token.businessCategory = user.businessCategory
        token.preferences = user.preferences
        token.isEmailVerified = user.isEmailVerified
        token.address = user.address
        token.addresses = user.addresses
        token.dateOfBirth = user.dateOfBirth
        token.gender = user.gender
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, they will be available in the session object
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as string) || 'user'
        session.user.phone = token.phone as string
        session.user.avatar = token.avatar as string
        session.user.businessName = token.businessName as string
        session.user.businessDescription = token.businessDescription as string
        session.user.businessCategory = token.businessCategory as string
        session.user.preferences = token.preferences as any
        session.user.isEmailVerified = token.isEmailVerified as boolean
        session.user.address = token.address as any
        session.user.addresses = token.addresses as any
        session.user.dateOfBirth = token.dateOfBirth as string
        session.user.gender = token.gender as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle post-login redirects based on user role
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
}

export default NextAuth(authOptions)