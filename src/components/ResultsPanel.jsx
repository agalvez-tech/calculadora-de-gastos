import React from 'react'
import { fmtEur, fmtPct } from '../utils.js'

export default function ResultsPanel({ partidas, totalComprador, precio }) {
  if (!partidas || partidas.length === 0) return null

  const pagaProp = partidas.filter(p => !p.esBanco)
  const pagaBanco = partidas.filter(p => p.esBanco)

  return (
    <>
      <div style={{
        background: '#1a1a1a', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#cf731b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: '0.9rem' }}>
          💳 Gastos totales de compra
        </div>

        {pagaProp.map((p, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', borderBottom: '1px solid #2e2e2e',
          }}>
            <div>
              <div style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}
                dangerouslySetInnerHTML={{ __html: p.nombre }} />
              <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{p.detalle}</div>
            </div>
            <div style={{ fontSize: 13, color: p.esInmo ? '#cf731b' : '#fff', fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 12 }}>
              {fmtEur(p.importe)}
            </div>
          </div>
        ))}

        {pagaBanco.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: '#444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '10px 0 6px' }}>
              A cargo del banco (Ley 5/2019)
            </div>
            {pagaBanco.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 0', borderBottom: '1px solid #252525',
              }}>
                <div style={{ fontSize: 11, color: '#444' }}>{p.nombre}</div>
                <div style={{ fontSize: 11, color: '#444' }}>({fmtEur(p.importe)})</div>
              </div>
            ))}
          </>
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.9rem 1rem', background: '#cf731b', borderRadius: 10, marginTop: '0.9rem',
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>TOTAL A CARGO DEL COMPRADOR</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {fmtPct(totalComprador, precio)} sobre el precio de compra
            </div>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{fmtEur(totalComprador)}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#cf731b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.9rem' }}>
          📊 Distribución del gasto
        </div>
        {pagaProp.map((p, i) => {
          const w = Math.max(1, Math.round((p.importe / totalComprador) * 100))
          const nombre = p.nombre.replace(/<[^>]+>/g, '').substring(0, 28)
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#888', minWidth: 120, flexShrink: 0 }}>{nombre}</span>
              <div style={{ flex: 1, height: 5, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: w + '%', height: '100%', background: p.color || '#cf731b', borderRadius: 3, transition: 'width .35s' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#1a1a1a', minWidth: 32, textAlign: 'right' }}>{w}%</span>
            </div>
          )
        })}
      </div>

      <div style={{
        background: '#fff', border: '1px solid #e8e5e0', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#cf731b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.9rem' }}>
          💰 Desembolso total estimado
        </div>
        {[
          { label: 'Precio de compraventa', val: fmtEur(precio), muted: false },
          { label: 'Gastos a tu cargo', val: fmtEur(totalComprador), muted: false },
          { label: 'Total a tener disponible', val: fmtEur(precio + totalComprador), muted: false, accent: true },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: i < 2 ? '1px solid #f0ede8' : 'none',
          }}>
            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: row.accent ? 17 : 13, fontWeight: row.accent ? 800 : 600, color: row.accent ? '#cf731b' : '#1a1a1a' }}>
              {row.val}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: '#aaa', lineHeight: 1.6, padding: '0.65rem 0.85rem', background: '#fff', borderRadius: 10, border: '1px solid #e8e5e0', borderLeft: '3px solid #cf731b', marginBottom: '1rem' }}>
        <strong style={{ color: '#888' }}>Aviso legal:</strong> Estimaciones orientativas. Tipos C. Valenciana vigentes junio 2026. Bonificaciones requieren acreditación documental. Confirmar con notaría, gestoría y banco antes de la firma.
      </div>
    </>
  )
}
