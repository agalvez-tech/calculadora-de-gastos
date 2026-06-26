import React, { useState, useMemo } from 'react'
import Header from './components/Header.jsx'
import DatosPanel from './components/DatosPanel.jsx'
import HipotecaPanel from './components/HipotecaPanel.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import { calcRegistro, calcITP } from './utils.js'

const INITIAL = {
  precio: 250000,
  tipoViv: 'segunda',
  uso: 'habitual',
  edad: 'normal',
  familia: false,
  discapacidad: false,
  discapTipo: 'mental',
  hipoteca: true,
  pctInmo: 3,
}

export default function App() {
  const [datos, setDatos] = useState(INITIAL)
  const [hipData, setHipData] = useState({ capital: 200000, plazo: 30, tin: 3.5, tipo: 'fija', cuota: 898.09, totalPagado: 323312, totalIntereses: 123312 })

  const partidas = useMemo(() => {
    const { precio, tipoViv, familia, discapacidad, discapTipo, uso, edad, pctInmo } = datos
    if (!precio) return []

    const items = []

    if (tipoViv === 'segunda') {
      const { tasa, bonif } = calcITP({ precio, edad, uso, familia, discapacidad, discapTipo })
      const tag = bonif
        ? ` <span style="font-size:9px;background:#EAF3DE;color:#27500A;padding:1px 6px;border-radius:8px">${bonif}</span>`
        : ''
      items.push({ nombre: 'ITP' + tag, detalle: `${tasa}% sobre valor de escritura (C. Valenciana)`, importe: precio * (tasa / 100), color: '#cf731b' })
    } else {
      items.push({ nombre: 'IVA <span style="font-size:9px;background:#E6F1FB;color:#0C447C;padding:1px 6px;border-radius:8px">Obra nueva</span>', detalle: '10% sobre precio de escritura', importe: precio * 0.10, color: '#cf731b' })
      items.push({ nombre: 'AJD', detalle: '1,5% Actos Jurídicos Documentados', importe: precio * 0.015, color: '#ba7517' })
    }

    const notaria = Math.min(Math.max(precio * 0.0007 + 400, 700), 2000)
    items.push({ nombre: 'Notaría — compraventa', detalle: 'Arancel oficial (RD 1426/1989)', importe: notaria, color: '#3B6D11' })

    const registro = calcRegistro(precio)
    items.push({ nombre: 'Registro de la Propiedad', detalle: 'Arancel por tramos (RD 1427/1989)', importe: registro, color: '#3B6D11' })

    items.push({ nombre: 'Gestoría / tramitación', detalle: 'Estimación media orientativa', importe: 400, color: '#185FA5' })

    if (pctInmo > 0) {
      const base = precio * (pctInmo / 100)
      items.push({
        nombre: `Honorarios inmobiliaria <span style="font-size:9px;background:#1a1a1a;color:#cf731b;padding:1px 6px;border-radius:8px">RK ${pctInmo}%</span>`,
        detalle: `${pctInmo}% sobre precio de compra + IVA 21%`,
        importe: base * 1.21,
        color: '#cf731b',
        esInmo: true,
      })
    }

    if (datos.hipoteca && hipData.capital) {
      const tasacion = Math.min(Math.max(precio * 0.001, 300), 700)
      items.push({ nombre: 'Tasación oficial', detalle: 'Requerida por la entidad financiera', importe: tasacion, color: '#185FA5' })

      const notariaHip = Math.min(Math.max(hipData.capital * 0.0003, 400), 1000)
      items.push({ nombre: 'Notaría — escritura hipoteca', detalle: 'A cargo del banco (Ley 5/2019)', importe: notariaHip, color: '#555', esBanco: true })

      const registroHip = calcRegistro(hipData.capital) * 0.75
      items.push({ nombre: 'Registro hipoteca', detalle: 'A cargo del banco (Ley 5/2019)', importe: registroHip, color: '#555', esBanco: true })
    }

    return items
  }, [datos, hipData])

  const totalComprador = useMemo(() =>
    partidas.filter(p => !p.esBanco).reduce((a, p) => a + p.importe, 0),
    [partidas]
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <Header />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 1rem 3rem' }}>

        <DatosPanel state={datos} onChange={setDatos} />

        {datos.hipoteca && (
          <HipotecaPanel
            capital={200000}
            plazo={30}
            onChange={setHipData}
          />
        )}

        <ResultsPanel
          partidas={partidas}
          totalComprador={totalComprador}
          precio={datos.precio}
        />

        <footer style={{ textAlign: 'center', padding: '1.5rem 0 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: '#1a1a1a', borderRadius: 12, padding: '0.75rem 1.25rem',
          }}>
            <div style={{ background: '#cf731b', color: '#fff', fontWeight: 900, fontSize: 14, padding: '3px 8px', borderRadius: 6 }}>RK</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>PALANCA FONTESTAD</div>
              <div style={{ fontSize: 9, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Más de 5.025 viviendas desde 1976 · L'Horta Nord, Valencia
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
