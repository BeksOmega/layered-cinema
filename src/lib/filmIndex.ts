import JSON5 from 'json5';
import { FilmSchema, type Film } from './schema';

const DATA_BASE_URL = 'https://beksomega.github.io/layered-cinema';

let indexFetch: Promise<Record<string, string>> | null = null;

function getIndex(): Promise<Record<string, string>> {
  if (!indexFetch) {
    const url = `${DATA_BASE_URL}/index.json`;
    console.log('[layered-cinema] Fetching film index:', url);
    indexFetch = fetch(url)
      .then((r) => {
        if (!r.ok) {
          console.error('[layered-cinema] Film index fetch failed:', r.status, r.statusText);
          return {} as Record<string, string>;
        }
        return r.json() as Promise<Record<string, string>>;
      })
      .then((index) => {
        console.log('[layered-cinema] Film index loaded, entries:', Object.keys(index).length, index);
        return index;
      })
      .catch((err) => {
        console.error('[layered-cinema] Film index fetch error:', err);
        return {} as Record<string, string>;
      });
  }
  return indexFetch;
}

export function extractYoutubeVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([\w-]+)/);
  const videoId = match?.[1] ?? null;
  console.log('[layered-cinema] extractYoutubeVideoId:', url, '->', videoId);
  return videoId;
}

export async function hasFilmData(videoId: string): Promise<boolean> {
  const index = await getIndex();
  const has = videoId in index;
  console.log('[layered-cinema] hasFilmData:', videoId, '->', has);
  return has;
}

export async function getFilmData(videoId: string): Promise<Film | null> {
  const index = await getIndex();
  const path = index[videoId];
  if (!path) {
    console.log('[layered-cinema] getFilmData: no path in index for', videoId);
    return null;
  }
  const url = `${DATA_BASE_URL}/${path}`;
  console.log('[layered-cinema] getFilmData: fetching', url);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error('[layered-cinema] getFilmData: fetch failed', res.status, res.statusText, url);
      return null;
    }
    const json = JSON5.parse(await res.text());
    const result = FilmSchema.safeParse(json);
    if (!result.success) {
      console.error('[layered-cinema] getFilmData: schema validation failed for', videoId, result.error.issues);
      return null;
    }
    console.log('[layered-cinema] getFilmData: loaded film', result.data.title, 'with', result.data.artifacts.length, 'artifacts');
    return result.data;
  } catch (err) {
    console.error('[layered-cinema] getFilmData: error fetching', url, err);
    return null;
  }
}
