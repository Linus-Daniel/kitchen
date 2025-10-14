// Type declarations for modules without TypeScript support

declare module 'jsonwebtoken' {
  export interface JwtPayload {
    [key: string]: any
    iss?: string
    sub?: string
    aud?: string | string[]
    exp?: number
    nbf?: number
    iat?: number
    jti?: string
  }

  export interface SignOptions {
    algorithm?: string
    expiresIn?: string | number
    notBefore?: string | number
    audience?: string | string[]
    subject?: string
    issuer?: string
    jwtid?: string
    noTimestamp?: boolean
    header?: object
    keyid?: string
  }

  export interface VerifyOptions {
    algorithms?: string[]
    audience?: string | RegExp | Array<string | RegExp>
    clockTimestamp?: number
    clockTolerance?: number
    complete?: boolean
    issuer?: string | string[]
    ignoreExpiration?: boolean
    ignoreNotBefore?: boolean
    jwtid?: string
    nonce?: string
    subject?: string
    maxAge?: string | number
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string

  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): JwtPayload | string

  export function decode(
    token: string,
    options?: { complete?: boolean; json?: boolean }
  ): null | JwtPayload | string
}

declare module 'validator' {
  export function isEmail(str: string): boolean
  export function isLength(str: string, options: { min?: number; max?: number }): boolean
  export function isStrongPassword(str: string): boolean
  export function normalizeEmail(email: string): string | false
}

declare module 'bcryptjs' {
  export function hash(data: string | Buffer, saltOrRounds: string | number): Promise<string>
  export function hashSync(data: string | Buffer, saltOrRounds: string | number): string
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>
  export function compareSync(data: string | Buffer, encrypted: string): boolean
  export function genSalt(rounds?: number): Promise<string>
  export function genSaltSync(rounds?: number): string
}

declare module '@/components/ui/tabs' {
  import { ReactNode } from 'react'

  export interface TabsProps {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    children: ReactNode
    className?: string
  }

  export interface TabsListProps {
    children: ReactNode
    className?: string
  }

  export interface TabsTriggerProps {
    value: string
    children: ReactNode
    className?: string
  }

  export interface TabsContentProps {
    value: string
    children: ReactNode
    className?: string
  }

  export const Tabs: React.FC<TabsProps>
  export const TabsList: React.FC<TabsListProps>
  export const TabsTrigger: React.FC<TabsTriggerProps>
  export const TabsContent: React.FC<TabsContentProps>
}