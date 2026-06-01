import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import YouTubeEmbed from './YouTubeEmbed';
import type { Artifact, Video, Link } from '@/lib/schema';

export type MediaItem =
  | { type: 'image'; url: string; alt?: string }
  | { type: 'youtube'; videoId: string; start?: number; end?: number; title?: string };

export interface TimestampItem {
  time: string;
}

export interface DetailsProps {
  title?: string;
  description: string;
  media?: MediaItem[];
  timestamps?: TimestampItem[];
  tags?: string[];
  onTimestampClick?: (timestamp: TimestampItem) => void;
  onTagClick?: (tag: string) => void;
  editable?: boolean;
  artifact?: Partial<Artifact>;
  onArtifactChange?: (artifact: Partial<Artifact>) => void;
  /** Render inline in normal document flow instead of as a fixed overlay. */
  inline?: boolean;
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

// Shared input style for the dark theme
const inputClass = cn(
  'font-instrument-sans bg-transparent text-[#bdb5a2] text-[13px] leading-[1.78]',
  'border border-[#2a2418] rounded-[2px] px-2.5 py-1.5',
  'placeholder:text-[#4a4438]',
  'focus:outline-none focus:border-[#4a3a2a] focus:ring-0',
  'transition-colors duration-150 w-full',
);

const sectionLabelClass =
  'font-cinzel text-brick-red-500 text-[10.5px] font-normal whitespace-nowrap tracking-[0.22em] uppercase mb-2';

interface EditableVideoRowProps {
  video: Partial<Video>;
  onChange: (v: Partial<Video>) => void;
  onRemove: () => void;
}

function EditableVideoRow({ video, onChange, onRemove }: EditableVideoRowProps) {
  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-[2px]" style={{ background: '#13110e', border: '1px solid #1c1a14' }}>
      <input
        className={inputClass}
        placeholder="youtu.be link"
        value={video.youtubeLink ?? ''}
        onChange={(e) => onChange({ ...video, youtubeLink: e.target.value })}
        style={{ fontSize: '12px' }}
      />
      <div className="flex gap-1.5">
        <input
          className={inputClass}
          placeholder="duration (s)"
          type="number"
          min={1}
          value={video.duration ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
            onChange({ ...video, duration: val });
          }}
          style={{ fontSize: '12px' }}
        />
        <select
          className={cn(inputClass, 'appearance-none cursor-pointer')}
          value={video.type ?? ''}
          onChange={(e) => {
            const val = e.target.value as Video['type'];
            onChange({ ...video, type: val || undefined });
          }}
          style={{ fontSize: '12px', background: '#0d0b09' }}
        >
          <option value="">type…</option>
          <option value="interview">interview</option>
          <option value="bts">bts</option>
          <option value="featurette">featurette</option>
          <option value="press">press</option>
        </select>
        <Button
          variant="ghost"
          onClick={onRemove}
          aria-label="Remove video"
          className="flex-none h-auto px-2 py-1 text-[#4a4438] hover:text-brick-red-500 hover:bg-transparent transition-colors duration-150 text-[13px]"
        >
          ×
        </Button>
      </div>
    </div>
  );
}

interface EditableLinkRowProps {
  link: Partial<Link>;
  onChange: (l: Partial<Link>) => void;
  onRemove: () => void;
}

