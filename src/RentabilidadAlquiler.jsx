import { useState } from 'react'
import { calcularGastosCompra, calcularCuotaHipoteca, fmt, fmtPct } from './fiscal.js'
import {
  SectionTitle,
  FieldGrid,
  Field,
  NumberInput,
  Select,
  KpiGrid,
  Kpi,
  Signal,
  BreakdownTable,
  AlertBox,
  PrimaryButton,
  DownloadButton,
} from './components.jsx'

const PLAZOS = [15, 20, 25, 30]

function semaforoRenta(r) {
  if (r >= 6) return { level: 'green', text: 'Buena (≥6%)' }
  if (r >= 4) return { level: 'amber', text: 'Moderada (4-6%)' }
  return { level: 'red', text: 'Baja (<4%)' }
}

export default function RentabilidadAlquiler() {
  const [precio, setPrecio] = useState('')
  const [tipoInmueble, setTipoInmueble] = useState('segunda')
  const [reforma, setReforma] = useState('')
  const [honorarios, setHonorarios] = useState('')

  const [renta, setRenta] = useState('')
  const [mesesOcupados, setMesesOcupados] = useState(11)
  const [comunidad, setComunidad] = useState('')
  const [ibi, setIbi] = useState('')
  const [seguro, setSeguro] = useState('')
  const [seguroImpago, setSeguroImpago] = useState('')
  const [mantenimiento, setMantenimiento] = useState('')

  const [financia, setFinancia] = useState(false)
  const [ltv, setLtv] = useState(70)
  const [tin, setTin] = useState(3.5)
  const [plazoHip, setPlazoHip] = useState(25)

  const [resultado, setResultado] = useState(null)
  const [descargando, setDescargando] = useState(false)

  function n(v) {
    return parseFloat(v) || 0
  }

  function calcular() {
    const p = n(precio)
    if (!p) return

    const gastos = calcularGastosCompra(p, tipoInmueble)
    const reformaVal = n(reforma)
    const honorariosVal = n(honorarios)
    const inversionTotal = p + gastos.total + reformaVal + honorariosVal

    let cuotaMensual = 0
    let capitalFinanciado = 0
    let aportacionPropia = inversionTotal
    let interesesAnualesAprox = 0

    if (financia) {
      capitalFinanciado = p * (ltv / 100)
      cuotaMensual = calcularCuotaHipoteca(capitalFinanciado, tin, plazoHip)
      aportacionPropia = p * (1 - ltv / 100) + gastos.total + reformaVal + honorariosVal
      interesesAnualesAprox = capitalFinanciado * (tin / 100)
    }

    const rentaVal = n(renta)
    const meses = mesesOcupados || 11
    const ingresosBrutos = rentaVal * meses
    const comunidadVal = n(comunidad)
    const ibiVal = n(ibi)
    const seguroVal = n(seguro)
    const seguroImpagoVal = n(seguroImpago)
    const mantenimientoVal = n(mantenimiento)
    const gastosOp = comunidadVal + ibiVal + seguroVal + seguroImpagoVal + mantenimientoVal
    const gastosDeducibles = gastosOp + interesesAnualesAprox
    const ingresoNeto = ingresosBrutos - gastosOp
    const cuotasAnuales = cuotaMensual * 12
    const flujoCaja = ingresoNeto - (financia ? cuotasAnuales : 0)

    const rentBruta = inversionTotal > 0 ? (ingresosBrutos / inversionTotal) * 100 : 0
    const rentNeta = inversionTotal > 0 ? (ingresoNeto / inversionTotal) * 100 : 0
    const rentSobreAportacion = financia && aportacionPropia > 0 ? (flujoCaja / aportacionPropia) * 100 : null

    const baseImponible = Math.max(0, ingresosBrutos - gastosDeducibles)
    const irpf = baseImponible * 0.21
    const netoTrasIRPF = ingresoNeto - irpf

    setResultado({
      precio: p,
      tipoInmueble,
      gastos,
      reforma: reformaVal,
      honorarios: honorariosVal,
      inversionTotal,
      financia,
      capitalFinanciado,
      cuotaMensual,
      aportacionPropia,
      ingresosBrutos,
      meses,
      rentaVal,
      gastosOp,
      ingresoNeto,
      cuotasAnuales,
      flujoCaja,
      rentBruta,
      rentNeta,
      rentSobreAportacion,
      interesesAnualesAprox,
      gastosDeducibles,
      baseImponible,
      irpf,
      netoTrasIRPF,
    })
  }

  async function descargarDocumento() {
    if (!resultado) return
    setDescargando(true)
    try {
      const { generarDocxRentabilidad, descargarBlob } = await import('./docxGenerator.js')
      const blob = await generarDocxRentabilidad({
        r: resultado,
        ltv,
        tin,
        plazoHip,
        fmt,
        fmtPct,
      })
      descargarBlob(blob, `RK_Rentabilidad_Inversor_${Math.round(resultado.precio)}.docx`)
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
        <Field label="Gastos de reforma (€)">
          <NumberInput value={reforma} onChange={setReforma} placeholder="0" step={1000} />
        </Field>
        <Field label="Honorarios agencia (€)">
          <NumberInput value={honorarios} onChange={setHonorarios} placeholder="0" step={500} />
        </Field>
      </FieldGrid>

      <SectionTitle>Ingresos y gastos del alquiler</SectionTitle>
      <FieldGrid>
        <Field label="Renta mensual estimada (€)">
          <NumberInput value={renta} onChange={setRenta} placeholder="ej. 800" step={50} />
        </Field>
        <Field label="Meses al año ocupado">
          <NumberInput value={mesesOcupados} onChange={setMesesOcupados} min={1} step={1} />
        </Field>
        <Field label="Comunidad de propietarios/año (€)">
          <NumberInput value={comunidad} onChange={setComunidad} placeholder="600" step={100} />
        </Field>
        <Field label="IBI anual (€)">
          <NumberInput value={ibi} onChange={setIbi} placeholder="400" step={50} />
        </Field>
        <Field label="Seguro hogar/año (€)">
          <NumberInput value={seguro} onChange={setSeguro} placeholder="300" step={50} />
        </Field>
        <Field label="Seguro de impago/año (€)">
          <NumberInput value={seguroImpago} onChange={setSeguroImpago} placeholder="ej. 500" step={50} />
        </Field>
        <Field label="Mantenimiento/año (€)">
          <NumberInput value={mantenimiento} onChange={setMantenimiento} placeholder="500" step={100} />
        </Field>
      </FieldGrid>

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
            <Field label="Tipo interés anual (%)">
              <NumberInput value={tin} onChange={setTin} step={0.1} min={0.5} />
            </Field>
            <Field label="Plazo hipoteca">
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

      <PrimaryButton onClick={calcular}>Calcular rentabilidad</PrimaryButton>

      {resultado && (
        <div>
          <SectionTitle>Inversión total</SectionTitle>
          <KpiGrid>
            <Kpi label="Precio compra" value={fmt(resultado.precio)} sub={resultado.tipoInmueble === 'segunda' ? 'Segunda mano' : 'Obra nueva'} />
            <Kpi label="Gastos de compra" value={fmt(resultado.gastos.total)} sub="ITP/IVA+AJD · notaría · registro" />
            <Kpi label="Inversión total" value={fmt(resultado.inversionTotal)} sub="Precio + gastos + reforma + agencia" variant="accent" />
            {resultado.financia ? (
              <Kpi label="Aportación propia" value={fmt(resultado.aportacionPropia)} sub={`Entrada (${100 - ltv}%) + gastos`} />
            ) : (
              <Kpi label="Forma de pago" value="Al contado" sub={fmt(resultado.precio)} />
            )}
            {resultado.financia && <Kpi label="Capital hipotecario" value={fmt(resultado.capitalFinanciado)} sub={`${ltv}% del precio de compra`} />}
            {resultado.financia && (
              <Kpi label="Cuota mensual" value={fmt(resultado.cuotaMensual) + '/mes'} sub={`TIN ${tin}% · ${plazoHip} años`} />
            )}
          </KpiGrid>

          <SectionTitle>Rentabilidad por alquiler</SectionTitle>
          <KpiGrid>
            <Kpi
              label="Rent. bruta anual"
              value={fmtPct(resultado.rentBruta)}
              sub={
                <>
                  <Signal level={semaforoRenta(resultado.rentBruta).level} />
                  {semaforoRenta(resultado.rentBruta).text}
                </>
              }
              variant="accent"
            />
            <Kpi label="Rent. neta anual" value={fmtPct(resultado.rentNeta)} sub="Sobre inversión total · tras gastos op." />
            <Kpi label="Ingresos brutos/año" value={fmt(resultado.ingresosBrutos)} sub={`${resultado.meses} meses × ${resultado.rentaVal.toLocaleString('es-ES')} €`} />
            <Kpi label="Gastos operativos/año" value={fmt(resultado.gastosOp)} sub="Comunidad · IBI · seguros · mant." />
            <Kpi label="Ingreso neto/año" value={fmt(resultado.ingresoNeto)} sub="Antes de hipoteca e IRPF" />
            {resultado.financia && resultado.rentSobreAportacion !== null ? (
              <Kpi label="Rent. neta sobre aportación" value={fmtPct(resultado.rentSobreAportacion)} sub="Flujo de caja / capital propio aportado" variant="dark" />
            ) : (
              <Kpi
                label="Payback estimado"
                value={resultado.ingresoNeto > 0 ? Math.round(resultado.inversionTotal / resultado.ingresoNeto) + ' años' : '—'}
                sub="Años para recuperar la inversión"
              />
            )}
          </KpiGrid>

          <SectionTitle style={{ marginTop: 20 }}>Flujo de caja anual</SectionTitle>
          <KpiGrid cols={resultado.financia ? 4 : 3}>
            <Kpi label="Ingresos brutos/año" value={fmt(resultado.ingresosBrutos)} sub="Renta × meses ocupados" variant="green" />
            <Kpi label="Gastos operativos/año" value={fmt(resultado.gastosOp)} sub="Comunidad · IBI · seguros · mant." variant="amber" />
            {resultado.financia && (
              <Kpi label="Cuotas hipoteca/año" value={fmt(resultado.cuotasAnuales)} sub={`${fmt(resultado.cuotaMensual)}/mes × 12`} variant="red" />
            )}
            <Kpi
              label={resultado.financia ? 'Flujo de caja neto' : 'Ingreso neto anual'}
              value={(resultado.flujoCaja < 0 ? '−' : '') + fmt(Math.abs(resultado.flujoCaja))}
              sub={resultado.financia ? 'Tras gastos operativos y cuotas' : 'Tras gastos operativos'}
              variant={resultado.flujoCaja >= 0 ? 'dark' : 'red'}
            />
          </KpiGrid>

          <SectionTitle>Estimación fiscal (IRPF)</SectionTitle>
          <BreakdownTable
            rows={[
              { label: 'Ingresos por alquiler (brutos)', value: fmt(resultado.ingresosBrutos) },
              { label: 'Gastos deducibles estimados', value: '−' + fmt(resultado.gastosDeducibles) },
              ...(resultado.financia
                ? [{ label: '· Intereses hipoteca (1er año aprox.)', value: fmt(resultado.interesesAnualesAprox), indent: true, small: true }]
                : []),
              { label: 'Base imponible estimada', value: fmt(resultado.baseImponible) },
              { label: 'IRPF estimado (tipo medio 21%)', value: '−' + fmt(resultado.irpf) },
              { label: 'Ingreso neto tras IRPF', value: fmt(resultado.netoTrasIRPF), bold: true },
            ]}
          />
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
            El tipo efectivo depende de la base liquidable total del contribuyente. Para vivienda habitual del inquilino puede aplicarse reducción del 60% al rendimiento neto positivo (art. 23.2 LIRPF).
          </div>

          <SectionTitle>Desglose de costes de compra</SectionTitle>
          <BreakdownTable
            rows={[
              { section: 'Precio y gastos de adquisición' },
              { label: 'Precio de compra', value: fmt(resultado.precio) },
              ...resultado.gastos.lineas.map(([l, v]) => ({ label: l, value: fmt(v) })),
              ...(resultado.reforma ? [{ label: 'Reforma y acondicionamiento', value: fmt(resultado.reforma) }] : []),
              ...(resultado.honorarios ? [{ label: 'Honorarios agencia', value: fmt(resultado.honorarios) }] : []),
              { label: 'Inversión total', value: fmt(resultado.inversionTotal), bold: true },
            ]}
          />

          <AlertBox>
            ⚠️ Calculadora orientativa. La rentabilidad real depende de vacantes, derramas, evolución de mercado y situación fiscal individual. Recomendamos complementar con asesoramiento profesional.
          </AlertBox>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <DownloadButton onClick={descargarDocumento} loading={descargando}>
              Descargar documento para el inversor (.docx)
            </DownloadButton>
          </div>
        </div>
      )}
    </div>
  )
}
