import React, { useState, useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'
import { Card, SectionTitle, Row, Field, Input, Select, SuffixInput, Divider, MetricCard } from './UI.jsx'
import { TIPO_PRESETS, calcCuota, buildAmortRows, fmtEur, fmtEurD, fmtPct } from '../utils.js'

const EURIBOR_DEFAULT = 2.5

function resolveParams(presetId, customState) {
  if (presetId === 'custom') return customState
  const p = TIPO_PRESETS.find(x => x.id === presetId)
  if (!p) return customState
  if (p.tipo === 'variable') {
    return { tin: EURIBOR_DEFAULT + p.diff, tipo: 'variable', mesesFijo: null, tinPost: null }
  }
  if (p.tipo === 'mixta') {
    return { tin: p.tin, tipo: 'mixta', mesesFijo: p.mesesFijo, tinPost: EURIBOR_DEFAULT + p.diff }
  }
  return { tin: p.tin, tipo: 'fija', mesesFijo: null, tinPost: null }
}

const TABS = ['Gráfica', 'Amortización', 'Comparativa']

export default function HipotecaPanel({ capital: capitalProp, plazo: plazoProp, onChange }) {
  const [preset, setPreset] = useState('fija_3.5')
  const [capital, setCapital] = useState(capitalProp ?? 200000)
  const [plazo, setPlazo] = useState(plazoProp ?? 30)
  const [tab, setTab] = useState(0)
  const [custom, setCustom] = useState({ tin: 3.5, tipo: 'fija', mesesFijo: null, tinPost: null })

  const params = resolveParams(preset, custom)
  const { tin, tipo, mesesFijo, tinPost } = params
  const meses = plazo * 12

  const cuota = useMemo(() => {
    if (tipo === 'mixta' && mesesFijo) return calcCuota(capital, tin, mesesFijo)
    return calcCuota(capital, tin, meses)
  }, [capital, tin, meses, tipo, mesesFijo])

  const rows = useMemo(() => buildAmortRows(capital, cuota, tin, meses, tinPost, mesesFijo), [capital, cuota, tin, meses, tinPost, mesesFijo])

  const totalPagado = useMemo(() => rows.reduce((a, r) => a + r.cuota, 0), [rows])
  const totalIntereses = useMemo(() => rows.reduce((a, r) => a + r.int, 0), [rows])

  const chartData = useMemo(() => {
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
    const r = (tin / 100) / 12
    return [10, 15, 20, 25, 30, 35, 40].map(pl => {
      const m = pl * 12
      const c = calcCuota(capital, tin, m)
      const tot = c * m
      const int = tot - capital
      return { pl, cuota: c, int, current: pl === plazo }
    })
  }, [capital, tin, plazo])

  React.useEffect(() => {
    if (onChange) onChange({ capital, plazo, tin, tipo, cuota, totalPagado, totalIntereses })
  }, [capital, plazo, tin, tipo, cuota, totalPagado, totalIntereses])

  const formatEurAxis = (v) => `${Math.round(v / 1000)}k€`

  return (
    <Card>
      <SectionTitle icon="🏦">Calculadora hipotecaria</SectionTitle>

      <Row cols={3}>
        <Field label="Capital (€)">
          <Input type="number" value={capital} min={0} step={1000}
            onChange={e => setCapital(parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="Plazo (años)">
          <Input type="number" value={plazo} min={5} max={40} step={1}
            onChange={e => setPlazo(parseInt(e.target.value) || 30)} />
        </Field>
        <Field label="Tipo de interés">
          <Select value={preset} onChange={e => setPreset(e.target.value)}>
            {TIPO_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </Select>
        </Field>
      </Row>

      {preset === 'custom' && (
        <div style={{ background: '#fafaf8', border: '1px solid #e8e5e0', borderRadius: 10, padding: '0.85rem', marginBottom: '0.75rem' }}>
          <Row cols={3} style={{ marginBottom: 0 }}>
            <Field label="TIN anual (%)">
              <SuffixInput type="number" suffix="%" value={custom.tin} min={0.1} max={15} step={0.05}
                onChange={e => setCustom(c => ({ ...c, tin: parseFloat(e.target.value) || 3.5 }))} />
            </Field>
            <Field label="Modalidad">
              <Select value={custom.tipo} onChange={e => setCustom(c => ({ ...c, tipo: e.target.value }))}>
                <option value="fija">Fija</option>
                <option value="variable">Variable</option>
                <option value="mixta">Mixta</option>
              </Select>
            </Field>
            {custom.tipo === 'mixta' && (
              <Field label="Años fijo">
                <Input type="number" value={(custom.mesesFijo || 120) / 12} min={1} max={20} step={1}
                  onChange={e => setCustom(c => ({ ...c, mesesFijo: parseInt(e.target.value) * 12 }))} />
              </Field>
            )}
            {custom.tipo === 'mixta' && (
              <Field label="TIN variable posterior (%)">
                <SuffixInput type="number" suffix="%" value={custom.tinPost || 3.2} min={0} max={15} step={0.05}
                  onChange={e => setCustom(c => ({ ...c, tinPost: parseFloat(e.target.value) }))} />
              </Field>
            )}
          </Row>
        </div>
      )}

      <Divider />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: '1rem' }}>
        <MetricCard label="Cuota mensual" value={fmtEurD(cuota)} sub={tipo === 'mixta' ? 'Periodo fijo inicial' : 'Cuota constante'} accent />
        <MetricCard label="Total intereses" value={fmtEur(totalIntereses)} sub={fmtPct(totalIntereses, totalPagado) + ' del total pagado'} />
        <MetricCard label="Financiación" value={fmtPct(capital, 250000)} sub="Sobre precio de compra" />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            border: '1px solid ' + (tab === i ? '#1a1a1a' : '#ddd'),
            background: tab === i ? '#1a1a1a' : 'transparent',
            color: tab === i ? '#fff' : '#888', transition: 'all .15s',
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
                <YAxis yAxisId="left" tickFormatter={formatEurAxis} tick={{ fontSize: 9, fontFamily: 'Montserrat' }} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={formatEurAxis} tick={{ fontSize: 9, fontFamily: 'Montserrat' }} />
                <Tooltip formatter={(v) => fmtEur(v)} labelStyle={{ fontSize: 11, fontFamily: 'Montserrat' }} contentStyle={{ fontSize: 11, fontFamily: 'Montserrat', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'Montserrat' }} />
                <Bar yAxisId="left" dataKey="capital" name="Capital amortizado" stackId="a" fill="#1a1a1a" />
                <Bar yAxisId="left" dataKey="intereses" name="Intereses" stackId="a" fill="#cf731b" />
                <Line yAxisId="right" type="monotone" dataKey="pendiente" name="Deuda pendiente" stroke="#aaa" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { label: 'Capital devuelto', pct: Math.round((capital / totalPagado) * 100), color: '#1a1a1a' },
              { label: 'Intereses totales', pct: Math.round((totalIntereses / totalPagado) * 100), color: '#cf731b' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, color: '#888', minWidth: 110 }}>{b.label}</span>
                <div style={{ flex: 1, height: 5, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: b.pct + '%', height: '100%', background: b.color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{b.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 1 && (
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
                if (i % step === 0) {
                  acc.push(
                    <tr key={`m${row.m}`} style={{ background: Math.floor(i / step) % 2 === 0 ? '#fff' : '#fafaf8' }}>
                      <td style={{ padding: '5px 8px', color: '#888' }}>{row.m}</td>
                      {[row.cuota, row.cap, row.int, row.pend].map((v, j) => (
                        <td key={j} style={{ padding: '5px 8px', textAlign: 'right', color: j === 2 ? '#cf731b' : '#1a1a1a' }}>{fmtEurD(v)}</td>
                      ))}
                    </tr>
                  )
                }
                if ((i + 1) % 12 === 0) {
                  const yr = Math.floor(i / 12) + 1
                  const yrRows = rows.slice(i - 11, i + 1)
                  const yrCap = yrRows.reduce((a, r) => a + r.cap, 0)
                  const yrInt = yrRows.reduce((a, r) => a + r.int, 0)
                  acc.push(
                    <tr key={`y${yr}`} style={{ background: '#fff3e8', fontWeight: 700 }}>
                      <td style={{ padding: '5px 8px', color: '#cf731b' }}>Año {yr}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#888' }}>—</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#1a1a1a' }}>{fmtEur(yrCap)}</td>
                      <td style={{ padding: '5px 8px', textAlign: 'right', color: '#cf731b' }}>{fmtEur(yrInt)}</td>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed' }}>
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
                  <tr key={d.pl} style={{
                    background: d.current ? '#fff3e8' : i % 2 === 0 ? '#fff' : '#fafaf8',
                    fontWeight: d.current ? 700 : 400,
                  }}>
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
            Comparativa al mismo TIN ({tin}%). El ahorro/sobrecoste es respecto a 30 años. A menor plazo, menor coste total de intereses pero mayor cuota mensual.
          </div>
        </>
      )}
    </Card>
  )
}
