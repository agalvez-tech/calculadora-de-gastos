import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
} from 'docx'

const ORANGE = 'CF731B'
const BLACK = '111111'
const GREY = '5C574E'
const LIGHT = 'F4F1EA'

const FULL_WIDTH = 9360 // DXA, US Letter content width with 1" margins

function border(color = 'D7D2C8', size = 4) {
  return { style: BorderStyle.SINGLE, size, color }
}

function pageSetup() {
  return {
    size: { width: 12240, height: 15840 },
    margin: { top: 1100, right: 1440, bottom: 1100, left: 1440 },
  }
}

function brandHeader() {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'RK ', bold: true, color: 'FFFFFF', size: 22, font: 'Arial' }),
        ],
        alignment: AlignmentType.LEFT,
        shading: { fill: BLACK, type: ShadingType.CLEAR },
        spacing: { before: 0, after: 0 },
      }),
    ],
  })
}

function brandFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: border(ORANGE, 6) },
        spacing: { before: 120 },
        children: [
          new TextRun({
            text: "RK Palanca Fontestad by Realmark Inmobiliaria · L'Horta Nord, Valencia · Fundada en 1976",
            size: 14,
            color: GREY,
            font: 'Arial',
          }),
        ],
      }),
    ],
  })
}

function titleBlock(title, subtitle) {
  return [
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: title, bold: true, size: 40, color: BLACK, font: 'Arial' })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ORANGE, space: 4 } },
      children: [new TextRun({ text: subtitle, size: 22, color: GREY, font: 'Arial' })],
    }),
  ]
}

function sectionHeading(text) {
  return new Paragraph({
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 22, color: ORANGE, font: 'Arial' }),
    ],
  })
}

function kpiRow(items) {
  // items: array of { label, value, sub }
  const colWidth = Math.floor(FULL_WIDTH / items.length)
  const cells = items.map(
    (item) =>
      new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        margins: { top: 140, bottom: 140, left: 140, right: 140 },
        shading: { fill: LIGHT, type: ShadingType.CLEAR },
        borders: {
          top: border(),
          bottom: border(),
          left: border(),
          right: border(),
        },
        children: [
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: item.label.toUpperCase(), size: 14, color: GREY, font: 'Arial', bold: true })],
          }),
          new Paragraph({
            spacing: { after: item.sub ? 40 : 0 },
            children: [new TextRun({ text: item.value, size: 30, bold: true, color: BLACK, font: 'Arial' })],
          }),
          ...(item.sub
            ? [new Paragraph({ children: [new TextRun({ text: item.sub, size: 14, color: GREY, font: 'Arial' })] })]
            : []),
        ],
      })
  )
  return new Table({
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    columnWidths: items.map(() => colWidth),
    rows: [new TableRow({ children: cells })],
  })
}

function dataTable(rows, opts = {}) {
  // rows: array of [label, value] or { section: text }
  const labelWidth = Math.round(FULL_WIDTH * 0.65)
  const valueWidth = FULL_WIDTH - labelWidth
  const trRows = []
  rows.forEach((row) => {
    if (row.section) {
      trRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              width: { size: FULL_WIDTH, type: WidthType.DXA },
              margins: { top: 100, bottom: 60, left: 100, right: 100 },
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: row.section.toUpperCase(), bold: true, size: 14, color: ORANGE, font: 'Arial' })],
                }),
              ],
            }),
          ],
        })
      )
      return
    }
    const [label, value] = row
    const isBold = opts.boldLast && row === rows[rows.length - 1]
    trRows.push(
      new TableRow({
        children: [
          new TableCell({
            width: { size: labelWidth, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            borders: { top: { style: BorderStyle.NONE }, bottom: border(), left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [new Paragraph({ children: [new TextRun({ text: label, size: 20, color: isBold ? BLACK : GREY, bold: isBold, font: 'Arial' })] })],
          }),
          new TableCell({
            width: { size: valueWidth, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            borders: { top: { style: BorderStyle.NONE }, bottom: border(), left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: value, size: 20, color: BLACK, bold: isBold, font: 'Arial' })],
              }),
            ],
          }),
        ],
      })
    )
  })
  return new Table({
    width: { size: FULL_WIDTH, type: WidthType.DXA },
    columnWidths: [labelWidth, valueWidth],
    rows: trRows,
  })
}

