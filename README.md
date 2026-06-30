# Calculadora de Gastos RK Palanca Fontestad

App React para calcular los gastos de compraventa e hipoteca en la Comunitat Valenciana.

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
- Recharts (gráficas hipotecaria)
- Fuente Montserrat (Google Fonts)
- Sin dependencias de backend · Todo el cálculo en cliente

## Fiscalidad aplicada
- ITP C. Valenciana: 9% general, 11% >1M€, 6% jóvenes <35, 4% discapacidad/familia numerosa
- Registro: arancel RD 1427/1989 por tramos
- Notaría: arancel RD 1426/1989 estimado
- Ley 5/2019: gastos hipoteca a cargo del banco
