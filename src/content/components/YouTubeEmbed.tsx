export interface YouTubeEmbedProps {
  videoId: string;
  start?: number;
  end?: number;
  title?: string;
  autoplay?: boolean;
}

function buildEmbedUrl(
  videoId: string,
  start?: number,
  end?: number,
  autoplay?: boolean,
): string {
  const params = new URLSearchParams();
  if (start != null) params.set('start', String(Math.floor(start)));
  if (end != null) params.set('end', String(Math.floor(end)));
  if (autoplay) params.set('autoplay', '1');
  params.set('rel', '0');
  const qs = params.toString();
  return `https://www.youtube.com/embed/${videoId}${qs ? `?${qs}` : ''}`;
}

export function extractVideoId(url: string): string | null {
  const youtuBe = url.match(/youtu\.be\/([\w-]+)/);
  if (youtuBe) return youtuBe[1];
  const watchV = url.match(/[?&]v=([\w-]+)/);
  if (watchV) return watchV[1];
  return null;
}

export default function YouTubeEmbed({
  videoId,
  start,
  end,
  title,
  autoplay,
}: YouTubeEmbedProps) {
  const src = buildEmbedUrl(videoId, start, end, autoplay);
  return (
    <iframe
      src={src}
      title={title ?? 'YouTube video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full border-0"
      style={{ background: '#000' }}
    />
  );
}
