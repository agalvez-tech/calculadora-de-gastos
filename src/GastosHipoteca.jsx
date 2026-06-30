import { useState } from 'react'
import { calcularGastosCompra, calcularCuotaHipoteca, fmt, fmtPct } from './fiscal.js'
import {
  SectionTitle,
  FieldGrid,
  Field,
  NumberInput,
  Select,
  Toggle,
  KpiGrid,
  Kpi,
  BreakdownTable,
  AlertBox,
  PrimaryButton,
  DownloadButton,
} from './components.jsx'

const PLAZOS = [15, 20, 25, 30]

export default function GastosHipoteca() {
  const [precio, setPrecio] = useState('')
  const [tipoInmueble, setTipoInmueble] = useState('segunda')
  const [honorariosPct, setHonorariosPct] = useState(3)

  const [joven35, setJoven35] = useState(false)
  const [familiaNumerosa, setFamiliaNumerosa] = useState(false)
  const [discapacidad, setDiscapacidad] = useState(false)

  const [financia, setFinancia] = useState(false)
  const [ltv, setLtv] = useState(70)
  const [tin, setTin] = useState(3.5)
  const [plazoHip, setPlazoHip] = useState(25)

  const [resultado, setResultado] = useState(null)
  const [descargando, setDescargando] = useState(false)

  function calcular() {
    const p = parseFloat(precio) || 0
    if (!p) return

    const gastos = calcularGastosCompra(p, tipoInmueble, { joven35, familiaNumerosa, discapacidad })
    const honorarios = p * (honorariosPct / 100)
    const totalComprador = p + gastos.total + honorarios

    let hipoteca = null
    if (financia) {
      const capital = p * (ltv / 100)
      const cuota = calcularCuotaHipoteca(capital, tin, plazoHip)
      const totalIntereses = cuota * plazoHip * 12 - capital
      hipoteca = {
        capital,
        cuota,
        totalIntereses,
        aportacionPropia: p * (1 - ltv / 100) + gastos.total + honorarios,
      }
    }

    setResultado({ precio: p, gastos, honorarios, totalComprador, hipoteca, tipoInmueble, ltv, tin, plazoHip })
  }

  async function descargarDocumento() {
    if (!resultado) return
    setDescargando(true)
    try {
      const { generarDocxGastos, descargarBlob } = await import('./docxGenerator.js')
      const tipoLabel = resultado.tipoInmueble === 'segunda' ? 'Segunda mano' : 'Obra nueva'
      const blob = await generarDocxGastos({
        precio: resultado.precio,
        tipoLabel,
        gastos: resultado.gastos,
        honorarios: resultado.honorarios,
        totalComprador: resultado.totalComprador,
        hipoteca: resultado.hipoteca,
        ltv: resultado.ltv,
        tin: resultado.tin,
        plazoHip: resultado.plazoHip,
        fmt,
        fmtPct,
      })
      descargarBlob(blob, `RK_Gastos_Compra_${Math.round(resultado.precio)}.docx`)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 680, margin: '0 auto' }}>
      <SectionTitle style={{ marginTop: 0 }}>Datos de la operación</SectionTitle>
      <FieldGrid>
        <Field label="Precio de compra (€)">
          <NumberInput value={precio} onChange={setPrecio} placeholder="ej. 150.000" step={1000} />
        </Field>
        <Field label="Tipo de inmueble">
          <Select value={tipoInmueble} onChange={setTipoInmueble}>
            <option value="segunda">Segunda mano</option>
            <option value="nueva">Obra nueva</option>
          </Select>
        </Field>
        <Field label="Honorarios agencia (%)">
          <NumberInput value={honorariosPct} onChange={setHonorariosPct} step={0.5} />
        </Field>
      </FieldGrid>

      {tipoInmueble === 'segunda' && (
        <>
          <SectionTitle>Bonificaciones ITP (requieren documentación oficial)</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Toggle checked={joven35} onChange={setJoven35} label="Menor de 35 años (vivienda ≤180.000€) — ITP 6%" />
            <Toggle checked={familiaNumerosa} onChange={setFamiliaNumerosa} label="Familia numerosa o monoparental — ITP 4%" />
            <Toggle checked={discapacidad} onChange={setDiscapacidad} label="Discapacidad (≥33% psíquica o ≥65% física/sensorial) — ITP 4%" />
          </div>
        </>
      )}

      <SectionTitle>Financiación</SectionTitle>
      <FieldGrid>
        <Field label="¿Financia con hipoteca?">
          <Select value={financia ? 'si' : 'no'} onChange={(v) => setFinancia(v === 'si')}>
            <option value="no">No, compra al contado</option>
            <option value="si">Sí, con hipoteca</option>
          </Select>
        </Field>
        {financia && (
          <>
            <Field label="Financiación (%)">
              <NumberInput value={ltv} onChange={setLtv} step={5} min={10} />
            </Field>
            <Field label="TIN anual (%)">
              <NumberInput value={tin} onChange={setTin} step={0.1} min={0.5} />
            </Field>
            <Field label="Plazo">
              <Select value={plazoHip} onChange={(v) => setPlazoHip(parseInt(v))}>
                {PLAZOS.map((p) => (
                  <option key={p} value={p}>
                    {p} años
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}
      </FieldGrid>

      <PrimaryButton onClick={calcular}>Calcular gastos</PrimaryButton>

      {resultado && (
        <div>
          <SectionTitle>Resumen de la inversión</SectionTitle>
          <KpiGrid>
            <Kpi label="Precio compra" value={fmt(resultado.precio)} sub={resultado.tipoInmueble === 'nueva' ? 'Obra nueva' : 'Segunda mano'} />
            <Kpi label="Gastos e impuestos" value={fmt(resultado.gastos.total)} sub={resultado.gastos.tipoAplicado} />
            <Kpi label="Total a pagar" value={fmt(resultado.totalComprador)} sub="Precio + gastos + honorarios" variant="accent" />
            {resultado.hipoteca && (
              <>
                <Kpi label="Aportación propia" value={fmt(resultado.hipoteca.aportacionPropia)} sub={`Entrada (${100 - ltv}%) + gastos`} />
                <Kpi label="Capital hipotecario" value={fmt(resultado.hipoteca.capital)} sub={`${ltv}% del precio`} />
                <Kpi label="Cuota mensual" value={fmt(resultado.hipoteca.cuota) + '/mes'} sub={`TIN ${tin}% · ${plazoHip} años`} />
              </>
            )}
          </KpiGrid>

          {resultado.hipoteca && (
            <>
              <SectionTitle>Detalle de la hipoteca</SectionTitle>
              <KpiGrid cols={2}>
                <Kpi label="Financiación" value={fmtPct(ltv)} sub="Sobre el precio de compra" />
                <Kpi label="Total intereses" value={fmt(resultado.hipoteca.totalIntereses)} sub={`A lo largo de ${plazoHip} años`} />
              </KpiGrid>
            </>
          )}

          <SectionTitle>Desglose de gastos de compra</SectionTitle>
          <BreakdownTable
            rows={[
              { section: 'Precio y gastos de adquisición' },
              { label: 'Precio de compra', value: fmt(resultado.precio) },
              ...resultado.gastos.lineas.map(([l, v]) => ({ label: l, value: fmt(v) })),
              { label: 'Honorarios agencia', value: fmt(resultado.honorarios) },
              { label: 'TOTAL A PAGAR', value: fmt(resultado.totalComprador), bold: true },
            ]}
          />

          <AlertBox>
            ⚠️ Calculadora orientativa. Las bonificaciones del ITP requieren cumplir los requisitos documentales exigidos por la Generalitat Valenciana (carnet de familia numerosa, certificado de discapacidad, etc.). El registro de la propiedad se estima en 600 € a falta de los datos exactos de la finca.
          </AlertBox>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <DownloadButton onClick={descargarDocumento} loading={descargando}>
              Descargar documento para el comprador (.docx)
            </DownloadButton>
          </div>
        </div>
      )}
    </div>
  )
}