function noteParagraph(text) {
  return new Paragraph({
    spacing: { before: 240 },
    shading: { fill: 'FBF1E6', type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } },
    children: [new TextRun({ text, size: 16, color: GREY, italics: true, font: 'Arial' })],
  })
}

function fechaHoy() {
  return new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

export async function generarDocxGastos(data) {
  const { precio, tipoLabel, gastos, honorarios, totalComprador, hipoteca, ltv, tin, plazoHip } = data

  const children = [
    ...titleBlock('Resumen de gastos de compraventa', `${tipoLabel} · Comunitat Valenciana · ${fechaHoy()}`),

    sectionHeading('Resumen de la inversión'),
    kpiRow([
      { label: 'Precio compra', value: data.fmt(precio), sub: tipoLabel },
      { label: 'Gastos e impuestos', value: data.fmt(gastos.total), sub: gastos.tipoAplicado },
      { label: 'Total a pagar', value: data.fmt(totalComprador), sub: 'Precio + gastos + honorarios' },
    ]),

    ...(hipoteca
      ? [
          new Paragraph({ spacing: { before: 200 } }),
          kpiRow([
            { label: 'Aportación propia', value: data.fmt(hipoteca.aportacionPropia), sub: `Entrada (${100 - ltv}%) + gastos` },
            { label: 'Capital hipotecario', value: data.fmt(hipoteca.capital), sub: `${ltv}% del precio` },
            { label: 'Cuota mensual', value: data.fmt(hipoteca.cuota) + '/mes', sub: `TIN ${tin}% · ${plazoHip} años` },
          ]),
        ]
      : []),

    sectionHeading('Desglose de gastos de compra'),
    dataTable(
      [
        { section: 'Precio y gastos de adquisición' },
        ['Precio de compra', data.fmt(precio)],
        ...gastos.lineas.map(([l, v]) => [l, data.fmt(v)]),
        ['Honorarios agencia', data.fmt(honorarios)],
        ['TOTAL A PAGAR', data.fmt(totalComprador)],
      ],
      { boldLast: true }
    ),

    ...(hipoteca
      ? [
          sectionHeading('Detalle de la hipoteca'),
          dataTable([
            ['Financiación sobre el precio', data.fmtPct(ltv)],
            ['Capital financiado', data.fmt(hipoteca.capital)],
            ['Tipo de interés (TIN) anual', data.fmtPct(tin)],
            ['Plazo', `${plazoHip} años`],
            ['Cuota mensual estimada', data.fmt(hipoteca.cuota)],
            ['Total intereses estimados', data.fmt(hipoteca.totalIntereses)],
          ]),
        ]
      : []),

    noteParagraph(
      'Documento orientativo. Las bonificaciones del ITP requieren cumplir los requisitos documentales exigidos por la Generalitat Valenciana. El registro de la propiedad se estima en 600 € a falta de los datos exactos de la finca. La cuota hipotecaria es una simulación y está sujeta a la aprobación final de la entidad bancaria.'
    ),
  ]

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [
      {
        properties: { page: pageSetup() },
        headers: { default: brandHeader() },
        footers: { default: brandFooter() },
        children,
      },
    ],
  })

  return Packer.toBlob(doc)
}

