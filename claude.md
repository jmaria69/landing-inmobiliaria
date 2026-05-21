# InmoTech — Documento de Referencia del Proyecto

## 📋 Resumen del Proyecto
**InmoTech** es una plataforma web (Landing Page + Dashboard CRM) diseñada para **vender soluciones tecnológicas a agencias inmobiliarias**. Construida como una SPA estática ultra-rápida, lista para hosting gratuito (Vercel/Netlify) y migrable a VPS con backend real.

---

## 🏗️ Arquitectura

```
landing-inmobiliaria/
├── index.html          → Landing Page de ventas
├── dashboard.html      → Dashboard CRM profesional
├── vite.config.js      → Multi-Page App config
├── src/
│   ├── style.css       → Estilos de la Landing Page
│   ├── main.js         → Lógica de la Landing (formularios, animaciones, calculadora ROI)
│   ├── dashboard.css   → Estilos del Dashboard
│   ├── dashboard.js    → Lógica del Dashboard (pestañas, gráficos, renderizado dinámico)
│   └── mockDb.js       → Base de datos simulada (JSON) — reemplazar por API en producción
└── dist/               → Build de producción (generado por Vite)
```

### Stack Tecnológico
| Capa | Tecnología | Motivo |
|------|-----------|--------|
| Bundler | Vite (Vanilla JS) | Ultra-rápido, zero-config, tree-shaking |
| Gráficos | Chart.js (CDN) | Gráficos interactivos sin dependencias npm pesadas |
| Fuentes | Google Fonts (Inter + Outfit) | Tipografía moderna profesional |
| Imágenes | Unsplash (URLs directas) | Fotos reales de propiedades sin peso local |
| Persistencia | localStorage + mockDb.js | Sin servidor, desplegable en hosting estático |

---

## 🎯 Buenas Prácticas Aplicadas

### Código
- **Modularidad:** Separación clara entre datos (`mockDb.js`), lógica (`dashboard.js`) y presentación (`dashboard.css`).
- **ES Modules:** Todo el JS usa `import/export` nativos de ES6.
- **Funciones puras:** Cada pestaña se renderiza con su propia función (`renderPropiedades()`, `renderLeadsCRM()`, `renderFinanzas()`, `renderAjustes()`).
- **DOM mínimo:** Las pestañas se generan dinámicamente solo cuando se necesitan, no todo de golpe.
- **Buscador en tiempo real:** Filtrado por `data-search` attributes, O(n) eficiente.

### CSS
- **Variables CSS (Custom Properties):** Un único punto de verdad para colores, sombras, radios.
- **Mobile-first responsive:** Breakpoints en 768px y 1200px.
- **Animaciones sutiles:** `fadeInTab` para transiciones de pestañas, `hover:translateY` en tarjetas.
- **BEM-light naming:** Clases descriptivas sin sobre-ingeniería (`.prop-card`, `.prop-card-img`, `.prop-card-body`).

### UX/UI
- **Diseño "Clean Light Mode":** Fondo `#f1f5f9`, tarjetas blancas con sombras suaves.
- **Tags con color semántico:** Rojo = Caliente/Urgente, Verde = Cerrado/Pagado, Amarillo = En progreso.
- **KPIs dinámicos:** Se calculan desde la BBDD, no son valores hardcodeados.
- **Conectividad Landing ↔ Dashboard:** Los leads capturados en la landing aparecen en el CRM del dashboard vía `localStorage`.

### Rendimiento
- **Build total < 50 KB** (sin contar Chart.js CDN).
- **Carga instantánea:** Sin framework pesado, sin SSR, sin API calls.
- **Imágenes lazy:** Unsplash con parámetro `w=800&q=80` para optimizar peso.

---

## 🚀 Despliegue

### Hosting Gratuito (Actual)
```bash
npm run build
# Subir carpeta /dist a Vercel, Netlify o GitHub Pages
```

### Producción en VPS (Futuro)
Para migrar a producción con BBDD real:
1. Crear un backend (Node.js + Express o similar).
2. Reemplazar `mockDb.js` por llamadas `fetch()` a endpoints REST.
3. Conectar a PostgreSQL / MongoDB.
4. Dockerizar con `docker-compose` (Node + DB).
5. Desplegar en VPS con Nginx como reverse proxy.

---

## 📁 Archivos Clave

| Archivo | Responsabilidad |
|---------|----------------|
| `mockDb.js` | 12 propiedades, 10 leads, 15 transacciones, KPIs pre-calculados |
| `dashboard.js` | Navegación por tabs, Chart.js, renderizado dinámico de todas las vistas |
| `main.js` | Calculadora ROI, simulador IA, formulario de captación, scroll animations |
| `style.css` | Landing page completa (hero, soluciones, plataforma, CTA) |
| `dashboard.css` | Dashboard completo (sidebar, grids, tablas, tarjetas, responsive) |

---

## ⚠️ Notas Importantes
- **localStorage** es la única persistencia actual. Los datos se pierden si el usuario limpia el navegador.
- **Chart.js** se carga desde CDN. Si se pierde conexión, los gráficos no aparecen. Para offline, instalar vía npm.
- Para **producción real**, nunca exponer datos sensibles en el frontend. La mockDb es solo para demo.
