import React, { useState } from 'react'
import { fmtEur, fmtEurD, fmtPct } from '../utils.js'

// ── PDF generado en cliente con jsPDF (cargado desde CDN lazy) ─────────────
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s.onload = () => resolve(window.jspdf.jsPDF)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function buildPDF({ partidas, totalComprador, precio, datos, hip, hipCalc }) {
  return loadJsPDF().then(JsPDF => {
    const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const W = 210, M = 14, CW = W - M * 2
    const ORANGE = [207, 115, 27]
    const BLACK  = [26, 26, 26]
    const GRAY   = [120, 120, 120]
    const LGRAY  = [245, 244, 240]
    const today  = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    const fmt  = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))
    const fmtD = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

    let y = 0

    // ── Header
    doc.setFillColor(...BLACK)
    doc.rect(0, 0, W, 28, 'F')
    doc.setFillColor(...ORANGE)
    doc.roundedRect(M, 7, 14, 14, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10); doc.setTextColor(255, 255, 255)
    doc.text('RK', M + 7, 16, { align: 'center' })
    doc.setFontSize(12); doc.setTextColor(255, 255, 255)
    doc.text('PALANCA FONTESTAD', M + 18, 13)
    doc.setFontSize(7); doc.setTextColor(...GRAY)
    doc.text('by Realmark Inmobiliaria', M + 18, 18)
    doc.setFontSize(9); doc.setTextColor(...ORANGE)
    doc.text('INFORME DE GASTOS DE COMPRAVENTA', W - M, 13, { align: 'right' })
    doc.setFontSize(7); doc.setTextColor(...GRAY)
    doc.text(today, W - M, 18, { align: 'right' })

    y = 36

    // ── Subtítulo
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...BLACK)
    doc.text('Estimación de gastos para el comprador', M, y)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...GRAY)
    doc.text('Comunitat Valenciana · Tipos vigentes junio 2026', M, y + 5)
    y += 13

    // ── Sección título helper
    const secTitle = (title) => {
      doc.setFillColor(...ORANGE)
      doc.rect(M, y, 3, 6, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...ORANGE)
      doc.text(title.toUpperCase(), M + 6, y + 4.5)
      doc.setDrawColor(230, 225, 218)
      doc.line(M, y + 7, W - M, y + 7)
      y += 11
    }

    // ── Row helper
    const tableRow = (label, value, i, accent) => {
      if (i % 2 === 0) { doc.setFillColor(...LGRAY); doc.rect(M, y - 1, CW, 7, 'F') }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...GRAY)
      doc.text(label, M + 2, y + 4)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
      doc.setTextColor(...(accent ? ORANGE : BLACK))
      doc.text(value, W - M - 2, y + 4, { align: 'right' })
      y += 7
    }

    // ── 1. DATOS OPERACIÓN
    secTitle('1. Datos de la operación')
    const { tipoViv, uso, edad, familia, discapacidad, discapTipo, pctInmo } = datos
    const tipoLabel = tipoViv === 'nueva' ? 'Obra nueva' : 'Segunda mano'
    const usoLabel = uso === 'habitual' ? 'Vivienda habitual' : 'Inversión / 2ª residencia'
    const edadLabel = edad === 'joven' ? 'Menor de 35 años' : '35 años o más'
    let bonif = 'Ninguna'
    if (discapacidad) bonif = discapTipo === 'mental' ? 'Discap. mental/intelectual/psíquica ≥33%' : 'Discap. física/sensorial ≥65%'
    else if (familia) bonif = 'Familia numerosa / monoparental'
    tableRow('Precio de compraventa', fmt(precio), 0)
    tableRow('Tipo de vivienda', tipoLabel, 1)
    tableRow('Uso previsto', usoLabel, 0)
    tableRow('Edad del comprador', edadLabel, 1)
    tableRow('Bonificación aplicada', bonif, 0)
    tableRow('Honorarios inmobiliaria', pctInmo + '% s/ precio + IVA', 1)
    y += 4

    // ── 2. GASTOS
    secTitle('2. Desglose de gastos')

    // Header tabla
    doc.setFillColor(...BLACK)
    doc.rect(M, y - 1, CW, 7, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(255, 255, 255)
    doc.text('Concepto', M + 2, y + 4)
    doc.text('Detalle', M + 90, y + 4)
    doc.text('Importe', W - M - 2, y + 4, { align: 'right' })
    y += 7

    const pagoProp = partidas.filter(p => !p.esBanco)
    const pagoBanco = partidas.filter(p => p.esBanco)

    pagoProp.forEach((p, i) => {
      if (i % 2 === 0) { doc.setFillColor(...LGRAY); doc.rect(M, y - 1, CW, 7, 'F') }
      const nombre = p.nombre.replace(/<[^>]+>/g, '').trim()
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(...BLACK)
      doc.text(nombre.substring(0, 42), M + 2, y + 4)
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...GRAY)
      doc.text(p.detalle.substring(0, 36), M + 90, y + 4)
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
      doc.setTextColor(...(p.esInmo ? ORANGE : BLACK))
      doc.text(fmt(p.importe), W - M - 2, y + 4, { align: 'right' })
      y += 7
    })

    // Total
    doc.setFillColor(...ORANGE)
    doc.rect(M, y, CW, 9, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255)
    doc.text('TOTAL A CARGO DEL COMPRADOR', M + 3, y + 6)
    doc.setFontSize(11)
    doc.text(fmt(totalComprador), W - M - 3, y + 6, { align: 'right' })
    y += 13

    // Banco
    if (pagoBanco.length > 0) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...GRAY)
      doc.text('A cargo del banco (Ley 5/2019):', M, y); y += 4
      pagoBanco.forEach(p => {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...GRAY)
        doc.text('· ' + p.nombre.replace(/<[^>]+>/g, '').trim(), M + 2, y)
        doc.text('(' + fmt(p.importe) + ')', W - M, y, { align: 'right' })
        y += 4
      })
      y += 2
    }

    // ── 3. HIPOTECA
    if (hip && hipCalc) {
      if (y > 220) { doc.addPage(); y = 20 }
      secTitle('3. Análisis de la hipoteca')
      const { capital, plazo, tin, tipo } = hip
      const { cuota, totalPagado, totalIntereses } = hipCalc
      const hipRows = [
        ['Capital financiado', fmt(capital)],
        ['Plazo de amortización', plazo + ' años (' + plazo * 12 + ' cuotas)'],
        ['Tipo de hipoteca', tipo.charAt(0).toUpperCase() + tipo.slice(1)],
        ['TIN (tipo nominal anual)', tin.toFixed(2) + '%'],
        ['Cuota mensual', fmtD(cuota)],
        ['Total intereses', fmt(totalIntereses) + '  (' + Math.round(totalIntereses / totalPagado * 100) + '% del total pagado)'],
      ]
      hipRows.forEach(([k, v], i) => tableRow(k, v, i, i === 4))
      y += 4
    }

    // ── 4. DESEMBOLSO TOTAL
    if (y > 240) { doc.addPage(); y = 20 }
    secTitle('4. Desembolso total estimado')
    tableRow('Precio de compraventa', fmt(precio), 0)
    tableRow('Gastos a tu cargo', fmt(totalComprador), 1)
    // Total destacado
    doc.setFillColor(26, 26, 26)
    doc.rect(M, y, CW, 9, 'F')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255)
    doc.text('TOTAL A TENER DISPONIBLE', M + 3, y + 6)
    doc.setTextColor(...ORANGE); doc.setFontSize(11)
    doc.text(fmt(precio + totalComprador), W - M - 3, y + 6, { align: 'right' })
    y += 14

    // ── Notas
    if (y > 245) { doc.addPage(); y = 20 }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...GRAY)
    doc.text('NOTA LEGAL', M, y); y += 4
    const notas = [
      'Los importes son estimaciones orientativas. La cuantía definitiva depende de las características exactas de la operación.',
      'El ITP se aplica sobre el mayor valor entre precio escriturado y valor de referencia catastral (Ley 11/2021).',
      'Los aranceles de notaría y registro son estimados conforme a RD 1426/1989 y RD 1427/1989.',
      'Desde la Ley 5/2019, los gastos de notaría, registro e IAJD de la hipoteca corren a cargo del banco.',
      'Se recomienda confirmar todos los importes con notaría, gestoría y entidad financiera antes de la firma.',
    ]
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(160, 155, 150)
    notas.forEach(n => { doc.text('· ' + n, M, y, { maxWidth: CW }); y += 5 })

    // ── Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFillColor(...BLACK)
      doc.rect(0, 285, W, 12, 'F')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...ORANGE)
      doc.text('RK PALANCA FONTESTAD', M, 292)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...GRAY)
      doc.text('L\'Horta Nord, Valencia · +50 años · 5.025 viviendas vendidas', M + 42, 292)
      doc.text(`Pág. ${i}/${pageCount}`, W - M, 292, { align: 'right' })
    }

    return doc
  })
}

