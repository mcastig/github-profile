import type { GithubRepo, GithubUser } from '../../types/github'
import { RepoCard } from '../RepoCard/RepoCard'
import './RepoList.css'

export interface RepoListProps {
  repos: GithubRepo[]
  user: GithubUser
  now?: Date
}

export function RepoList({ repos, user, now }: RepoListProps) {
  if (repos.length === 0) {
    return (
      <section className="repo-list" aria-labelledby="repo-list-heading">
        <h2 id="repo-list-heading" className="repo-list__heading sr-only">
          Repositories
        </h2>
        <p className="repo-list__empty">
          {user.login} doesn&apos;t have any public repositories yet.
        </p>
      </section>
    )
  }

  return (
    <section className="repo-list" aria-labelledby="repo-list-heading">
      <h2 id="repo-list-heading" className="repo-list__heading sr-only">
        Repositories
      </h2>
      <ul className="repo-list__grid">
        {repos.map((repo) => (
          <li key={repo.id} className="repo-list__item">
            <RepoCard repo={repo} now={now} />
          </li>
        ))}
      </ul>

      {user.public_repos > repos.length ? (
        <a
          className="repo-list__view-all"
          href={`${user.html_url}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View all repositories
        </a>
      ) : null}
    </section>
  )
}
