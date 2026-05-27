import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Icon } from '../Icon/Icon'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { fetchUser } from '../../services/githubApi'
import type { GithubUser } from '../../types/github'
import './SearchBar.css'

export interface SearchBarProps {
  initialValue?: string
  onSubmit: (username: string) => void
}

const MIN_QUERY_LENGTH = 2
const PREVIEW_DEBOUNCE_MS = 350

export function SearchBar({ initialValue = '', onSubmit }: SearchBarProps) {
  const [value, setValue] = useState(initialValue)
  const [preview, setPreview] = useState<GithubUser | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const debouncedValue = useDebouncedValue(value, PREVIEW_DEBOUNCE_MS)
  const inputId = useId()
  const hintId = `${inputId}-hint`
  const previewId = `${inputId}-preview`

  useEffect(() => {
    const trimmed = debouncedValue.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) return

    const controller = new AbortController()
    fetchUser(trimmed, controller.signal)
      .then((user) => {
        if (!controller.signal.aborted) setPreview(user)
      })
      .catch(() => {
        if (!controller.signal.aborted) setPreview(null)
      })

    return () => controller.abort()
  }, [debouncedValue])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value)
    setPreviewVisible(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setPreviewVisible(false)
  }

  function handlePreviewSelect() {
    if (!preview) return
    setValue(preview.login)
    onSubmit(preview.login)
    setPreviewVisible(false)
  }

  // Derived during render so a too-short input hides any previously-fetched
  // preview without needing setState inside the effect.
  const showPreview =
    previewVisible &&
    preview !== null &&
    value.trim().length >= MIN_QUERY_LENGTH

  return (
    <div className="search-bar-wrapper">
      <form
        className="search-bar"
        role="search"
        aria-label="Search GitHub users"
        aria-controls={previewId}
        aria-expanded={showPreview}
        onSubmit={handleSubmit}
      >
        <label htmlFor={inputId} className="search-bar__label">
          Search GitHub users
        </label>
        <span className="search-bar__icon" aria-hidden="true">
          <Icon name="search" size={20} />
        </span>
        <input
          id={inputId}
          type="search"
          name="username"
          autoComplete="off"
          spellCheck={false}
          className="search-bar__input"
          placeholder="username"
          aria-describedby={hintId}
          value={value}
          onChange={handleChange}
        />
        <span id={hintId} className="search-bar__label">
          Press Enter to search
        </span>
      </form>

      {showPreview && preview ? (
        <button
          id={previewId}
          type="button"
          className="search-bar__preview"
          onClick={handlePreviewSelect}
          aria-label={`Open profile for ${preview.name ?? preview.login}`}
        >
          <img
            src={preview.avatar_url}
            alt=""
            className="search-bar__preview-avatar"
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
          />
          <span className="search-bar__preview-text">
            <span className="search-bar__preview-name">
              {preview.name ?? preview.login}
            </span>
            {preview.bio ? (
              <span className="search-bar__preview-bio">{preview.bio}</span>
            ) : null}
          </span>
        </button>
      ) : null}
    </div>
  )
}
