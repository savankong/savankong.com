'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Post, PostStatus } from '@/lib/posts'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'savankong2026'
const SAVED_PW_KEY = 'savankong_admin_pw'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function blankPost(): Post {
  return {
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    status: 'draft',
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,.15)',
  fontSize: '.9rem',
  background: '#0a0d16',
  color: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font-inter), sans-serif',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '.7rem',
  fontWeight: 800,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: '#8b93a8',
  marginBottom: 6,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const [remember, setRemember] = useState(true)

  const check = () => {
    if (pw === ADMIN_PASSWORD) {
      if (remember) localStorage.setItem(SAVED_PW_KEY, pw)
      else localStorage.removeItem(SAVED_PW_KEY)
      onLogin()
    } else {
      setErr(true)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05060a',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(0,212,255,.25)',
          borderRadius: 12,
          padding: '48px 40px',
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          background: '#0a0d16',
        }}
      >
        <h2 style={{ marginBottom: 8, font: '400 28px var(--font-anton), sans-serif', color: '#fff', textTransform: 'uppercase' }}>
          Admin
        </h2>
        <p style={{ color: '#8b93a8', fontSize: '.85rem', marginBottom: 32 }}>Post manager</p>
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={e => {
            setPw(e.target.value)
            setErr(false)
          }}
          onKeyDown={e => e.key === 'Enter' && check()}
          style={{ ...inputStyle, marginBottom: 12, borderColor: err ? '#ef4444' : 'rgba(255,255,255,.15)' }}
          autoFocus
        />
        {err && <p style={{ color: '#ef4444', fontSize: '.8rem', marginBottom: 12 }}>Incorrect password</p>}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 20,
            cursor: 'pointer',
            fontSize: '.82rem',
            color: '#8b93a8',
          }}
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: '#00d4ff', cursor: 'pointer' }}
          />
          Keep me logged in
        </label>
        <button onClick={check} className="pill-filled" style={{ width: '100%', border: 'none', cursor: 'pointer' }}>
          Enter
        </button>
      </div>
    </div>
  )
}

function PostForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Post
  onSave: (p: Post) => void
  onCancel: () => void
}) {
  const [post, setPost] = useState<Post>(initial)
  const isNew = !initial.createdAt

  return (
    <div style={{ maxWidth: 760 }}>
      <Field label="Title">
        <input
          style={inputStyle}
          value={post.title}
          onChange={e => {
            const title = e.target.value
            setPost(p => ({ ...p, title, slug: isNew && !p.slug ? slugify(title) : p.slug }))
          }}
        />
      </Field>
      <Field label="Slug">
        <input
          style={inputStyle}
          value={post.slug}
          onChange={e => setPost(p => ({ ...p, slug: slugify(e.target.value) }))}
        />
      </Field>
      <Field label="Excerpt">
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
          value={post.excerpt}
          onChange={e => setPost(p => ({ ...p, excerpt: e.target.value }))}
        />
      </Field>
      <Field label="Body (blank line = new paragraph)">
        <textarea
          style={{ ...inputStyle, minHeight: 320, resize: 'vertical', lineHeight: 1.6 }}
          value={post.body}
          onChange={e => setPost(p => ({ ...p, body: e.target.value }))}
        />
      </Field>
      <div style={{ display: 'flex', gap: 18 }}>
        <Field label="Status">
          <select
            style={inputStyle}
            value={post.status}
            onChange={e => setPost(p => ({ ...p, status: e.target.value as PostStatus }))}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <Field label="Published Date">
          <input
            type="date"
            style={inputStyle}
            value={post.publishedAt ? post.publishedAt.slice(0, 10) : ''}
            onChange={e =>
              setPost(p => ({ ...p, publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null }))
            }
          />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
        <button
          onClick={() => onSave(post)}
          className="pill-filled"
          style={{ border: 'none', cursor: 'pointer' }}
          disabled={!post.title || !post.slug}
        >
          Save
        </button>
        <button onClick={onCancel} className="pill-outline" style={{ border: '2px solid rgba(255,255,255,.3)', background: 'none', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function AdminClient() {
  const [authed, setAuthed] = useState(false)
  const [checked, setChecked] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Post | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(SAVED_PW_KEY)
    if (saved === ADMIN_PASSWORD) setAuthed(true)
    setChecked(true)
  }, [])

  const loadPosts = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/posts')
    const data = await res.json()
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authed) loadPosts()
  }, [authed, loadPosts])

  const handleSave = async (post: Post) => {
    const isNew = !post.createdAt
    const res = await fetch(isNew ? '/api/posts' : `/api/posts/${editing?.slug}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    })
    if (res.ok) {
      setEditing(null)
      loadPosts()
    } else {
      alert('Failed to save post')
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' })
    if (res.ok) loadPosts()
    else alert('Failed to delete post')
  }

  if (!checked) return null

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '48px 56px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 40 }}>
        <h1 style={{ font: '400 40px var(--font-anton), sans-serif', color: '#fff', textTransform: 'uppercase', margin: 0 }}>
          Posts
        </h1>
        {!editing && (
          <button onClick={() => setEditing(blankPost())} className="pill-filled" style={{ border: 'none', cursor: 'pointer' }}>
            + New Post
          </button>
        )}
      </div>

      {editing ? (
        <PostForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      ) : loading ? (
        <p style={{ color: '#8b93a8' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {posts.length === 0 && <p style={{ color: '#8b93a8' }}>No posts yet.</p>}
          {posts.map(post => (
            <div
              key={post.slug}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                background: '#0a0d16',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 4,
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      font: '800 10px var(--font-inter), sans-serif',
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: post.status === 'published' ? '#00d4ff' : '#8b93a8',
                    }}
                  >
                    {post.status}
                  </span>
                  {post.publishedAt && (
                    <span style={{ fontSize: '.72rem', color: '#8b93a8' }}>
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div style={{ font: '400 20px var(--font-anton), sans-serif', color: '#fff', textTransform: 'uppercase' }}>
                  {post.title}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flex: 'none' }}>
                <button
                  onClick={() => setEditing(post)}
                  className="pill-outline"
                  style={{ border: '2px solid rgba(255,255,255,.3)', background: 'none', cursor: 'pointer', padding: '8px 18px' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.slug)}
                  style={{
                    border: '2px solid rgba(239,68,68,.4)',
                    color: '#ef4444',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '8px 18px',
                    borderRadius: 4,
                    font: '800 12px var(--font-inter), sans-serif',
                    textTransform: 'uppercase',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
