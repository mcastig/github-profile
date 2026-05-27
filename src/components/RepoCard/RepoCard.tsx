import type { GithubRepo } from '../../types/github'
import { Icon } from '../Icon/Icon'
import { formatCount, formatRelativeUpdated } from '../../utils/format'
import './RepoCard.css'

export interface RepoCardProps {
  repo: GithubRepo
  /** Optional date injection — keeps relative-time output deterministic in tests. */
  now?: Date
}

export function RepoCard({ repo, now }: RepoCardProps) {
  const licenseLabel = repo.license?.spdx_id ?? null

  return (
    <a
      className="repo-card"
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open repository ${repo.name} on GitHub`}
    >
      <header className="repo-card__header">
        <h3 className="repo-card__name">{repo.name}</h3>
      </header>

      {repo.description ? (
        <p className="repo-card__description">{repo.description}</p>
      ) : (
        <p className="repo-card__description repo-card__description--empty">
          No description provided.
        </p>
      )}

      <footer className="repo-card__meta">
        {licenseLabel ? (
          <span className="repo-card__metric" title={`License: ${licenseLabel}`}>
            <Icon name="license" size={20} />
            <span>{licenseLabel}</span>
          </span>
        ) : null}
        <span className="repo-card__metric" title="Forks">
          <Icon name="forks" size={20} />
          <span>{formatCount(repo.forks_count)}</span>
        </span>
        <span className="repo-card__metric" title="Stars">
          <Icon name="star" size={20} />
          <span>{formatCount(repo.stargazers_count)}</span>
        </span>
        <span className="repo-card__updated">
          {formatRelativeUpdated(repo.updated_at, now)}
        </span>
      </footer>
    </a>
  )
}
