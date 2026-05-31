import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type MediaItem =
  | { type: 'image'; url: string; alt?: string }
  | { type: 'video'; url: string; title?: string };

export interface TimestampItem {
  time: string;
  label: string;
}

export interface DetailsProps {
  title?: string;
  description: string;
  media?: MediaItem[];
  timestamps?: TimestampItem[];
  tags?: string[];
  onTimestampClick?: (timestamp: TimestampItem) => void;
  onTagClick?: (tag: string) => void;
}

function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-50 rounded-[inherit]"
      style={{
        opacity: 0.045,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='256' height='256' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '170px',
      }}
    />
  );
}

function ChevronLeft() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 3L11 8L6 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Details({
  title,
  description,
  media = [],
  timestamps = [],
  tags = [],
  onTimestampClick,
  onTagClick,
}: DetailsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const hasMedia = media.length > 0;
  const hasMultiple = media.length > 1;
  const currentItem = hasMedia ? media[currentIndex] : null;
  const paragraphs = description.split('\n\n').filter(Boolean);

  function handlePrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((i) => (i - 1 + media.length) % media.length);
  }

  function handleNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((i) => (i + 1) % media.length);
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-[9999999]',
        'w-[400px] max-h-[78vh]',
        'flex flex-col overflow-hidden',
        'rounded-[2px]',
      )}
      style={{
        background: '#0d0b09',
        border: '1px solid #222018',
        boxShadow: '0 8px 48px rgba(0,0,0,0.88), 0 2px 10px rgba(0,0,0,0.55)',
      }}
    >
      <GrainOverlay />

      {/* Top accent line */}
      <div
        className="h-px w-full flex-none"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, var(--color-brick-red-700) 30%, var(--color-brick-red-700) 70%, transparent 95%)',
          opacity: 0.6,
        }}
      />

      {/* Media carousel */}
      {currentItem && (
        <div
          className="relative w-full flex-none overflow-hidden group"
          style={{ aspectRatio: '16/9', background: '#000' }}
        >
          {currentItem.type === 'image' ? (
            <img
              key={currentIndex}
              src={currentItem.url}
              alt={currentItem.alt ?? ''}
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              key={currentIndex}
              src={currentItem.url}
              controls
              className="w-full h-full object-contain"
              style={{ background: '#000' }}
            />
          )}

          {/* Edge vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 55%, rgba(13,11,9,0.4) 100%)',
            }}
          />

          {/* Nav arrows */}
          {hasMultiple && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                aria-label="Previous"
                className={cn(
                  'absolute left-2.5 top-1/2 -translate-y-1/2 z-10',
                  'w-8 h-8 rounded-full',
                  'text-white/75 hover:text-white hover:bg-transparent',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-150',
                )}
                style={{
                  background: 'rgba(0,0,0,0.52)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                aria-label="Next"
                className={cn(
                  'absolute right-2.5 top-1/2 -translate-y-1/2 z-10',
                  'w-8 h-8 rounded-full',
                  'text-white/75 hover:text-white hover:bg-transparent',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-150',
                )}
                style={{
                  background: 'rgba(0,0,0,0.52)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <ChevronRight />
              </Button>
            </>
          )}

          {/* Dot indicators */}
          {hasMultiple && (
            <>
              <div
                className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none z-[5]"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
                }}
              />
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 items-center">
                {media.map((_, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(i);
                    }}
                    aria-label={`Go to item ${i + 1}`}
                    className="p-0 rounded-full hover:bg-transparent transition-all duration-200"
                    style={{
                      width: i === currentIndex ? '20px' : '6px',
                      height: '6px',
                      minWidth: 0,
                      background:
                        i === currentIndex
                          ? 'var(--color-brick-red-700)'
                          : 'rgba(255,255,255,0.35)',
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {hasMedia && (
        <div
          className="mx-0 flex-none h-px"
          style={{ background: '#1c1a14' }}
        />
      )}

      {/* Description */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2720 transparent',
        }}
      >
        {title && (
          <div className="flex items-center gap-2.5 mb-3.5">
            <span className="font-cinzel text-brick-red-500 text-[10.5px] font-normal whitespace-nowrap tracking-[0.22em] uppercase">
              {title}
            </span>
            <div className="flex-1 h-px bg-brick-red-700" />
          </div>
        )}

        <div className="space-y-3">
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="font-instrument-sans text-[#bdb5a2] text-[13px] leading-[1.78] font-normal"
            >
              {para}
            </p>
          ))}
        </div>

        {timestamps.length > 0 && (
          <div
            className="mt-4 pt-3.5"
            style={{ borderTop: '1px solid #1c1a14' }}
          >
            <div className="space-y-0.5">
              {timestamps.map((ts, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  onClick={() => onTimestampClick?.(ts)}
                  className={cn(
                    'font-instrument-sans',
                    'w-full justify-start gap-3 px-2 py-1 h-auto rounded-[2px]',
                    'text-left group',
                    'hover:bg-[rgba(214,16,69,0.07)] hover:text-inherit',
                  )}
                >
                  <span className="font-mono text-brick-red-600 text-[11px] tabular-nums flex-none tracking-[0.04em]">
                    {ts.time}
                  </span>
                  <span className="text-[#8a8070] group-hover:text-[#bdb5a2] text-[12px] transition-colors duration-150 truncate font-normal">
                    {ts.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div
            className="mt-3.5 pt-3.5 flex flex-wrap gap-1.5"
            style={{ borderTop: '1px solid #1c1a14' }}
          >
            {tags.map((tag, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => onTagClick?.(tag)}
                className={cn(
                  'font-instrument-sans',
                  'h-auto px-2.5 py-0.5 rounded-[2px]',
                  'text-[10.5px] uppercase tracking-[0.07em] font-normal',
                  'text-[#6b6254] border-[#2a2418] bg-transparent',
                  'hover:text-brick-red-500 hover:border-brick-red-900 hover:bg-[rgba(214,16,69,0.06)]',
                  'transition-all duration-150',
                )}
              >
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
