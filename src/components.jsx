export function SectionTitle({ children, style = {} }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--orange)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        margin: '20px 0 10px',
        paddingBottom: 6,
        borderBottom: '1px solid var(--border)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function FieldGrid({ children, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
      {children}
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  height: 36,
  border: '0.5px solid var(--border-strong)',
  borderRadius: 'var(--radius)',
  padding: '0 10px',
  fontSize: 13,
  fontFamily: 'Montserrat, sans-serif',
  background: '#fafaf8',
  color: 'var(--text-primary)',
  outline: 'none',
  width: '100%',
}

export function NumberInput({ value, onChange, placeholder, min = 0, step = 1 }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
      placeholder={placeholder}
      min={min}
      step={step}
      style={inputStyle}
      onFocus={(e) => (e.target.style.borderColor = 'var(--orange)')}
      onBlur={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
    />
  )
}

export function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
      {children}
    </select>
  )
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontWeight: 500,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 16, height: 16, accentColor: 'var(--orange)' }}
      />
      {label}
    </label>
  )
}

export function KpiGrid({ children, cols = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, marginTop: 4 }}>
      {children}
    </div>
  )
}

const variantStyles = {
  default: { background: '#fff', border: '0.5px solid var(--border)', labelColor: 'var(--text-muted)', valueColor: 'var(--text-primary)', subColor: 'var(--text-muted)' },
  accent: { background: 'var(--orange)', border: '0.5px solid var(--orange)', labelColor: 'rgba(255,255,255,0.75)', valueColor: '#fff', subColor: 'rgba(255,255,255,0.7)' },
  dark: { background: '#111', border: '0.5px solid #111', labelColor: 'rgba(255,255,255,0.5)', valueColor: '#fff', subColor: 'rgba(255,255,255,0.7)' },
  green: { background: 'var(--green)', border: '0.5px solid var(--green)', labelColor: 'rgba(255,255,255,0.75)', valueColor: '#fff', subColor: 'rgba(255,255,255,0.7)' },
  amber: { background: 'var(--amber)', border: '0.5px solid var(--amber)', labelColor: 'rgba(255,255,255,0.8)', valueColor: '#fff', subColor: 'rgba(255,255,255,0.75)' },
  red: { background: 'var(--red)', border: '0.5px solid var(--red)', labelColor: 'rgba(255,255,255,0.75)', valueColor: '#fff', subColor: 'rgba(255,255,255,0.7)' },
}

export function Kpi({ label, value, sub, variant = 'default' }) {
  const s = variantStyles[variant] || variantStyles.default
  return (
    <div style={{ background: s.background, border: s.border, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: s.labelColor, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: s.valueColor, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: s.subColor, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function Signal({ level }) {
  const colors = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)' }
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        marginRight: 4,
        background: colors[level],
      }}
    />
  )
}

export function BreakdownTable({ rows }) {
  return (
    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginTop: 10 }}>
      <tbody>
        {rows.map((row, i) => {
          if (row.section) {
            return (
              <tr key={i}>
                <td
                  colSpan={2}
                  style={{
                    color: 'var(--orange)',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    paddingTop: 14,
                  }}
                >
                  {row.section}
                </td>
              </tr>
            )
          }
          const isLast = row.bold
          return (
            <tr key={i} style={{ borderBottom: isLast ? 'none' : '0.5px solid var(--border)' }}>
              <td
                style={{
                  padding: '7px 4px',
                  color: 'var(--text-secondary)',
                  fontWeight: isLast ? 600 : 400,
                  fontSize: row.small ? 11 : 12,
                  paddingLeft: row.indent ? 12 : 4,
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  padding: '7px 4px',
                  textAlign: 'right',
                  fontWeight: isLast ? 700 : 500,
                  color: row.small ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontSize: row.small ? 11 : 12,
                }}
              >
                {row.value}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function AlertBox({ children }) {
  return (
    <div
      style={{
        background: 'rgba(207,115,27,0.08)',
        border: '0.5px solid rgba(207,115,27,0.3)',
        borderRadius: 'var(--radius)',
        padding: '10px 12px',
        fontSize: 11,
        color: 'var(--text-secondary)',
        marginTop: 14,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  )
}

export function PrimaryButton({ onClick, children }) {
  return (
    <div style={{ textAlign: 'center', margin: '22px 0' }}>
      <button
        onClick={onClick}
        style={{
          background: 'var(--orange)',
          color: '#fff',
          border: 'none',
          padding: '12px 40px',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          fontWeight: 700,
          fontFamily: 'Montserrat, sans-serif',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {children}
      </button>
    </div>
  )
}
