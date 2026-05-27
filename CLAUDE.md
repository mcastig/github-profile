# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # Vite dev server with HMR
npm run build          # tsc -b then production bundle
npm run lint           # ESLint (coverage/, node_modules/, dist/ are ignored)
npm run format         # Prettier write across src/
npm run test           # Vitest run (jsdom)
npm run test:watch     # Vitest watch
npm run test:coverage  # Vitest with v8 coverage (writes coverage/)
npx vitest run path/to/file.test.tsx -t "name"   # single test
```

## Architecture

Single-page React 19 + TypeScript app built on Vite 8. No router — `src/App.tsx` composes a `Header` and a `<main>` that switches on the profile fetch status.

### Data flow

User types a username → `App` stores it in state → `useGithubProfile(username)` fires `fetchUser` + `fetchRepos` in parallel through `services/githubApi.ts` and returns `{ status, user, repos, error }`. Each effect run owns an `AbortController` so previous in-flight requests cancel when the user searches again or the component unmounts. The hook follows the React derived-state pattern (`setState` _during render_ via a `lastUsername` sentinel) — calling `setState` synchronously inside `useEffect` is rejected by `react-hooks/set-state-in-effect`.

### Styling

`src/styles/tokens.css` defines every color and spacing/typography token. Component CSS reads only from those semantic variables (`--bg-surface`, `--text-primary`, etc.). The app ships in dark mode only — there's no runtime theming, so adding a new color is a single edit in `tokens.css`.

### Components

Each component lives in its own folder with three files (e.g. `RepoCard/RepoCard.tsx`, `RepoCard.css`, `RepoCard.test.tsx`). Class names follow BEM. SVGs are loaded as `<img src=…>` via the `Icon` wrapper — never inlined in JSX (project rule). Icon SVGs use `stroke="currentColor"` so the surrounding CSS controls their color.

### Testing

`src/test/setup.ts` registers `@testing-library/jest-dom` matchers and a `matchMedia` polyfill for jsdom. `src/test/fixtures.ts` exports `mockUser` / `mockRepos` used across component and hook tests. Global `fetch` is stubbed for the API client tests; the API service is `vi.spyOn`'d for hook/component tests so no network goes out. Vitest config lives in `vite.config.ts` (`defineConfig` from `vitest/config`, not `vite`).

### Important quirks

- `tsconfig.app.json` sets `verbatimModuleSyntax`, so types must be imported with `import type { … }`.
- ESLint is flat-config (`eslint.config.js`); add new globs to `globalIgnores([…])`.
- Hero background is set via CSS `background-image`, not `<img>` — two breakpoints swap between `hero.jpg` and `hero-sm.jpg`.
- All external links (repo cards, "view all repositories", avatar) carry `target="_blank" rel="noopener noreferrer"`.
- Public GitHub API is unauthenticated; the UI renders a specific message on 403 (rate limit) vs 404 (user not found) by inspecting `GithubApiError.status`.
