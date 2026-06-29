import { Search } from 'lucide-react'

const SearchBar = ({ placeholder = 'Search...', value, onChange, onSearch }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) onSearch(e.target.value)
  }

  return (
    <div style={{ position: 'relative' }}>
      <Search
        size={14}
        style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 12px 8px 32px',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--text-h)',
          background: 'var(--surface)',
          outline: 'none',
          fontFamily: 'var(--sans)',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

export { SearchBar }
export default SearchBar
