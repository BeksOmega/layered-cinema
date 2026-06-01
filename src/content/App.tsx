import { useState, useEffect, useCallback } from 'react';
import { Timeline, type TimelineEvent } from '@/components/Timeline/Timeline';
import { getFilmData, extractYoutubeVideoId } from '@/lib/filmIndex';
import type { Film } from '@/lib/schema';

interface ArtifactEvent extends TimelineEvent {
  artifactIndex: number;
}

export default function App() {
  const [cinemaOn, setCinemaOn] = useState(
    () => document.documentElement.dataset.layeredCinema === 'on',
  );
  const [film, setFilm] = useState<Film | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setCinemaOn(document.documentElement.dataset.layeredCinema === 'on');
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-layered-cinema'],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!cinemaOn) {
      console.log('[layered-cinema] App: cinema mode off, clearing film');
      setFilm(null);
      return;
    }
    const videoId = extractYoutubeVideoId(window.location.href);
    console.log('[layered-cinema] App: cinema mode on, videoId=', videoId);
    if (!videoId) return;
    let cancelled = false;
    getFilmData(videoId).then((data) => {
      if (cancelled) return;
      console.log('[layered-cinema] App: film data result for', videoId, '->', data ? `"${data.title}" (${data.artifacts.length} artifacts)` : 'null');
      setFilm(data);
    });
    return () => {
      cancelled = true;
    };
  }, [cinemaOn]);

  useEffect(() => {
    if (!cinemaOn) return;
    const id = setInterval(() => {
      const video = document.querySelector('video');
      if (!video) return;
      setCurrentTime(video.currentTime);
      if (isFinite(video.duration)) setDuration(video.duration);
    }, 200);
    return () => clearInterval(id);
  }, [cinemaOn]);

  useEffect(() => {
    if (!cinemaOn) return;
    const player =
      document.querySelector<Element>('#movie_player') ?? document.querySelector('video');
    if (!player) return;
    const update = () => setVideoRect(player.getBoundingClientRect());
    update();
    const ro = new ResizeObserver(update);
    ro.observe(player);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [cinemaOn]);

  const handleSeek = useCallback((time: number) => {
    const video = document.querySelector('video');
    if (video) video.currentTime = time;
  }, []);

  if (!cinemaOn || !film || film.artifacts.length === 0) return null;

  function makeEvents(artifacts: typeof film.artifacts): ArtifactEvent[] {
    return artifacts.flatMap((artifact) => {
      const artifactIndex = film!.artifacts.indexOf(artifact);
      return artifact.timestamps.map((ts) => ({
        start: ts.time,
        end: ts.endTime ?? Math.min(ts.time + 10, duration > 0 ? duration : ts.time + 10),
        label: artifact.title + (ts.label ? ` — ${ts.label}` : ''),
        artifactIndex,
      }));
    });
  }

  function formatTag(tag: string): string {
    return tag.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  }

  const timelines =
    film.defaultTimelineTags.length > 0
      ? film.defaultTimelineTags.map((tag) => ({
          label: formatTag(tag),
          events: makeEvents(film.artifacts.filter((a) => a.tags.includes(tag))),
        }))
      : [{ label: '', events: makeEvents(film.artifacts) }];

  return (
    <div
      className="fixed z-[9999999] px-6 pt-3 pb-4 flex flex-col gap-2"
      style={
        videoRect
          ? { left: videoRect.left, top: videoRect.bottom, width: videoRect.width }
          : { left: 0, right: 0, top: 0 }
      }
    >
      {timelines.map(({ label, events }) => (
        <div key={label || '_all'} className="flex items-center gap-3">
          {label && (
            <span className="w-16 flex-none text-right font-[Cinzel] text-[9px] uppercase tracking-widest text-zinc-500">
              {label}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <Timeline
              duration={duration}
              currentTime={currentTime}
              events={events}
              onChange={handleSeek}
              onEventClick={(_ev, i) =>
                document.dispatchEvent(
                  new CustomEvent('layered-cinema:artifact-select', {
                    detail: { artifactIndex: events[i].artifactIndex },
                  }),
                )
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
