# GitHub Profile · Cosmic Explorer

A responsive React + TypeScript application for searching any GitHub user and
exploring their public repositories. Built against the
[devChallenges.io GitHub Profile](https://devchallenges.io/) brief, with a
cosmic, space-themed dark UI.

![Desktop preview](./design/Desktop_1350px.jpg)

## Features

- 🔭 **Search any GitHub user** by username — submit the form to fetch their
  profile and four most recently updated public repositories.
- 👤 **Profile summary** with avatar, name, bio, follower / following counts,
  and location, formatted with locale-aware thousands separators.
- 📦 **Repository cards** showing license (when present), forks, stars, and a
  relative "updated N days ago" timestamp. Selecting a card opens the repo on
  GitHub in a new tab.
- 📱 **Fully responsive** — single-column on mobile (≤ 900 px wide), two-column
  on tablet / desktop. Hero, padding, and stat layout adapt at the breakpoints
  documented in the design (`412 px`, `1024 px`, `1350 px`).
- ♿ **Accessible** — labelled search input, ARIA live region for loading and
  errors, semantic landmarks (`header` / `main`), focus-visible
  outlines, and `prefers-reduced-motion` respect.
- 🛡️ **No secrets**: the app calls the public, unauthenticated
  `https://api.github.com` endpoints only. There is no `.env` file and nothing
  to leak.

## Tech stack

| Concern       | Choice                                              |
| ------------- | --------------------------------------------------- |
| Framework     | React 19 + TypeScript                               |
| Build / dev   | Vite 8                                              |
| Styling       | Hand-written CSS, BEM naming, CSS custom properties |
| Data fetching | Native `fetch` + `AbortController`                  |
| State         | React `useState` / `useEffect` hooks (no libraries) |
| Testing       | Vitest + React Testing Library + jsdom              |
| Tooling       | ESLint (typescript-eslint, react-hooks) + Prettier  |

## Project structure

```
src/
├── App.tsx               Top-level composition + error / loading / empty states
├── App.css
├── main.tsx              React 19 entry — createRoot + StrictMode
├── index.css             Global resets, body styles
├── styles/
│   └── tokens.css        Design tokens (palette, type scale, spacing, motion)
├── assets/
│   ├── icons/            SVG icons (currentColor) — never inlined in JSX
│   └── images/           Hero artwork (desktop + mobile)
├── components/
│   ├── Header/           Hero band w/ search bar
│   ├── SearchBar/        Username input + submit
│   ├── Profile/          Avatar, identity, bio
│   ├── StatBadge/        Reusable "label | value" badge
│   ├── RepoList/         Grid of cards + "view all" link + empty state
│   ├── RepoCard/         Single repository card (gradient, metrics)
│   └── Icon/             <img>-based icon wrapper
├── hooks/
│   ├── useGithubProfile  Fetches user + repos w/ abort on unmount or change
│   └── useDebouncedValue Generic debounce (kept for future live-search usage)
├── services/
│   └── githubApi.ts      Thin REST wrapper + typed GithubApiError
├── types/
│   └── github.ts         Minimal subset of the GitHub REST schema we consume
├── utils/
│   └── format.ts         Number + relative-time formatters
└── test/
    ├── setup.ts          Vitest global setup (jest-dom matchers, matchMedia)
    └── fixtures.ts       Reusable mock GithubUser / GithubRepo
```

Each component owns its own folder with the same name for `.tsx`, `.test.tsx`,
and `.css` — matching the structure called out in the brief.

## Architecture notes

### Data layer

`services/githubApi.ts` exposes two functions, `fetchUser` and `fetchRepos`,
both of which accept an `AbortSignal`. A custom `GithubApiError` class carries
the HTTP status so the UI can distinguish 404 ("user not found") from 403
("rate limit") from generic failures. The repositories endpoint is requested
with `?sort=updated&per_page=4` to match the design's four-card grid.

### `useGithubProfile`

`hooks/useGithubProfile.ts` orchestrates the two requests in parallel via
`Promise.all`. Returning a state machine (`'idle' | 'loading' | 'success' |
'error'`) lets the UI branch cleanly. The hook follows the React
[derived-state pattern](https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes):
when the username changes, the reset to `loading` happens _during render_
rather than inside an effect — this is what the `react-hooks/set-state-in-effect`
rule enforces in the current ESLint setup. Each effect run owns an
`AbortController` so navigations away from a query never set state on an
unmounted component.

### Styling

`styles/tokens.css` is the only place that declares color values. Components
read semantic variables (e.g. `--bg-surface`, `--text-primary`) instead of raw
hex codes, so a redesign means editing one file. The app ships in dark mode
only — there's no runtime theme switching to maintain.

### CSS conventions

- BEM naming throughout (`.repo-card__metric`, `.search-bar--focused`).
- One CSS file per component, scoped via the component's class prefix.
- Variables, never literal colors. Spacing comes from `--space-N` tokens.
- Mobile-friendly first; responsive overrides via `@media (max-width: …)`.
- Animations honor `prefers-reduced-motion` (zeroed in `index.css`).

### Accessibility

- The avatar, repository card, and "view all repositories" links carry
  `target="_blank"` _and_ `rel="noopener noreferrer"`.
- Search field has a visually-hidden `<label>` for screen readers.
- Loading state lives in a `role="status"` region; errors in `role="alert"`.

## Getting started

```bash
npm install      # one-time
npm run dev      # Vite dev server (default http://localhost:5173)
```

### All available scripts

| Command                 | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `npm run dev`           | Start the Vite dev server with HMR                          |
| `npm run build`         | Type-check (`tsc -b`) and build for production              |
| `npm run preview`       | Serve the production build locally                          |
| `npm run lint`          | ESLint (errors fail; coverage / node_modules ignored)       |
| `npm run format`        | Run Prettier on `src/`                                      |
| `npm run format:check`  | CI-friendly Prettier diff check                             |
| `npm run test`          | Run the Vitest suite once (jsdom environment)               |
| `npm run test:watch`    | Re-run tests on file changes                                |
| `npm run test:coverage` | Generate v8 coverage (text + HTML report under `coverage/`) |

## Testing

The suite covers every component, hook, and utility. The current report:

```
 Test Files  12 passed (12)
      Tests  54 passed (54)

 % Coverage report from v8
 All files          |     100 |    98.41 |     100 |     100 |
```

Statements / functions / lines are at 100%; the only uncovered branch is one
defensive `aborted` guard inside `useGithubProfile` that's exercised but not
asserted on after unmount.

`fetch` is stubbed at the global level for the API client tests; `useGithubProfile`
and the App-level tests `vi.spyOn` the API service so no network goes out.

## API

The app uses the public REST endpoints:

```
GET https://api.github.com/users/:username
GET https://api.github.com/users/:username/repos?sort=updated&per_page=4
```

No tokens are sent. Unauthenticated GitHub clients are rate-limited at ~60
requests per hour per IP; if you exceed that the UI displays a "GitHub API rate
limit reached" message rather than a generic failure.

## Credits

- Challenge & assets — [devChallenges.io](https://devchallenges.io/).
- Font — [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) via
  Google Fonts.
- Hero artwork — provided in `/resources` from the challenge bundle.
