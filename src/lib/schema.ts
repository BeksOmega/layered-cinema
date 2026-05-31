import { z } from 'zod'

const youtubeLinkSchema = z
  .string()
  .url()
  .refine(url => /youtu\.be\/[\w-]+/.test(url), {
    message: 'Must be a youtu.be share link, e.g. https://youtu.be/ID?t=123',
  })

export const VideoSchema = z.object({
  youtubeLink: youtubeLinkSchema,
  duration: z.number().int().positive().optional(),
  // optional: what kind of extra content this is
  type: z.enum(['interview', 'bts', 'featurette', 'press']).optional(),
})

export const LinkSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  type: z.enum(['press', 'article', 'social', 'other']).optional(),
})

const kebab = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Must be lowercase kebab-case (letters, numbers, hyphens only)')

export const TimestampSchema = z
  .object({
    time: z.number().nonnegative(),
    endTime: z.number().positive().optional(),
    label: z.string().optional(),
  })
  .refine(t => t.endTime == null || t.endTime > t.time, {
    message: 'endTime must be greater than time',
  })

export const ArtifactSchema = z.object({
  id: kebab,
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(kebab).default([]),
  timestamps: z.array(TimestampSchema).default([]),
  videos: z.array(VideoSchema).default([]),
  links: z.array(LinkSchema).default([]),
})

export const FilmSchema = z.object({
  id: kebab,
  title: z.string().min(1),
  youtubeLink: z.string().url().refine(
    url => /youtube\.com\/watch|youtu\.be\//.test(url),
    { message: 'Must be a YouTube link, e.g. https://youtu.be/ID or https://www.youtube.com/watch?v=ID' }
  ),
  artifacts: z.array(ArtifactSchema).default([]),
})

export type Video = z.infer<typeof VideoSchema>
export type Link = z.infer<typeof LinkSchema>
export type Timestamp = z.infer<typeof TimestampSchema>
export type Artifact = z.infer<typeof ArtifactSchema>
export type Film = z.infer<typeof FilmSchema>
