'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'

export function AvatarUpload({ currentUrl }: { currentUrl: string | null }) {
  const [url, setUrl] = useState(currentUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/account/avatar', { method: 'POST', body: form })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Upload failed')
    } else {
      setUrl(json.url)
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-16 h-16 rounded-full overflow-hidden bg-muted border hover:opacity-80 transition-opacity flex-shrink-0"
        disabled={loading}
        title="Change profile picture"
      >
        {url ? (
          <Image src={url} alt="Profile picture" fill className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-2xl text-muted-foreground">
            ?
          </span>
        )}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs">
            ...
          </span>
        )}
      </button>
      <div className="text-sm text-muted-foreground">
        <button onClick={() => inputRef.current?.click()} className="text-primary underline" disabled={loading}>
          {url ? 'Change photo' : 'Upload photo'}
        </button>
        <p className="text-xs mt-0.5">JPG, PNG or GIF · max 5 MB</p>
        {error && <p className="text-destructive text-xs mt-1">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
