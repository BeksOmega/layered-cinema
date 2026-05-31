import { useRef, useCallback, useEffect, useState, Fragment } from 'react'
import { cn } from '@/lib/utils'

export interface TimelineEvent {
  start: number
  end: number
  label?: string
}

export interface TimelineProps {
  duration: number
  currentTime: number
  events?: TimelineEvent[]
  onChange?: (time: number) => void
  onEventClick?: (event: TimelineEvent, index: number) => void
  className?: string
}

export function Timeline({
  duration,
  currentTime,
  events = [],
  onChange,
  onEventClick,
  className,
}: TimelineProps) {
  const ref = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | undefined>(undefined)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const showTooltip = useCallback((i: number) => {
    clearTimeout(hideTimer.current)
    setHovered(i)
  }, [])

  const hideTooltip = useCallback(() => {
    hideTimer.current = setTimeout(() => setHovered(null), 120)
  }, [])

  const clamped = Math.min(Math.max(currentTime, 0), duration)
  const playedPct = duration > 0 ? (clamped / duration) * 100 : 0

  const timeAt = useCallback(
    (clientX: number): number => {
      const r = ref.current?.getBoundingClientRect()
      if (!r || r.width === 0) return 0
      return Math.min(Math.max(((clientX - r.left) / r.width) * duration, 0), duration)
    },
    [duration],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setDragging(true)
      onChange?.(timeAt(e.clientX))
    },
    [timeAt, onChange],
  )

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => onChange?.(timeAt(e.clientX))
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, timeAt, onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onChange?.(Math.max(0, clamped - step))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onChange?.(Math.min(duration, clamped + step))
      }
    },
    [clamped, duration, onChange],
  )

  return (
    <div className={cn('relative w-full select-none', className)}>
      {/* Event label tooltip */}
      {hovered !== null && events[hovered]?.label && (
        <div
          className="absolute bottom-full z-10 mb-0.5 -translate-x-1/2 cursor-pointer whitespace-nowrap rounded border border-zinc-700/60 bg-zinc-950/95 px-2 py-0.5 font-mono text-[10px] tracking-widest text-zinc-300 hover:border-zinc-500/60 hover:text-zinc-100"
          style={{
            left: `${((events[hovered].start + events[hovered].end) / 2 / duration) * 100}%`,
          }}
          onMouseEnter={() => showTooltip(hovered)}
          onMouseLeave={hideTooltip}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onEventClick?.(events[hovered!], hovered!)
          }}
        >
          {events[hovered].label}
        </div>
      )}

      <div
        ref={ref}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.round(clamped)}
        aria-label="Playback timeline"
        tabIndex={0}
        className={cn(
          'relative h-3 w-full focus:outline-none',
          dragging ? 'cursor-grabbing' : 'cursor-pointer',
        )}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
      >
        {/* Base track */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-800" />

        {/* Played track */}
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-900"
          style={{ width: `${playedPct}%` }}
        />

        {/* Events: split into played/unplayed halves at the playhead */}
        {events.map((ev, i) => {
          const startPct = (ev.start / duration) * 100
          const endPct = (ev.end / duration) * 100
          const playedW = Math.max(0, Math.min(playedPct, endPct) - startPct)
          const unplayedLeft = Math.max(startPct, playedPct)
          const unplayedW = Math.max(0, endPct - unplayedLeft)
          return (
            <Fragment key={i}>
              {playedW > 0 && (
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-amber-700"
                  style={{ left: `${startPct}%`, width: `${playedW}%` }}
                />
              )}
              {unplayedW > 0 && (
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-zinc-600"
                  style={{ left: `${unplayedLeft}%`, width: `${unplayedW}%` }}
                />
              )}
              {/* Hover target spans the full event */}
              <div
                className="absolute top-0 h-full"
                style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                onMouseEnter={() => showTooltip(i)}
                onMouseLeave={hideTooltip}
              />
            </Fragment>
          )
        })}

        {/* Playhead */}
        <div
          className="pointer-events-none absolute top-0 h-full w-px -translate-x-1/2 bg-white"
          style={{ left: `${playedPct}%` }}
        />
      </div>
    </div>
  )
}