export async function generarDocxRentabilidad(data) {
  const r = data.r
  const fmt = data.fmt
  const fmtPct = data.fmtPct

  const children = [
    ...titleBlock('Análisis de rentabilidad de inversión', `Alquiler residencial · Comunitat Valenciana · ${fechaHoy()}`),

    sectionHeading('Inversión total'),
    kpiRow([
      { label: 'Precio compra', value: fmt(r.precio), sub: r.tipoInmueble === 'segunda' ? 'Segunda mano' : 'Obra nueva' },
      { label: 'Gastos de compra', value: fmt(r.gastos.total), sub: 'ITP/IVA+AJD · notaría · registro' },
      { label: 'Inversión total', value: fmt(r.inversionTotal), sub: 'Precio + gastos + reforma + agencia' },
    ]),
    new Paragraph({ spacing: { before: 200 } }),
    kpiRow(
      r.financia
        ? [
            { label: 'Aportación propia', value: fmt(r.aportacionPropia), sub: 'Entrada + gastos' },
            { label: 'Capital hipotecario', value: fmt(r.capitalFinanciado), sub: `${data.ltv}% del precio` },
            { label: 'Cuota mensual', value: fmt(r.cuotaMensual) + '/mes', sub: `TIN ${data.tin}% · ${data.plazoHip} años` },
          ]
        : [{ label: 'Forma de pago', value: 'Al contado', sub: fmt(r.precio) }]
    ),

    sectionHeading('Rentabilidad por alquiler'),
    kpiRow([
      { label: 'Rentabilidad bruta anual', value: fmtPct(r.rentBruta), sub: 'Sobre inversión total' },
      { label: 'Rentabilidad neta anual', value: fmtPct(r.rentNeta), sub: 'Tras gastos operativos' },
      r.financia && r.rentSobreAportacion !== null
        ? { label: 'Rent. neta sobre aportación', value: fmtPct(r.rentSobreAportacion), sub: 'Flujo de caja / capital propio' }
        : { label: 'Payback estimado', value: r.ingresoNeto > 0 ? Math.round(r.inversionTotal / r.ingresoNeto) + ' años' : '—', sub: 'Para recuperar la inversión' },
    ]),

    sectionHeading('Flujo de caja anual'),
    dataTable([
      ['Ingresos brutos por alquiler', fmt(r.ingresosBrutos)],
      ['Gastos operativos (comunidad, IBI, seguros, mant.)', '−' + fmt(r.gastosOp)],
      ['Ingreso neto anual', fmt(r.ingresoNeto)],
      ...(r.financia ? [['Cuotas de hipoteca anuales', '−' + fmt(r.cuotasAnuales)]] : []),
      [r.financia ? 'FLUJO DE CAJA NETO' : 'INGRESO NETO ANUAL', (r.flujoCaja < 0 ? '−' : '') + fmt(Math.abs(r.flujoCaja))],
    ], { boldLast: true }),

    sectionHeading('Estimación fiscal (IRPF)'),
    dataTable([
      ['Ingresos por alquiler (brutos)', fmt(r.ingresosBrutos)],
      ['Gastos deducibles estimados', '−' + fmt(r.gastosDeducibles)],
      ['Base imponible estimada', fmt(r.baseImponible)],
      ['IRPF estimado (tipo medio 21%)', '−' + fmt(r.irpf)],
      ['INGRESO NETO TRAS IRPF', fmt(r.netoTrasIRPF)],
    ], { boldLast: true }),

    noteParagraph(
      'El tipo efectivo depende de la base liquidable total del contribuyente. Para vivienda habitual del inquilino puede aplicarse reducción del 60% al rendimiento neto positivo (art. 23.2 LIRPF). Documento orientativo: la rentabilidad real depende de vacantes, derramas y evolución de mercado. Se recomienda complementar con asesoramiento profesional.'
    ),

    sectionHeading('Desglose de costes de compra'),
    dataTable([
      { section: 'Precio y gastos de adquisición' },
      ['Precio de compra', fmt(r.precio)],
      ...r.gastos.lineas.map(([l, v]) => [l, fmt(v)]),
      ...(r.reforma ? [['Reforma y acondicionamiento', fmt(r.reforma)]] : []),
      ...(r.honorarios ? [['Honorarios agencia', fmt(r.honorarios)]] : []),
      ['INVERSIÓN TOTAL', fmt(r.inversionTotal)],
    ], { boldLast: true }),
  ]

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [
      {
        properties: { page: pageSetup() },
        headers: { default: brandHeader() },
        footers: { default: brandFooter() },
        children,
      },
    ],
  })

  return Packer.toBlob(doc)
}

export function descargarBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
