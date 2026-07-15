# Visdiff Lab

Sitio de prueba simple para validar capturas y comparaciones visuales con Visdiff.

## Incluye

- 50 paginas: `/page/page-01` a `/page/page-50`.
- Sitemap: `/sitemap.xml`.
- Panel de control: `/admin`.
- Escenarios visuales por URL base:
  - `/scenario/missing-menu/page/page-01`
  - `/scenario/missing-footer/page/page-01`
  - `/scenario/no-images/page/page-01`
  - `/scenario/large-images/page/page-01`
  - `/scenario/text-change/page/page-01`
  - `/scenario/broken-mobile/page/page-01`
  - `/scenario/animation-on/page/page-01`
  - `/scenario/layout-shift/page/page-01`
  - `/scenario/mixed-regression/page/page-01`
- Errores HTTP reales:
  - `/status/400`
  - `/status/404`
  - `/status/500`
  - `/error/page-10/500`

## Uso con Visdiff

1. Usa la URL publicada como baseline URL.
2. Importa paginas desde `/sitemap.xml`.
3. Captura baseline.
4. Para target, usa una URL base de escenario, por ejemplo `/scenario/mixed-regression`.
5. Captura target y compara.

## Comandos

```powershell
npm install
npm run dev
npm run build
```

El build genera `dist/server/index.js` y `dist/_worker.js` para Sites.
