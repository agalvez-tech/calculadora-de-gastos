import React, { useMemo, useState } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, SectionTitle, Row, Field, Input, Select, SuffixInput, Divider, MetricCard } from './UI.jsx'
import { TIPO_PRESETS, calcCuota, fmtEur, fmtEurD, fmtPct } from '../utils.js'

const EURIBOR = 2.5

function resolveFromPreset(presetId, euribor = EURIBOR) {
  const p = TIPO_PRESETS.find(x => x.id === presetId)
  if (!p || p.tipo === 'custom') return null
  if (p.tipo === 'variable') return { tin: euribor + p.diff, tipo: 'variable', mesesFijo: null, tinPost: null }
  if (p.tipo === 'mixta')   return { tin: p.tin, tipo: 'mixta', mesesFijo: p.mesesFijo, tinPost: euribor + p.diff }
  return { tin: p.tin, tipo: 'fija', mesesFijo: null, tinPost: null }
}

const TABS = ['Gráfica', 'Amortización', 'Comparativa']

export default function HipotecaPanel({ hip, setHip, precio, hipCalc }) {
  const [tab, setTab] = useState(0)

  const { pctFinanciacion, capital, plazo, presetId, tin, tipo, mesesFijo, tinPost } = hip
  const meses = plazo * 12
  const { cuota, totalPagado, totalIntereses, rows } = hipCalc || {}

  // Helpers to update hip state
  const upd = (patch) => setHip(h => ({ ...h, ...patch }))

  const handlePct = (val) => {
    const pct = Math.min(100, Math.max(0, parseFloat(val) || 0))
    const newCapital = Math.round(precio * pct / 100)
    upd({ pctFinanciacion: pct, capital: newCapital })
  }

  const handleCapital = (val) => {
    const cap = Math.min(precio, Math.max(0, parseFloat(val) || 0))
    const pct = precio > 0 ? Math.round((cap / precio) * 1000) / 10 : 0
    upd({ capital: cap, pctFinanciacion: pct })
  }

  const handlePreset = (id) => {
    const resolved = resolveFromPreset(id)
    if (resolved) upd({ presetId: id, ...resolved })
    else upd({ presetId: id })
  }

  const chartData = useMemo(() => {
    if (!rows) return []
    const data = []
    let cA = 0, iA = 0
    rows.forEach((row, i) => {
      cA += row.cap; iA += row.int
      if ((i + 1) % 12 === 0 || i === rows.length - 1) {
        data.push({ año: `Año ${Math.floor(i / 12) + 1}`, capital: Math.round(cA), intereses: Math.round(iA), pendiente: Math.round(row.pend) })
        cA = 0; iA = 0
      }
    })
    return data
  }, [rows])

  const compData = useMemo(() => {
    if (!tin) return []
    return [10, 15, 20, 25, 30, 35, 40].map(pl => {
      const m = pl * 12
      const c = calcCuota(capital, tin, m)
      return { pl, cuota: c, int: c * m - capital, current: pl === plazo }
    })
  }, [capital, tin, plazo])

  const fmtAxis = v => `${Math.round(v / 1000)}k€`

  return (
    <Card>
      <SectionTitle icon="🏦">Calculadora hipotecaria</SectionTitle>

      {/* Financiación */}
      <Row cols={3}>
        <Field label="% Financiación" hint={`Máx. recomendado: 80%`}>
          <SuffixInput type="number" suffix="%" value={pctFinanciacion || ''} min={0} max={100} step={1}
            onChange={e => handlePct(e.target.value)} />
        </Field>
        <Field label="Capital a financiar (€)">
          <Input type="number" value={capital || ''} min={0} max={precio} step={1000}
            onChange={e => handleCapital(e.target.value)} />
        </Field>
        <Field label="Entrada necesaria (€)">
          <div style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 10px', background: '#f0ede8', borderRadius: 8, border: '1px solid #e0ddd8' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#cf731b' }}>{fmtEur(Math.max(0, precio - capital))}</span>
          </div>
        </Field>
      </Row>

      <Row cols={2}>
        <Field label="Plazo (años)">
          <Input type="number" value={plazo} min={5} max={40} step={1}
            onChange={e => upd({ plazo: parseInt(e.target.value) || 30 })} />
        </Field>
        <Field label="Tipo de interés">
          <Select value={presetId} onChange={e => handlePreset(e.target.value)}>
            {TIPO_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
        </Field>
      </Row>

      {presetId === 'custom' && (
        <div style={{ background: '#fafaf8', border: '1px solid #e8e5e0', borderRadius: 10, padding: '0.85rem', marginBottom: '0.75rem' }}>
          <Row cols={3} style={{ marginBottom: 0 }}>
            <Field label="TIN anual (%)">
              <SuffixInput type="number" suffix="%" value={tin} min={0.1} max={15} step={0.05}
                onChange={e => upd({ tin: parseFloat(e.target.value) || 3.5 })} />
            </Field>
            <Field label="Modalidad">
              <Select value={tipo} onChange={e => upd({ tipo: e.target.value, mesesFijo: null, tinPost: null })}>
                <option value="fija">Fija</option>
                <option value="variable">Variable</option>
                <option value="mixta">Mixta</option>
              </Select>
            </Field>
            {tipo === 'mixta' && (
              <Field label="Años fijo">
                <Input type="number" value={(mesesFijo || 120) / 12} min={1} max={20} step={1}
                  onChange={e => upd({ mesesFijo: parseInt(e.target.value) * 12 })} />
              </Field>
            )}
            {tipo === 'mixta' && (
              <Field label="TIN variable posterior (%)">
                <SuffixInput type="number" suffix="%" value={tinPost || 3.2} min={0} max={15} step={0.05}
                  onChange={e => upd({ tinPost: parseFloat(e.target.value) })} />
              </Field>
            )}
          </Row>
        </div>
      )}

      {hipCalc && (
        <>
          <Divider />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1rem' }}>
            <MetricCard label="Cuota mensual" value={fmtEurD(cuota)} sub={tipo === 'mixta' ? 'Periodo fijo inicial' : 'Cuota constante'} accent />
            <MetricCard label="Total intereses" value={fmtEur(totalIntereses)} sub={fmtPct(totalIntereses, totalPagado) + ' del total'} />
            <MetricCard label="Financiación" value={fmtPct(capital, precio)} sub={`Entrada: ${fmtEur(precio - capital)}`} />
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' }}>
            {TABS.map((t, i) => (
              <button key={t} onClick={() => setTab(i)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: '1px solid ' + (tab === i ? '#1a1a1a' : '#ddd'),
                background: tab === i ? '#1a1a1a' : 'transparent',
                color: tab === i ? '#fff' : '#888', transition: 'all .15s', fontFamily: 'inherit',
              }}>{t}</button>
            ))}
          </div>

          {tab === 0 && (
            <>
              <div style={{ height: 220, marginBottom: '0.75rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis dataKey="año" tick={{ fontSize: 9, fontFamily: 'Montserrat' }} />
                    <YAxis yAxisId="l" tickFormatter={fmtAxis} tick={{ fontSize: 9, fontFamily: 'Montserrat' }} />
                    <YAxis yAxisId="r" orientation="right" tickFormatter={fmtAxis} tick={{ fontSize: 9, fontFamily: 'Montserrat' }} />
                    <Tooltip formatter={v => fmtEur(v)} contentStyle={{ fontSize: 11, fontFamily: 'Montserrat', borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Montserrat' }} />
                    <Bar yAxisId="l" dataKey="capital" name="Capital amortizado" stackId="a" fill="#1a1a1a" />
                    <Bar yAxisId="l" dataKey="intereses" name="Intereses" stackId="a" fill="#cf731b" />
                    <Line yAxisId="r" type="monotone" dataKey="pendiente" name="Deuda pendiente" stroke="#bbb" strokeWidth={1.5} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {[{ label: 'Capital devuelto', pct: Math.round((capital / totalPagado) * 100), color: '#1a1a1a' },
                { label: 'Intereses totales', pct: Math.round((totalIntereses / totalPagado) * 100), color: '#cf731b' }
              ].map(b => (
                <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#888', minWidth: 110 }}>{b.label}</span>
                  <div style={{ flex: 1, height: 5, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: b.pct + '%', height: '100%', background: b.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{b.pct}%</span>
                </div>
              ))}
            </>
          )}

          {tab === 1 && rows && (
            <div style={{ maxHeight: 340, overflowY: 'auto', borderRadius: 8, border: '1px solid #e8e5e0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ background: '#1a1a1a', position: 'sticky', top: 0 }}>
                    {['Mes', 'Cuota', 'Capital', 'Intereses', 'Pendiente'].map((h, i) => (
                      <th key={h} style={{ padding: '7px 8px', textAlign: i === 0 ? 'left' : 'right', color: '#cf731b', fontWeight: 700, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.reduce((acc, row, i) => {
                    const step = meses > 120 ? 6 : 1
                    if (i % step === 0) acc.push(
                      <tr key={`m${row.m}`} style={{ background: Math.floor(i / step) % 2 === 0 ? '#fff' : '#fafaf8' }}>
                        <td style={{ padding: '5px 8px', color: '#888' }}>{row.m}</td>
                        {[row.cuota, row.cap, row.int, row.pend].map((v, j) => (
                          <td key={j} style={{ padding: '5px 8px', textAlign: 'right', color: j === 2 ? '#cf731b' : '#1a1a1a' }}>{fmtEurD(v)}</td>
                        ))}
                      </tr>
                    )
                    if ((i + 1) % 12 === 0) {
                      const yr = Math.floor(i / 12) + 1
                      const sl = rows.slice(i - 11, i + 1)
                      acc.push(
                        <tr key={`y${yr}`} style={{ background: '#fff3e8', fontWeight: 700 }}>
                          <td style={{ padding: '5px 8px', color: '#cf731b' }}>Año {yr}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#888' }}>—</td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#1a1a1a' }}>{fmtEur(sl.reduce((a, r) => a + r.cap, 0))}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#cf731b' }}>{fmtEur(sl.reduce((a, r) => a + r.int, 0))}</td>
                          <td style={{ padding: '5px 8px', textAlign: 'right', color: '#888' }}>{fmtEur(row.pend)}</td>
                        </tr>
                      )
                    }
                    return acc
                  }, [])}
                </tbody>
              </table>
            </div>
          )}

          {tab === 2 && (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#1a1a1a' }}>
                    {['Plazo', 'Cuota/mes', 'Intereses totales', 'vs. 30 años'].map((h, i) => (
                      <th key={h} style={{ padding: '7px 8px', textAlign: i === 0 ? 'left' : 'right', color: '#cf731b', fontWeight: 700, fontSize: 10 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compData.map((d, i) => {
                    const ref30 = compData.find(x => x.pl === 30)
                    const ahorro = ref30 ? ref30.int - d.int : 0
                    return (
                      <tr key={d.pl} style={{ background: d.current ? '#fff3e8' : i % 2 === 0 ? '#fff' : '#fafaf8', fontWeight: d.current ? 700 : 400 }}>
                        <td style={{ padding: '6px 8px', color: d.current ? '#cf731b' : '#888' }}>{d.pl}a{d.current ? ' ←' : ''}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: d.current ? '#cf731b' : '#1a1a1a' }}>{fmtEurD(d.cuota)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#cf731b' }}>{fmtEur(d.int)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: ahorro === 0 ? '#888' : ahorro > 0 ? '#3B6D11' : '#A32D2D' }}>
                          {ahorro === 0 ? '—' : (ahorro > 0 ? '+' : '') + fmtEur(ahorro)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 8, lineHeight: 1.6 }}>
                Comparativa al mismo TIN ({tin}%). Ahorro/sobrecoste respecto a 30 años de referencia.
              </div>
            </>
          )}
        </>
      )}
    </Card>
  )
}