function EditableLinkRow({ link, onChange, onRemove }: EditableLinkRowProps) {
  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-[2px]" style={{ background: '#13110e', border: '1px solid #1c1a14' }}>
      <input
        className={inputClass}
        placeholder="URL"
        value={link.url ?? ''}
        onChange={(e) => onChange({ ...link, url: e.target.value })}
        style={{ fontSize: '12px' }}
      />
      <div className="flex gap-1.5">
        <input
          className={cn(inputClass, 'flex-1')}
          placeholder="title"
          value={link.title ?? ''}
          onChange={(e) => onChange({ ...link, title: e.target.value })}
          style={{ fontSize: '12px' }}
        />
        <select
          className={cn(inputClass, 'appearance-none cursor-pointer')}
          value={link.type ?? ''}
          onChange={(e) => {
            const val = e.target.value as Link['type'];
            onChange({ ...link, type: val || undefined });
          }}
          style={{ fontSize: '12px', background: '#0d0b09' }}
        >
          <option value="">type…</option>
          <option value="press">press</option>
          <option value="article">article</option>
          <option value="social">social</option>
          <option value="other">other</option>
        </select>
        <Button
          variant="ghost"
          onClick={onRemove}
          aria-label="Remove link"
          className="flex-none h-auto px-2 py-1 text-[#4a4438] hover:text-brick-red-500 hover:bg-transparent transition-colors duration-150 text-[13px]"
        >
          ×
        </Button>
      </div>
    </div>
  );
}

const KEBAB_RE = /^[a-z0-9-]+$/;

