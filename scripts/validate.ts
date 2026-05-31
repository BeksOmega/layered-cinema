import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import JSON5 from 'json5'
import { FilmSchema } from '../src/lib/schema'
import type { ZodError } from 'zod'

const DATA_DIR = resolve(process.cwd(), 'data')

function formatZodError(error: ZodError): string {
  return error.issues
    .map(e => {
      const path = e.path.length ? `[${e.path.join('.')}] ` : ''
      return `    ${path}${e.message}`
    })
    .join('\n')
}

let errors = 0
let ok = 0

function pass(label: string) {
  console.log(`  ✓  ${label}`)
  ok++
}

function fail(label: string, message: string) {
  console.error(`  ✗  ${label}`)
  console.error(message)
  errors++
}

const files = existsSync(DATA_DIR)
  ? readdirSync(DATA_DIR).filter(f => f.endsWith('.json5')).sort()
  : []

for (const file of files) {
  const filePath = join(DATA_DIR, file)
  let raw: unknown

  try {
    raw = JSON5.parse(readFileSync(filePath, 'utf-8'))
  } catch (e) {
    fail(file, `    Parse error: ${e}`)
    continue
  }

  const result = FilmSchema.safeParse(raw)
  if (!result.success) {
    fail(file, formatZodError(result.error))
    continue
  }

  const film = result.data
  pass(`${film.title} — ${film.artifacts.length} artifacts`)
}

console.log(`\n${ok + errors} checked — ${ok} passed, ${errors} failed\n`)
process.exit(errors > 0 ? 1 : 0)
