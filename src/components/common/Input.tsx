import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string
  error?:     string
  leftIcon?:  ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>}
        <input
          ref={ref}
          className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400
            outline-none transition-all duration-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100
            ${leftIcon ? 'pl-9' : ''} ${rightIcon ? 'pr-9' : ''}
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
          {...rest}
        />
        {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</span>}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
export default Input
