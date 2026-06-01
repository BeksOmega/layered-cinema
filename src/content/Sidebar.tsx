import { useState, useEffect, useCallback } from 'react';
import CinemaModeToggle from './CinemaModeToggle';
import Details from './components/Details';
import { getFilmData } from '@/lib/filmIndex';
import type { Film, Artifact } from '@/lib/schema';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface Props {
  videoId: string;
}

export default function Sidebar({ videoId }: Props) {
  const [cinemaOn, setCinemaOn] = useState(
    () => document.documentElement.dataset.layeredCinema === 'on',
  );
  const [film, setFilm] = useState<Film | null>(null);
  const [artifact, setArtifact] = useState<Artifact | null>(null);

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
      setFilm(null);
      setArtifact(null);
      return;
    }
    let cancelled = false;
    getFilmData(videoId).then((data) => {
      if (cancelled) return;
      setFilm(data);
      setArtifact(data?.artifacts[0] ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [cinemaOn, videoId]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { artifactIndex } = (e as CustomEvent<{ artifactIndex: number }>).detail;
      setArtifact((prev) => {
        const next = film?.artifacts[artifactIndex] ?? null;
        return next ?? prev;
      });
    };
    document.addEventListener('layered-cinema:artifact-select', handler);
    return () => document.removeEventListener('layered-cinema:artifact-select', handler);
  }, [film]);

  const handleTimestampClick = useCallback((ts: { time: string }) => {
    const parts = ts.time.split(':').map(Number);
    const seconds =
      parts.length === 3
        ? parts[0] * 3600 + parts[1] * 60 + parts[2]
        : parts[0] * 60 + parts[1];
    const video = document.querySelector('video');
    if (video) video.currentTime = seconds;
  }, []);

  return (
    <div>
      <CinemaModeToggle videoId={videoId} />
      {cinemaOn && artifact && (
        <Details
          inline
          title={artifact.title}
          description={artifact.description ?? ''}
          timestamps={artifact.timestamps.map((ts) => ({ time: formatTime(ts.time) }))}
          tags={artifact.tags}
          onTimestampClick={handleTimestampClick}
        />
      )}
    </div>
  );
}
