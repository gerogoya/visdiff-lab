# Visdiff Lab

Sitio de prueba simple para validar capturas y comparaciones visuales con Visdiff.

## Que incluye

- 50 paginas de contenido basico: `/page/page-01` a `/page/page-50`.
- Sitemap XML con las 50 paginas: `/sitemap.xml`.
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

1. Crea un proyecto con baseline URL apuntando al sitio publicado, por ejemplo:
   `https://visdiff-lab.vercel.app`
2. Importa paginas desde `/sitemap.xml` o agrega rutas `/page/page-01`, etc.
3. Captura baseline.
4. Para target, usa `sourceBaseUrl` o cambia temporalmente la URL base a un escenario:
   `https://visdiff-lab.vercel.app/scenario/mixed-regression`
5. Captura target y compara.

## Comandos

```powershell
npm install
npm run dev
npm run build
```
