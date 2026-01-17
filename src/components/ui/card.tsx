import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden bg-white/5 border border-white/10',
        'hover:bg-white/10 transition-colors duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}
