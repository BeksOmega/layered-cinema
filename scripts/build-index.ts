import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import JSON5 from 'json5'
import { FilmSchema } from '../src/lib/schema'

const DATA_DIR = resolve(process.cwd(), 'data')

function extractYoutubeId(url: string): string | null {
  const short = url.match(/youtu\.be\/([\w-]+)/)
  if (short) return short[1]
  const long = new URL(url).searchParams.get('v')
  return long ?? null
}

const index: Record<string, string> = {}
let skipped = 0

for (const file of readdirSync(DATA_DIR).filter(f => f.endsWith('.json5'))) {
  let raw: unknown
  try {
    raw = JSON5.parse(readFileSync(join(DATA_DIR, file), 'utf-8'))
  } catch {
    console.warn(`  skipping ${file}: parse error`)
    skipped++
    continue
  }

  const result = FilmSchema.safeParse(raw)
  if (!result.success) {
    console.warn(`  skipping ${file}: invalid schema`)
    skipped++
    continue
  }

  const id = extractYoutubeId(result.data.youtubeLink)
  if (!id) {
    console.warn(`  skipping ${file}: could not extract YouTube ID from ${result.data.youtubeLink}`)
    skipped++
    continue
  }

  index[id] = file
}

writeFileSync(join(DATA_DIR, 'index.json'), JSON.stringify(index, null, 2) + '\n')

const count = Object.keys(index).length
console.log(`Wrote index.json — ${count} film${count === 1 ? '' : 's'}${skipped ? `, ${skipped} skipped` : ''}`)
