import React from 'react'

export default function Header() {
  return (
    <header style={{
      background: '#1a1a1a',
      padding: '1.25rem 1.5rem 1rem',
      borderRadius: '0 0 18px 18px',
      marginBottom: '1.5rem',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: '#cf731b', width: 40, height: 40, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: -1, flexShrink: 0,
          }}>RK</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: 0.2 }}>
              PALANCA FONTESTAD
            </div>
            <div style={{ fontSize: 10, color: '#777', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
              by Realmark Inmobiliaria
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#cf731b' }}>Calculadora de Gastos</div>
          <div style={{ fontSize: 10, color: '#666' }}>Comunitat Valenciana · Jun 2026</div>
        </div>
      </div>
    </header>
  )
}
