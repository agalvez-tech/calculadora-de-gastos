import React from 'react'
import { Card, SectionTitle, Row, Field, Input, Select, Toggle, Divider, SuffixInput, InfoBox, Badge } from './UI.jsx'

export default function DatosPanel({ state, onChange }) {
  const { precio, tipoViv, uso, edad, familia, discapacidad, discapTipo, hipoteca, pctInmo } = state

  const set = (key, val) => onChange({ ...state, [key]: val })

  return (
    <>
      <Card>
        <SectionTitle icon="🏠">Datos de la operación</SectionTitle>
        <Row cols={2}>
          <Field label="Precio de compra (€)">
            <Input type="number" value={precio || ''} min={0} step={1000}
              onChange={e => set('precio', parseFloat(e.target.value) || 0)} placeholder="Introduce el precio" />
          </Field>
          <Field label="Tipo de vivienda">
            <Select value={tipoViv} onChange={e => set('tipoViv', e.target.value)}>
              <option value="segunda">Segunda mano</option>
              <option value="nueva">Obra nueva</option>
            </Select>
          </Field>
        </Row>
        <Row cols={2}>
          <Field label="Uso previsto">
            <Select value={uso} onChange={e => set('uso', e.target.value)}>
              <option value="habitual">Vivienda habitual</option>
              <option value="inversion">Inversión / 2ª residencia</option>
            </Select>
          </Field>
          <Field label="Edad del comprador">
            <Select value={edad} onChange={e => set('edad', e.target.value)}>
              <option value="normal">35 años o más</option>
              <option value="joven">Menor de 35 años</option>
            </Select>
          </Field>
        </Row>

        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 8 }}>
            Bonificaciones / situaciones especiales
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <Toggle active={familia} onClick={() => set('familia', !familia)}>
              Familia numerosa / monoparental
            </Toggle>
            <Toggle active={discapacidad} onClick={() => set('discapacidad', !discapacidad)}>
              Discapacidad
            </Toggle>
            <Toggle active={hipoteca} onClick={() => set('hipoteca', !hipoteca)}>
              Incluir hipoteca
            </Toggle>
          </div>
        </div>

        {familia && (
          <div style={{
            marginTop: 8, padding: '0.75rem 1rem',
            background: '#fafaf8', borderRadius: 10,
            border: '1px solid #e8e5e0',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>📋</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>
                  Carnet de familia numerosa o monoparental requerido
                </div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.55 }}>
                  Para aplicar el tipo reducido del <strong>4% de ITP</strong>, el comprador debe acreditar la condición con el <strong>carnet oficial vigente</strong> expedido por la Conselleria de Servicios Sociales de la Comunitat Valenciana (o equivalente de otra CCAA). Se exige su presentación ante notaría y en la autoliquidación del impuesto.
                </div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <Badge variant="green">Tipo general: 4% (hasta 180.000 €)</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {discapacidad && (
          <div style={{
            marginTop: 8, padding: '0.75rem 1rem',
            background: '#fafaf8', borderRadius: 10,
            border: '1px solid #e8e5e0',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
              Tipo de discapacidad reconocida
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                <input type="radio" name="discap" value="mental" checked={discapTipo === 'mental'}
                  onChange={() => set('discapTipo', 'mental')}
                  style={{ accentColor: '#cf731b', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>Mental, intelectual o psíquica</span>
                  <span style={{ fontSize: 11, color: '#888' }}> — grado igual o superior al <strong>33%</strong></span>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                <input type="radio" name="discap" value="fisica" checked={discapTipo === 'fisica'}
                  onChange={() => set('discapTipo', 'fisica')}
                  style={{ accentColor: '#cf731b', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>Física o sensorial</span>
                  <span style={{ fontSize: 11, color: '#888' }}> — grado igual o superior al <strong>65%</strong></span>
                </div>
              </label>
            </div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 8, lineHeight: 1.5 }}>
              Acreditar con certificado oficial de discapacidad vigente. Tipo reducido: <strong>4% ITP</strong>.
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle icon="🏪">Honorarios inmobiliaria</SectionTitle>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fafaf8', border: '1px solid #e8e5e0', borderRadius: 10,
          padding: '0.75rem 1rem', marginBottom: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#cf731b', color: '#fff', fontSize: 11, fontWeight: 800,
              padding: '3px 9px', borderRadius: 8,
            }}>RK</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>Honorarios agencia</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SuffixInput
              type="number" suffix="%" value={pctInmo} min={0} max={10} step={0.1}
              onChange={e => set('pctInmo', parseFloat(e.target.value) || 0)}
              style={{ width: 86 }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#cf731b', minWidth: 90, textAlign: 'right' }}>
              {new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Math.round(precio * pctInmo / 100))} €
            </span>
          </div>
        </div>
        <InfoBox>
          Porcentaje sobre precio de compra. <strong>Se añade IVA 21%</strong> al importe resultante. Editable según acuerdo con el cliente.
        </InfoBox>
      </Card>
    </>
  )
}
