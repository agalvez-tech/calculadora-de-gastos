// ── Formatters ────────────────────────────────────────────────────────────────
export const fmtEur = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n))

export const fmtEurD = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export const fmtPct = (n, t) => ((n / t) * 100).toFixed(1) + '%'

// ── Registro de la Propiedad — estimación fija orientativa ───────────────────
// El importe real varía según folios, copias y complejidad de la escritura.
// Se usa 600 € como estimación orientativa estándar.
export function calcRegistro() {
  return 600
}

// ── ITP Comunitat Valenciana ──────────────────────────────────────────────────
export function calcITP({ precio, edad, uso, familia, discapacidad, discapTipo }) {
  if (discapacidad) return { tasa: 4, bonif: discapTipo === 'mental' ? 'Discap. mental/intelectual/psíquica ≥33%' : 'Discap. física/sensorial ≥65%' }
  if (familia && precio <= 180000) return { tasa: 4, bonif: 'Familia numerosa/monoparental' }
  if (edad === 'joven' && uso === 'habitual' && precio <= 180000) return { tasa: 6, bonif: 'Joven <35 años' }
  if (precio > 1000000) return { tasa: 11, bonif: 'Vivienda >1M€' }
  return { tasa: 9, bonif: null }
}

// ── Hipoteca (sistema francés) ────────────────────────────────────────────────
export function calcCuota(capital, tinAnual, meses) {
  const r = (tinAnual / 100) / 12
  if (r === 0) return capital / meses
  return capital * (r * Math.pow(1 + r, meses)) / (Math.pow(1 + r, meses) - 1)
}

export function buildAmortRows(capital, cuota, tinAnual, meses, tinPost, mesesFijo) {
  const r = (tinAnual / 100) / 12
  const rows = []
  let pend = capital
  for (let m = 1; m <= meses; m++) {
    const tasa = (mesesFijo && m > mesesFijo) ? (tinPost / 100) / 12 : r
    const int = pend * tasa
    const cap = cuota - int
    pend = Math.max(0, pend - cap)
    rows.push({ m, cuota, cap, int, pend })
  }
  return rows
}

// ── Preset tipos de interés ───────────────────────────────────────────────────
export const TIPO_PRESETS = [
  { id: 'fija_3.0',    label: 'Fija 3,00%',                              tin: 3.0,  tipo: 'fija' },
  { id: 'fija_3.5',    label: 'Fija 3,50%',                              tin: 3.5,  tipo: 'fija' },
  { id: 'fija_3.75',   label: 'Fija 3,75%',                              tin: 3.75, tipo: 'fija' },
  { id: 'fija_4.0',    label: 'Fija 4,00%',                              tin: 4.0,  tipo: 'fija' },
  { id: 'fija_4.5',    label: 'Fija 4,50%',                              tin: 4.5,  tipo: 'fija' },
  { id: 'variable_075',label: 'Variable Euríbor + 0,75%',                tin: null, tipo: 'variable', diff: 0.75 },
  { id: 'variable_090',label: 'Variable Euríbor + 0,90%',                tin: null, tipo: 'variable', diff: 0.90 },
  { id: 'variable_100',label: 'Variable Euríbor + 1,00%',                tin: null, tipo: 'variable', diff: 1.00 },
  { id: 'mixta_10_35', label: 'Mixta 10a fijo 3,50% / Euríbor+0,90%',   tin: 3.5,  tipo: 'mixta', mesesFijo: 120, diff: 0.90 },
  { id: 'mixta_5_30',  label: 'Mixta 5a fijo 3,00% / Euríbor+0,90%',    tin: 3.0,  tipo: 'mixta', mesesFijo: 60,  diff: 0.90 },
  { id: 'custom',      label: 'Personalizado…',                           tin: null, tipo: 'custom' },
]
