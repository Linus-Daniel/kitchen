import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface LoadingSkeletonProps {
  count?: number
  height?: number | string
  width?: number | string
  className?: string
  variant?: 'card' | 'list' | 'text' | 'avatar' | 'button'
}

export function LoadingSkeleton({ 
  count = 1, 
  height, 
  width, 
  className = '',
  variant = 'text'
}: LoadingSkeletonProps) {
  const getVariantProps = () => {
    switch (variant) {
      case 'card':
        return { height: 300, width: '100%' }
      case 'list':
        return { height: 60, width: '100%' }
      case 'avatar':
        return { height: 40, width: 40, style: { borderRadius: '50%' } }
      case 'button':
        return { height: 40, width: 120 }
      default:
        return { height: height || 20, width: width || '100%' }
    }
  }

  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <Skeleton 
        count={count}
        className={className}
        {...getVariantProps()}
      />
    </SkeletonTheme>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
      <LoadingSkeleton variant="card" height={200} />
      <div className="space-y-2">
        <LoadingSkeleton height={20} width="80%" />
        <LoadingSkeleton height={16} width="60%" />
        <LoadingSkeleton height={16} width="40%" />
        <div className="flex justify-between items-center pt-2">
          <LoadingSkeleton height={20} width="30%" />
          <LoadingSkeleton variant="button" height={36} width={80} />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="bg-white shadow-sm p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <LoadingSkeleton height={32} width={120} />
        <div className="flex items-center space-x-4">
          <LoadingSkeleton height={40} width={200} />
          <LoadingSkeleton variant="avatar" />
          <LoadingSkeleton variant="avatar" />
        </div>
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 border-b">
      <LoadingSkeleton height={60} width={60} />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton height={16} width="70%" />
        <LoadingSkeleton height={14} width="50%" />
        <div className="flex justify-between items-center">
          <LoadingSkeleton height={16} width="30%" />
          <LoadingSkeleton height={32} width={100} />
        </div>
      </div>
    </div>
  )
}