export default function Details({
  title,
  description,
  media = [],
  timestamps = [],
  tags = [],
  onTimestampClick,
  onTagClick,
  editable = false,
  artifact,
  onArtifactChange,
  inline = false,
}: DetailsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Edit-mode state — seeded from artifact prop when editable
  const [editTitle, setEditTitle] = useState(artifact?.title ?? title ?? '');
  const [editDescription, setEditDescription] = useState(artifact?.description ?? description);
  const [editTags, setEditTags] = useState<string[]>(artifact?.tags ?? tags);
  const [editVideos, setEditVideos] = useState<Partial<Video>[]>(artifact?.videos ?? []);
  const [editLinks, setEditLinks] = useState<Partial<Link>[]>(artifact?.links ?? []);

  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState('');
  const [newVideo, setNewVideo] = useState<Partial<Video>>({});
  const [newLink, setNewLink] = useState<Partial<Link>>({});

  const tagInputRef = useRef<HTMLInputElement>(null);

  function emitChange(patch: Partial<{
    title: string;
    description: string;
    tags: string[];
    videos: Partial<Video>[];
    links: Partial<Link>[];
  }>) {
    if (!onArtifactChange) return;
    onArtifactChange({
      ...(artifact ?? {}),
      title: patch.title ?? editTitle,
      description: patch.description ?? editDescription,
      tags: patch.tags ?? editTags,
      videos: (patch.videos ?? editVideos) as Video[],
      links: (patch.links ?? editLinks) as Link[],
    });
  }

  function handleTitleChange(v: string) {
    setEditTitle(v);
    emitChange({ title: v });
  }

  function handleDescriptionChange(v: string) {
    setEditDescription(v);
    emitChange({ description: v });
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const value = tagInput.trim();
    if (!value) return;
    if (!KEBAB_RE.test(value)) {
      setTagError('Lowercase letters, numbers and hyphens only');
      return;
    }
    if (editTags.includes(value)) {
      setTagError('Tag already added');
      return;
    }
    const next = [...editTags, value];
    setEditTags(next);
    setTagInput('');
    setTagError('');
    emitChange({ tags: next });
  }

  function handleRemoveTag(tag: string) {
    const next = editTags.filter((t) => t !== tag);
    setEditTags(next);
    emitChange({ tags: next });
  }

  function handleVideoChange(i: number, v: Partial<Video>) {
    const next = editVideos.map((vid, idx) => (idx === i ? v : vid));
    setEditVideos(next);
    emitChange({ videos: next });
  }

  function handleRemoveVideo(i: number) {
    const next = editVideos.filter((_, idx) => idx !== i);
    setEditVideos(next);
    emitChange({ videos: next });
  }

  function handleAddVideo() {
    if (!newVideo.youtubeLink) return;
    const next = [...editVideos, newVideo];
    setEditVideos(next);
    setNewVideo({});
    emitChange({ videos: next });
  }

  function handleLinkChange(i: number, l: Partial<Link>) {
    const next = editLinks.map((lnk, idx) => (idx === i ? l : lnk));
    setEditLinks(next);
    emitChange({ links: next });
  }

  function handleRemoveLink(i: number) {
    const next = editLinks.filter((_, idx) => idx !== i);
    setEditLinks(next);
    emitChange({ links: next });
  }

  function handleAddLink() {
    if (!newLink.url || !newLink.title) return;
    const next = [...editLinks, newLink];
    setEditLinks(next);
    setNewLink({});
    emitChange({ links: next });
  }

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
        inline
          ? 'w-full overflow-y-auto'
          : 'fixed bottom-6 right-6 z-[9999999] w-[400px] max-h-[78vh] overflow-hidden',
        'flex flex-col',
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
            <YouTubeEmbed
              key={currentIndex}
              videoId={currentItem.videoId}
              start={currentItem.start}
              end={currentItem.end}
              title={currentItem.title}
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

      {/* Scrollable body */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#2a2720 transparent',
        }}
      >
        {editable ? (
          /* ── EDIT MODE ─────────────────────────────────────── */
          <div className="space-y-4">

            {/* Title */}
            <div>
              <div className={sectionLabelClass}>Title</div>
              <input
                className={inputClass}
                value={editTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Artifact title"
              />
            </div>

            {/* Description */}
            <div>
              <div className={sectionLabelClass}>Description</div>
              <textarea
                className={cn(inputClass, 'resize-none leading-[1.78]')}
                rows={4}
                value={editDescription}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Description…"
              />
            </div>

            {/* Tags */}
            <div>
              <div className={sectionLabelClass}>Tags</div>
              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {editTags.map((tag) => (
                    <span
                      key={tag}
                      className={cn(
                        'inline-flex items-center gap-1',
                        'font-instrument-sans',
                        'h-auto px-2.5 py-0.5 rounded-[2px]',
                        'text-[10.5px] uppercase tracking-[0.07em] font-normal',
                        'text-[#6b6254] border border-[#2a2418] bg-transparent',
                      )}
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                        className="text-[#4a4438] hover:text-brick-red-500 transition-colors duration-150 leading-none ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                ref={tagInputRef}
                className={inputClass}
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setTagError('');
                }}
                onKeyDown={handleTagKeyDown}
                placeholder="add-tag (Enter to add)"
                style={{ fontSize: '12px' }}
              />
              {tagError && (
                <p className="mt-1 text-[11px] text-brick-red-500 font-instrument-sans">{tagError}</p>
              )}
            </div>

            {/* Videos */}
            <div>
              <div className={sectionLabelClass}>Videos</div>
              <div className="space-y-1.5">
                {editVideos.map((vid, i) => (
                  <EditableVideoRow
                    key={i}
                    video={vid}
                    onChange={(v) => handleVideoChange(i, v)}
                    onRemove={() => handleRemoveVideo(i)}
                  />
                ))}
              </div>
              {/* Add video row */}
              <div className="mt-1.5 flex flex-col gap-1.5 p-2 rounded-[2px]" style={{ background: '#13110e', border: '1px dashed #2a2418' }}>
                <p className="font-cinzel text-[9px] tracking-[0.18em] uppercase text-[#4a4438]">Add video</p>
                <input
                  className={inputClass}
                  placeholder="youtu.be link"
                  value={newVideo.youtubeLink ?? ''}
                  onChange={(e) => setNewVideo({ ...newVideo, youtubeLink: e.target.value })}
                  style={{ fontSize: '12px' }}
                />
                <div className="flex gap-1.5">
                  <input
                    className={inputClass}
                    placeholder="duration (s)"
                    type="number"
                    min={1}
                    value={newVideo.duration ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                      setNewVideo({ ...newVideo, duration: val });
                    }}
                    style={{ fontSize: '12px' }}
                  />
                  <select
                    className={cn(inputClass, 'appearance-none cursor-pointer')}
                    value={newVideo.type ?? ''}
                    onChange={(e) => {
                      const val = e.target.value as Video['type'];
                      setNewVideo({ ...newVideo, type: val || undefined });
                    }}
                    style={{ fontSize: '12px', background: '#0d0b09' }}
                  >
                    <option value="">type…</option>
                    <option value="interview">interview</option>
                    <option value="bts">bts</option>
                    <option value="featurette">featurette</option>
                    <option value="press">press</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={handleAddVideo}
                    disabled={!newVideo.youtubeLink}
                    className={cn(
                      'flex-none h-auto px-3 py-1 rounded-[2px]',
                      'text-[10.5px] font-normal tracking-[0.06em]',
                      'text-[#6b6254] border-[#2a2418] bg-transparent',
                      'hover:text-brick-red-500 hover:border-brick-red-900 hover:bg-[rgba(214,16,69,0.06)]',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      'transition-all duration-150',
                    )}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <div className={sectionLabelClass}>Links</div>
              <div className="space-y-1.5">
                {editLinks.map((lnk, i) => (
                  <EditableLinkRow
                    key={i}
                    link={lnk}
                    onChange={(l) => handleLinkChange(i, l)}
                    onRemove={() => handleRemoveLink(i)}
                  />
                ))}
              </div>
              {/* Add link row */}
              <div className="mt-1.5 flex flex-col gap-1.5 p-2 rounded-[2px]" style={{ background: '#13110e', border: '1px dashed #2a2418' }}>
                <p className="font-cinzel text-[9px] tracking-[0.18em] uppercase text-[#4a4438]">Add link</p>
                <input
                  className={inputClass}
                  placeholder="URL"
                  value={newLink.url ?? ''}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  style={{ fontSize: '12px' }}
                />
                <div className="flex gap-1.5">
                  <input
                    className={cn(inputClass, 'flex-1')}
                    placeholder="title"
                    value={newLink.title ?? ''}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    style={{ fontSize: '12px' }}
                  />
                  <select
                    className={cn(inputClass, 'appearance-none cursor-pointer')}
                    value={newLink.type ?? ''}
                    onChange={(e) => {
                      const val = e.target.value as Link['type'];
                      setNewLink({ ...newLink, type: val || undefined });
                    }}
                    style={{ fontSize: '12px', background: '#0d0b09' }}
                  >
                    <option value="">type…</option>
                    <option value="press">press</option>
                    <option value="article">article</option>
                    <option value="social">social</option>
                    <option value="other">other</option>
                  </select>
                  <Button
                    variant="outline"
                    onClick={handleAddLink}
                    disabled={!newLink.url || !newLink.title}
                    className={cn(
                      'flex-none h-auto px-3 py-1 rounded-[2px]',
                      'text-[10.5px] font-normal tracking-[0.06em]',
                      'text-[#6b6254] border-[#2a2418] bg-transparent',
                      'hover:text-brick-red-500 hover:border-brick-red-900 hover:bg-[rgba(214,16,69,0.06)]',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      'transition-all duration-150',
                    )}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* ── READ MODE ─────────────────────────────────────── */
          <>
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
              <div className="mt-3.5 pt-3.5 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid #1c1a14' }}>
                {timestamps.map((ts, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => onTimestampClick?.(ts)}
                    className={cn(
                      'h-auto px-2.5 py-0.5 rounded-[2px]',
                      'text-[10.5px] font-normal tabular-nums',
                      'text-brick-red-600 border-[#2a2418] bg-transparent',
                      'hover:text-brick-red-400 hover:border-brick-red-900 hover:bg-[rgba(214,16,69,0.06)]',
                      'transition-all duration-150',
                    )}
                    style={{ fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}
                  >
                    {ts.time}
                  </Button>
                ))}
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
          </>
        )}
      </div>
    </div>
  );
}
