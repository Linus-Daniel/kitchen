import { NextRequest, NextResponse } from 'next/server'

export interface ErrorResponse {
  message: string
  statusCode: number
}

export interface ApiRequest extends NextRequest {
  user?: any
  vendor?: any
}

export interface ApiResponse extends NextResponse {}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<void | NextResponse>

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

export interface VendorAuthenticatedRequest extends NextRequest {
  vendor: {
    id: string
    email: string
    businessName: string
    role: string
  }
}