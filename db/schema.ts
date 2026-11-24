import { bigint, boolean, index, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  body: text('body').notNull().default(''),
  status: text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------- home.savankong.com ----------
// Generic device registry: Ring cameras today, vacuum and lights later.
export const homeDevices = pgTable('home_devices', {
  id: text('id').primaryKey(), // "<provider>:<provider id>", e.g. "ring:123456"
  provider: text('provider').notNull(), // ring | ...
  kind: text('kind').notNull(), // camera | doorbell | vacuum | light
  name: text('name').notNull(),
  model: text('model'),
  online: boolean('online').notNull().default(true),
  battery: integer('battery'),
  capabilities: jsonb('capabilities').notNull().default([]), // ["record", "light", "siren"]
  meta: jsonb('meta').notNull().default({}),
  lastEventAt: timestamp('last_event_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// One recorded video per motion, doorbell press or manual "record now".
export const homeClips = pgTable(
  'home_clips',
  {
    id: serial('id').primaryKey(),
    deviceId: text('device_id').notNull().references(() => homeDevices.id, { onDelete: 'cascade' }),
    trigger: text('trigger').notNull(), // motion | ding | manual
    detail: text('detail'), // e.g. "human", "vehicle", "package"
    sourceEventId: text('source_event_id').unique(), // Ring ding id, for dedupe
    status: text('status').notNull().default('recording'), // recording | ready | failed
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    durationSeconds: integer('duration_seconds'),
    videoKey: text('video_key'),
    thumbKey: text('thumb_key'),
    sizeBytes: bigint('size_bytes', { mode: 'number' }),
    error: text('error'),
  },
  (t) => [index('home_clips_device_started_idx').on(t.deviceId, t.startedAt), index('home_clips_started_idx').on(t.startedAt)],
)

// Work the dashboard asks the recorder to do (record now, light on, ...).
export const homeCommands = pgTable('home_commands', {
  id: serial('id').primaryKey(),
  deviceId: text('device_id').notNull().references(() => homeDevices.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  payload: jsonb('payload'), // e.g. the browser's WebRTC offer for live view
  result: jsonb('result'), // e.g. Ring's WebRTC answer
  status: text('status').notNull().default('pending'), // pending | running | done | failed
  error: text('error'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
})

// Small key/value store: the rotating Ring refresh token, recorder heartbeat.
export const homeKv = pgTable('home_kv', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
