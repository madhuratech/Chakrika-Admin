const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  const pulse = {
    background: 'var(--surface-3)',
    borderRadius: 6,
    animation: 'skeleton-pulse 1.4s ease-in-out infinite',
  }

  const renderCard = () => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ ...pulse, width: 36, height: 36, borderRadius: 9, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...pulse, height: 12, marginBottom: 6, width: '55%' }} />
          <div style={{ ...pulse, height: 10, width: '35%' }} />
        </div>
      </div>
      <div style={{ ...pulse, height: 10, marginBottom: 6 }} />
      <div style={{ ...pulse, height: 10, width: '70%' }} />
    </div>
  )

  const renderRow = () => (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{ ...pulse, width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ ...pulse, height: 11, marginBottom: 6, width: '40%' }} />
        <div style={{ ...pulse, height: 10, width: '60%' }} />
      </div>
      <div style={{ ...pulse, height: 20, width: 60, borderRadius: 99 }} />
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: type === 'card' ? 16 : 8 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{type === 'card' ? renderCard() : renderRow()}</div>
        ))}
      </div>
    </>
  )
}

export default LoadingSkeleton