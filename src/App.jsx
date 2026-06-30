import { useState } from 'react'
import GastosHipoteca from './GastosHipoteca.jsx'
import RentabilidadAlquiler from './RentabilidadAlquiler.jsx'

const TABS = [
  { id: 'gastos', label: 'Gastos de compra e hipoteca' },
  { id: 'rentabilidad', label: 'Rentabilidad para inversores' },
]

export default function App() {
  const [tab, setTab] = useState('gastos')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          background: '#111',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: 'var(--orange)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 15,
            color: '#fff',
            letterSpacing: -0.5,
            flexShrink: 0,
          }}
        >
          RK
        </div>
        <div style={{ marginRight: 'auto' }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>
            Calculadoras RK Palanca Fontestad
          </div>
          <div style={{ color: '#999', fontSize: 11, fontWeight: 400, marginTop: 1 }}>
            Comunitat Valenciana · Tipos vigentes junio 2026
          </div>
        </div>

        <nav style={{ display: 'flex', gap: 6 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? 'var(--orange)' : 'transparent',
                color: tab === t.id ? '#fff' : '#bbb',
                border: tab === t.id ? '1px solid var(--orange)' : '1px solid #333',
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'Montserrat, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        {tab === 'gastos' && <GastosHipoteca />}
        {tab === 'rentabilidad' && <RentabilidadAlquiler />}
      </main>

      <footer style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '20px', lineHeight: 1.6 }}>
        RK Palanca Fontestad by Realmark Inmobiliaria · L'Horta Nord, Valencia · Fundada en 1976
        <br />
        Tipos impositivos Comunitat Valenciana vigentes desde junio 2026. Datos orientativos, no vinculantes.
      </footer>
    </div>
  )
}
