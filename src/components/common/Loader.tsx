interface LoaderProps {
  size?:       'sm' | 'md' | 'lg'
  fullScreen?: boolean
  text?:       string
}
const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }

export default function Loader({ size = 'md', fullScreen = false, text }: LoaderProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  )
  if (fullScreen) return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      {spinner}
    </div>
  )
  return <div className="flex justify-center py-12">{spinner}</div>
}
