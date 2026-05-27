import { useEffect, useState } from 'react'
import { GithubApiError, fetchRepos, fetchUser } from '../services/githubApi'
import type { GithubRepo, GithubUser } from '../types/github'

export type ProfileStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ProfileState {
  status: ProfileStatus
  user: GithubUser | null
  repos: GithubRepo[]
  error: string | null
}

const IDLE_STATE: ProfileState = {
  status: 'idle',
  user: null,
  repos: [],
  error: null,
}

const LOADING_STATE: ProfileState = {
  status: 'loading',
  user: null,
  repos: [],
  error: null,
}

export function useGithubProfile(username: string): ProfileState {
  const trimmed = username.trim()
  const [state, setState] = useState<ProfileState>(
    trimmed ? LOADING_STATE : IDLE_STATE,
  )
  const [lastUsername, setLastUsername] = useState(trimmed)

  // React-style derived state: when the consumer switches usernames we reset
  // synchronously during render rather than inside an effect. See
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (lastUsername !== trimmed) {
    setLastUsername(trimmed)
    setState(trimmed ? LOADING_STATE : IDLE_STATE)
  }

  useEffect(() => {
    if (!trimmed) return

    const controller = new AbortController()

    Promise.all([
      fetchUser(trimmed, controller.signal),
      fetchRepos(trimmed, controller.signal),
    ])
      .then(([user, repos]) => {
        if (controller.signal.aborted) return
        setState({ status: 'success', user, repos, error: null })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message =
          error instanceof GithubApiError
            ? error.message
            : 'Something went wrong fetching the profile'
        setState({ status: 'error', user: null, repos: [], error: message })
      })

    return () => controller.abort()
  }, [trimmed])

  return state
}
