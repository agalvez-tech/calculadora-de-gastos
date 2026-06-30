# Calculadoras RK Palanca Fontestad

App React con dos calculadoras en pestañas, para uso de agentes con clientes:

1. **Gastos de compra e hipoteca** — ITP/IVA+AJD, notaría, registro, gestoría, bonificaciones (joven, familia numerosa, discapacidad) y simulador de hipoteca.
2. **Rentabilidad para inversores** — rentabilidad bruta/neta del alquiler, rentabilidad sobre aportación propia, flujo de caja anual y estimación de IRPF.

## Deploy en Vercel

### Opción A — Vercel CLI (recomendado)
```bash
npm install
npx vercel --prod
```

### Opción B — GitHub + Vercel Dashboard
1. Sube este repositorio a GitHub
2. Ve a [vercel.com/new](https://vercel.com/new)
3. Importa el repositorio
4. Framework: **Vite** (se detecta automáticamente)
5. Build command: `npm run build`
6. Output directory: `dist`
7. → Deploy

### Desarrollo local
```bash
npm install
npm run dev
```

## Tecnologías
- React 18 + Vite 5
- Fuente Montserrat (Google Fonts)
- Sin dependencias de backend · Todo el cálculo en cliente

## Fiscalidad aplicada (Comunitat Valenciana, vigente desde junio 2026)
- ITP: 9% general (hasta 1M€), 11% tramo superior; reducido 6% jóvenes <35 (≤180.000€); 4% familia numerosa/monoparental o discapacidad
- Obra nueva: IVA 10% + AJD 1,5%
- Notaría: arancel RD 1426/1989 estimado
- Registro de la Propiedad: estimación fija de 600 € (cálculo exacto no viable sin datos de finca)
- IRPF alquiler: estimación a tipo medio del 21% sobre base imponible (ingresos − gastos deducibles, incluidos intereses de hipoteca)

## Estructura del proyecto
```
src/
  App.jsx                  → shell con navegación por pestañas
  fiscal.js                → lógica fiscal compartida (ITP, IVA, AJD, notaría, hipoteca)
  components.jsx           → componentes UI reutilizables (KPI cards, campos, tablas)
  GastosHipoteca.jsx       → pestaña 1
  RentabilidadAlquiler.jsx → pestaña 2
```

Para añadir una tercera calculadora, crea un nuevo componente y añádelo al array `TABS` en `App.jsx`.