export default function ResultsPanel({ partidas, totalComprador, precio, datos, hip, hipCalc }) {
  const [generating, setGenerating] = useState(false)

  if (!partidas || partidas.length === 0) return null

  const pagaProp = partidas.filter(p => !p.esBanco)
  const pagaBanco = partidas.filter(p => p.esBanco)

  const handlePDF = async () => {
    setGenerating(true)
    try {
      const doc = await buildPDF({ partidas, totalComprador, precio, datos, hip, hipCalc })
      const fecha = new Date().toISOString().slice(0, 10)
      doc.save(`RK_Gastos_Compra_${fecha}.pdf`)
    } catch (e) {
      alert('Error generando PDF: ' + e.message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <div style={{ background: '#1a1a1a', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#cf731b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: '0.9rem' }}>
          💳 Gastos totales de compra
        </div>

        {pagaProp.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0', borderBottom: '1px solid #2e2e2e' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: p.nombre }} />
              <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{p.detalle}</div>
            </div>
            <div style={{ fontSize: 13, color: p.esInmo ? '#cf731b' : '#fff', fontWeight: 700, marginLeft: 12, whiteSpace: 'nowrap' }}>
              {fmtEur(p.importe)}
            </div>
          </div>
        ))}

        {pagaBanco.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: '#444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '10px 0 5px' }}>
              A cargo del banco · Ley 5/2019
            </div>
            {pagaBanco.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #252525' }}>
                <div style={{ fontSize: 10, color: '#444' }}>{p.nombre.replace(/<[^>]+>/g,'').trim()}</div>
                <div style={{ fontSize: 10, color: '#444' }}>({fmtEur(p.importe)})</div>
              </div>
            ))}
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', background: '#cf731b', borderRadius: 10, marginTop: '0.9rem' }}>
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
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#888', minWidth: 120, flexShrink: 0 }}>
                {p.nombre.replace(/<[^>]+>/g,'').substring(0, 26)}
              </span>
              <div style={{ flex: 1, height: 5, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: w + '%', height: '100%', background: p.color || '#cf731b', borderRadius: 3, transition: 'width .35s' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, minWidth: 32, textAlign: 'right' }}>{w}%</span>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 14, padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#cf731b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '0.9rem' }}>
          💰 Desembolso total estimado
        </div>
        {[
          { label: 'Precio de compraventa', val: fmtEur(precio) },
          { label: 'Gastos a tu cargo', val: fmtEur(totalComprador) },
          { label: 'Total a tener disponible', val: fmtEur(precio + totalComprador), accent: true },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid #f0ede8' : 'none' }}>
            <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{row.label}</span>
            <span style={{ fontSize: row.accent ? 17 : 13, fontWeight: row.accent ? 800 : 600, color: row.accent ? '#cf731b' : '#1a1a1a' }}>{row.val}</span>
          </div>
        ))}
      </div>

      {/* ── BOTÓN DESCARGA PDF ── */}
      <button
        onClick={handlePDF}
        disabled={generating}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: generating ? 'wait' : 'pointer',
          background: generating ? '#e0ddd8' : '#1a1a1a',
          color: generating ? '#999' : '#fff',
          fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
          transition: 'all .2s', marginBottom: '0.75rem',
          boxShadow: generating ? 'none' : '0 4px 16px rgba(0,0,0,0.18)',
        }}
      >
        <span style={{ fontSize: 18 }}>📄</span>
        {generating ? 'Generando PDF…' : 'Descargar informe PDF para el cliente'}
        {!generating && <span style={{ fontSize: 11, color: '#cf731b', fontWeight: 600, marginLeft: 4 }}>↓</span>}
      </button>

      <div style={{ fontSize: 10, color: '#aaa', lineHeight: 1.6, padding: '0.65rem 0.85rem', background: '#fff', borderRadius: 10, border: '1px solid #e8e5e0', borderLeft: '3px solid #cf731b', marginBottom: '0.5rem' }}>
        <strong style={{ color: '#888' }}>Aviso legal:</strong> Estimaciones orientativas. Tipos C. Valenciana vigentes junio 2026. Bonificaciones requieren acreditación documental. Confirmar con notaría, gestoría y banco.
      </div>
    </>
  )
}
