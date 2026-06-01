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

function computeLanes(events: TimelineEvent[]): number[] {
  if (events.length === 0) return []
  const order = events.map((_, i) => i).sort((a, b) => events[a].start - events[b].start)
  const laneEnds: number[] = []
  const result = new Array<number>(events.length)
  for (const idx of order) {
    const ev = events[idx]
    let lane = laneEnds.findIndex(end => end <= ev.start)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0) }
    laneEnds[lane] = ev.end
    result[idx] = lane
  }
  return result
}

const LANE_H = 12
const LANE_GAP = 4

function FoldIcon({ expanded }: { expanded: boolean }) {
  const spread = (dir: number): React.CSSProperties => ({
    transform: `translateY(${expanded ? dir * 1.5 : 0}px)`,
    transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1)',
  })
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <line x1="1" y1="3.5" x2="9" y2="3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" style={spread(-1)} />
      <line x1="1" y1="5.5" x2="9" y2="5.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="1" y1="7.5" x2="9" y2="7.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" style={spread(1)} />
    </svg>
  )
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
  const [expanded, setExpanded] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)

  const clamped = Math.min(Math.max(currentTime, 0), duration)
  const playedPct = duration > 0 ? (clamped / duration) * 100 : 0

  const lanes = computeLanes(events)
  const laneCount = lanes.length > 0 ? Math.max(...lanes) + 1 : 1
  const expandedH = laneCount * LANE_H + (laneCount - 1) * LANE_GAP

  const showTooltip = useCallback((i: number) => {
    clearTimeout(hideTimer.current)
    setHovered(i)
  }, [])

  const hideTooltip = useCallback(() => {
    hideTimer.current = setTimeout(() => setHovered(null), 120)
  }, [])

  useEffect(() => () => clearTimeout(hideTimer.current), [])

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

  function renderLanes() {
    return Array.from({ length: laneCount }, (_, lane) => (
      <div key={lane} className="absolute inset-x-0" style={{ top: lane * (LANE_H + LANE_GAP), height: LANE_H }}>
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-800" />
        <div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brick-red-900"
          style={{ width: `${playedPct}%` }}
        />
        {events.map((ev, i) => {
          if (lanes[i] !== lane) return null
          const startPct = (ev.start / duration) * 100
          const endPct = (ev.end / duration) * 100
          const playedW = Math.max(0, Math.min(playedPct, endPct) - startPct)
          const unplayedLeft = Math.max(startPct, playedPct)
          const unplayedW = Math.max(0, endPct - unplayedLeft)
          return (
            <Fragment key={i}>
              {playedW > 0 && <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-brick-red-700" style={{ left: `${startPct}%`, width: `${playedW}%` }} />}
              {unplayedW > 0 && <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-zinc-600" style={{ left: `${unplayedLeft}%`, width: `${unplayedW}%` }} />}
              <div className="absolute top-0 h-full" style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} onMouseEnter={() => showTooltip(i)} onMouseLeave={hideTooltip} />
            </Fragment>
          )
        })}
      </div>
    ))
  }

  return (
    <div className={cn('relative w-full select-none', className)}>
      <div className="flex items-start gap-1.5">

        <button
          className="mt-0.5 flex-none text-zinc-600 transition-colors hover:text-zinc-400 focus:outline-none"
          onClick={() => setExpanded(e => !e)}
          onMouseDown={(e) => e.preventDefault()}
          aria-label={expanded ? 'Collapse lanes' : 'Expand lanes'}
        >
          <FoldIcon expanded={expanded} />
        </button>

        <div className="relative flex-1">
          {hovered !== null && events[hovered]?.label && (
            <div
              className="absolute bottom-full z-10 mb-0.5 -translate-x-1/2 cursor-pointer whitespace-nowrap rounded border border-brick-red-900 bg-zinc-950/95 px-2 py-0.5 font-[Cinzel] text-[10px] tracking-widest text-brick-red-400 hover:border-brick-red-700 hover:text-brick-red-300"
              style={{ left: `${((events[hovered].start + events[hovered].end) / 2 / duration) * 100}%` }}
              onMouseEnter={() => showTooltip(hovered)}
              onMouseLeave={hideTooltip}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onEventClick?.(events[hovered!], hovered!) }}
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
            className={cn('relative w-full overflow-hidden focus:outline-none', dragging ? 'cursor-grabbing' : 'cursor-pointer')}
            style={{
              height: expanded ? expandedH : 12,
              transition: 'height 350ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
          >
            {/* Opacity view */}
            <div
              className="absolute inset-0"
              style={{
                opacity: expanded ? 0 : 1,
                transition: expanded ? 'opacity 150ms' : 'opacity 200ms 120ms',
                pointerEvents: expanded ? 'none' : 'auto',
              }}
            >
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-zinc-800" />
              <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brick-red-900" style={{ width: `${playedPct}%` }} />
              {events.map((ev, i) => {
                const startPct = (ev.start / duration) * 100
                const endPct = (ev.end / duration) * 100
                const playedW = Math.max(0, Math.min(playedPct, endPct) - startPct)
                const unplayedLeft = Math.max(startPct, playedPct)
                const unplayedW = Math.max(0, endPct - unplayedLeft)
                return (
                  <Fragment key={i}>
                    {playedW > 0 && <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-brick-red-700 opacity-60" style={{ left: `${startPct}%`, width: `${playedW}%` }} />}
                    {unplayedW > 0 && <div className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-zinc-600 opacity-60" style={{ left: `${unplayedLeft}%`, width: `${unplayedW}%` }} />}
                    <div className="absolute top-0 h-full" style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} onMouseEnter={() => showTooltip(i)} onMouseLeave={hideTooltip} />
                  </Fragment>
                )
              })}
            </div>

            {/* Lanes view */}
            <div
              className="absolute inset-0"
              style={{
                opacity: expanded ? 1 : 0,
                transition: expanded ? 'opacity 200ms 120ms' : 'opacity 150ms',
                pointerEvents: expanded ? 'auto' : 'none',
              }}
            >
              {renderLanes()}
            </div>

            <div
              className="pointer-events-none absolute top-0 h-full w-px -translate-x-1/2 bg-white"
              style={{ left: `${playedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
