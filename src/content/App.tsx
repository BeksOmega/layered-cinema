import { cn } from '@/lib/utils'

export default function App() {
  return (
    <div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2',
        'bg-blue-600 text-white text-xl font-bold',
        'px-6 py-2.5 rounded-md z-[9999999] pointer-events-none',
      )}
    >
      hello world
    </div>
  )
}
