import { SearchBar } from '../SearchBar/SearchBar'
import './Header.css'

export interface HeaderProps {
  initialUsername?: string
  onSearch: (username: string) => void
}

export function Header({ initialUsername, onSearch }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__backdrop" aria-hidden="true" />
      <div className="header__inner">
        <div className="header__search">
          <SearchBar initialValue={initialUsername} onSubmit={onSearch} />
        </div>
      </div>
    </header>
  )
}
