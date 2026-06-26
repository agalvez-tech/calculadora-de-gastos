import React from 'react'

export function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #e8e5e0',
      padding: '1.25rem',
      marginBottom: '1rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function SectionTitle({ icon, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontSize: 11, fontWeight: 700, color: '#cf731b',
      textTransform: 'uppercase', letterSpacing: '1.5px',
      marginBottom: '1rem',
    }}>
      {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
      {children}
    </div>
  )
}

export function Row({ cols = 2, children, style }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '0.85rem',
      marginBottom: '0.75rem',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function Field({ label, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{hint}</div>}
    </div>
  )
}

const inputBase = {
  height: 40, border: '1px solid #ddd', borderRadius: 8,
  padding: '0 10px', fontSize: 14, fontWeight: 600,
  fontFamily: 'inherit', background: '#fafaf8', color: '#1a1a1a',
  width: '100%', transition: 'border-color .15s',
  outline: 'none',
}

export function Input({ style, ...props }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <input
      {...props}
      style={{ ...inputBase, borderColor: focused ? '#cf731b' : '#ddd', ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export function Select({ style, ...props }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <select
      {...props}
      style={{ ...inputBase, fontSize: 12, fontWeight: 500, cursor: 'pointer', borderColor: focused ? '#cf731b' : '#ddd', ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

export function SuffixInput({ suffix, style, ...props }) {
  const [focused, setFocused] = React.useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        style={{ ...inputBase, paddingRight: 28, textAlign: 'right', borderColor: focused ? '#cf731b' : '#ddd', ...style }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <span style={{
        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
        fontSize: 12, fontWeight: 600, color: '#aaa', pointerEvents: 'none',
      }}>{suffix}</span>
    </div>
  )
}

export function Toggle({ active, onClick, children, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 20,
        border: active ? '1px solid #cf731b' : '1px solid #ddd',
        fontSize: 11, fontWeight: 600, cursor: 'pointer',
        background: active ? '#cf731b' : '#fafaf8',
        color: active ? '#fff' : '#666',
        transition: 'all .15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

export function Badge({ children, variant = 'default', style }) {
  const variants = {
    default: { bg: '#1a1a1a', color: '#cf731b' },
    green:   { bg: '#EAF3DE', color: '#27500A' },
    blue:    { bg: '#E6F1FB', color: '#0C447C' },
    amber:   { bg: '#FAEEDA', color: '#633806' },
    orange:  { bg: '#cf731b', color: '#fff' },
  }
  const v = variants[variant] || variants.default
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: '2px 7px',
      borderRadius: 8, background: v.bg, color: v.color,
      verticalAlign: 'middle', marginLeft: 5,
      ...style,
    }}>
      {children}
    </span>
  )
}

export function Divider({ style }) {
  return <div style={{ height: 1, background: '#e8e5e0', margin: '1rem 0', ...style }} />
}

export function InfoBox({ children, style }) {
  return (
    <div style={{
      fontSize: 10, color: '#888', lineHeight: 1.6,
      padding: '0.6rem 0.85rem',
      background: '#fafaf8', borderRadius: 8,
      borderLeft: '3px solid #cf731b',
      ...style,
    }}>
      {children}
    </div>
  )
}

export function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#fafaf8', borderRadius: 10, padding: '0.9rem 1rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: accent ? '#cf731b' : '#1a1a1a' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}
