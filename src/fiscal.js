// Lógica fiscal compartida — Comunitat Valenciana, vigente desde junio 2026

export function calcularGastosCompra(precio, tipo, opciones = {}) {
  const {
    joven35 = false,
    familiaNumerosa = false,
    discapacidad = false,
  } = opciones

  let itp = 0
  let iva = 0
  let ajd = 0
  let tipoAplicado = null

  if (tipo === 'segunda') {
    // Tipos reducidos (requieren cumplir requisitos documentales)
    if (discapacidad) {
      itp = precio * 0.04
      tipoAplicado = '4% (discapacidad)'
    } else if (familiaNumerosa) {
      itp = precio * 0.04
      tipoAplicado = '4% (familia numerosa / monoparental)'
    } else if (joven35 && precio <= 180000) {
      itp = precio * 0.06
      tipoAplicado = '6% (menor de 35 años)'
    } else {
      itp = precio <= 1000000 ? precio * 0.09 : 1000000 * 0.09 + (precio - 1000000) * 0.11
      tipoAplicado = precio <= 1000000 ? '9% general' : '9% / 11% (tramo >1M€)'
    }
  } else {
    iva = precio * 0.10
    ajd = precio * 0.015
    tipoAplicado = 'IVA 10% + AJD 1,5%'
  }

  const p = precio
  let notaria = 0
  if (p <= 6010) notaria = 90
  else if (p <= 30050) notaria = 90 + (p - 6010) * 0.0045
  else if (p <= 60101) notaria = 199 + (p - 30050) * 0.0015
  else if (p <= 150253) notaria = 244 + (p - 60101) * 0.001
  else if (p <= 601012) notaria = 334 + (p - 150253) * 0.0005
  else notaria = 560 + (p - 601012) * 0.0003
  notaria = Math.min(notaria, 2400)

  const registro = 600 // estimación fija — el cálculo exacto por aranceles no es viable sin más datos
  const gestoria = 400

  const impuesto = tipo === 'segunda' ? itp : iva + ajd
  const total = impuesto + notaria + registro + gestoria

  const lineas =
    tipo === 'segunda'
      ? [
          [`ITP (${tipoAplicado})`, itp],
          ['Notaría (arancel RD 1426/1989)', notaria],
          ['Registro de la Propiedad (estimado)', registro],
          ['Gestoría', gestoria],
        ]
      : [
          ['IVA (10%)', iva],
          ['AJD (1,5%)', ajd],
          ['Notaría (arancel RD 1426/1989)', notaria],
          ['Registro de la Propiedad (estimado)', registro],
          ['Gestoría', gestoria],
        ]

  return { itp, iva, ajd, notaria, registro, gestoria, impuesto, total, lineas, tipoAplicado }
}

export function calcularCuotaHipoteca(capital, tinAnual, plazoAnios) {
  const r = tinAnual / 100 / 12
  const n = plazoAnios * 12
  if (r === 0) return capital / n
  return (capital * r) / (1 - Math.pow(1 + r, -n))
}

export function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €'
}

export function fmtPct(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return n.toFixed(2) + '%'
}
