import type { GithubUser } from '../../types/github'
import { StatBadge } from '../StatBadge/StatBadge'
import { formatCount } from '../../utils/format'
import './Profile.css'

export interface ProfileProps {
  user: GithubUser
}

export function Profile({ user }: ProfileProps) {
  return (
    <section className="profile" aria-labelledby="profile-name">
      <div className="profile__header">
        <a
          className="profile__avatar"
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${user.login} on GitHub`}
        >
          <img
            src={user.avatar_url}
            alt={`${user.login}'s avatar`}
            width={120}
            height={120}
            loading="eager"
            decoding="async"
          />
        </a>
        <div className="profile__stats" role="list">
          <StatBadge label="Followers" value={formatCount(user.followers)} />
          <StatBadge label="Following" value={formatCount(user.following)} />
          <StatBadge label="Location" value={user.location ?? 'Unknown'} />
        </div>
      </div>

      <div className="profile__identity">
        <h1 id="profile-name" className="profile__name">
          {user.name ?? user.login}
        </h1>
        {user.bio ? <p className="profile__bio">{user.bio}</p> : null}
      </div>
    </section>
  )
}
