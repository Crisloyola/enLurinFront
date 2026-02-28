import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'outline' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  size?:      Size
  loading?:   boolean
  icon?:      ReactNode
  fullWidth?: boolean
  children:   ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white shadow-sm',
  outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white',
  ghost:   'text-gray-600 hover:text-orange-500 hover:bg-orange-50',
  danger:  'bg-red-500 hover:bg-red-600 text-white',
}
const sizeStyles: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
}

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  icon, fullWidth = false, children, className = '', disabled, ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-full
        transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
}
