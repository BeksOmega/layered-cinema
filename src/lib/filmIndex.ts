import { FilmSchema, type Film } from './schema';

const DATA_BASE_URL = 'https://beksomega.github.io/layered-cinema';

let indexFetch: Promise<Record<string, string>> | null = null;

function getIndex(): Promise<Record<string, string>> {
  if (!indexFetch) {
    indexFetch = fetch(`${DATA_BASE_URL}/index.json`)
      .then((r) => r.json() as Promise<Record<string, string>>)
      .catch(() => ({}) as Record<string, string>);
  }
  return indexFetch;
}

export function extractYoutubeVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([\w-]+)/);
  return match?.[1] ?? null;
}

export async function hasFilmData(videoId: string): Promise<boolean> {
  const index = await getIndex();
  return videoId in index;
}

export async function getFilmData(videoId: string): Promise<Film | null> {
  const index = await getIndex();
  const path = index[videoId];
  if (!path) return null;
  try {
    const res = await fetch(`${DATA_BASE_URL}/${path}`);
    if (!res.ok) return null;
    const result = FilmSchema.safeParse(await res.json());
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
