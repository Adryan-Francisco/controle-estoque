import { useState } from 'react'

const StatCard = ({ title, value, icon: Icon, color, description, gradient }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="card animate-fade-in"
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isHovered ? 'var(--shadow-xl)' : 'var(--shadow-md)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        transition: 'var(--transition-normal)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div>
          <p style={{
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#64748b',
            margin: '0 0 0.25rem 0'
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>
            {isNaN(value) ? '0' : value}
          </p>
        </div>
        <div style={{
          padding: '0.75rem',
          background: gradient || `linear-gradient(135deg, ${color}, ${color}dd)`,
          borderRadius: '0.75rem',
          boxShadow: `0 4px 12px ${color}30`
        }}>
          <Icon style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
        </div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        color: '#64748b'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: color,
          borderRadius: '50%',
          marginRight: '0.5rem'
        }}></div>
        {description}
      </div>
    </div>
  )
}

export default StatCard
