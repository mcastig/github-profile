import { useState } from 'react'
import { Header } from './components/Header/Header'
import { Profile } from './components/Profile/Profile'
import { RepoList } from './components/RepoList/RepoList'
import { useGithubProfile } from './hooks/useGithubProfile'
import './App.css'

const DEFAULT_USERNAME = 'github'

function App() {
  const [username, setUsername] = useState(DEFAULT_USERNAME)
  const profile = useGithubProfile(username)

  return (
    <div className="app">
      <Header initialUsername={username} onSearch={setUsername} />

      <main className="app__main" aria-busy={profile.status === 'loading'}>
        {profile.status === 'loading' ? (
          <div className="app__status" role="status" aria-live="polite">
            <span className="app__spinner" aria-hidden="true" />
            <span>Fetching {username}…</span>
          </div>
        ) : null}

        {profile.status === 'error' ? (
          <div className="app__status app__status--error" role="alert">
            <strong>We couldn&apos;t load that profile.</strong>
            <span>{profile.error}</span>
          </div>
        ) : null}

        {profile.status === 'success' && profile.user ? (
          <>
            <Profile user={profile.user} />
            <RepoList repos={profile.repos} user={profile.user} />
          </>
        ) : null}
      </main>
    </div>
  )
}

export default App
