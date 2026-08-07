# Bot conectado al inventario real de propiedades — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el chatbot InmoIA responda con propiedades reales de `mockDb.js` cuando preguntan por ciudad/tipo (ej. "¿qué pisos tienes por Madrid?"), en vez de caer siempre en el mensaje genérico de captación de lead.

**Architecture:** Nuevo módulo puro `src/propertyMatch.js` (`getPropertyAnswer(text)`) que busca ciudad + tipo en `propiedades` y devuelve una frase o `null`. `chat.js` lo llama antes del bucle sobre el KB fijo. `mockDb.js` crece de 12 a 100 propiedades (las 12 originales intactas + 88 nuevas en 22 ciudades nuevas).

**Tech Stack:** JS vanilla (ES Modules), sin frameworks. Tests con el test runner nativo de Node (`node:test` + `node:assert/strict`, Node v22 ya instalado) — cero dependencias nuevas. Verificación end-to-end con Playwright ejecutado desde un proyecto npm aislado en el directorio scratch (igual que en la verificación previa del bug), nunca añadido a `package.json` del repo.

## Global Constraints

- No motor de lenguaje real (LLM/embeddings) — seguir con matching de substrings, estilo "RAG simulado" ya usado en el proyecto.
- No parsing de presupuesto/rango de precio, ni memoria conversacional multi-turno. Fuera de alcance.
- No modificar el CRUD de `src/knowledgeBase.js` (añadir/borrar hechos desde el dashboard sigue igual).
- Las propiedades `id` 1-12 en `mockDb.js` NO pueden cambiar de `id` ni `nombre` — `transacciones` las referencia por nombre exacto en la pestaña Finanzas del dashboard.
- Cero dependencias nuevas en `package.json`. Nada de frameworks de test (usar `node:test` nativo).
- Reciclar las 12 URLs de imagen de Unsplash ya existentes para las 88 propiedades nuevas — no URLs nuevas.
- `claude.md` documenta un objetivo de build `<50 KB`. Añadir 100 propiedades suma ~30 KB a `mockDb.js`; es una desviación consciente y aceptada en el spec, no bloqueante.
- **Nota de entorno conocida en esta máquina:** si `npm run dev` falla con `vite: Permission denied`, ejecutar `chmod +x node_modules/.bin/*`. Si falla con `Cannot find native binding` / `@rolldown/binding-linux-x64-gnu`, ejecutar `npm install @rolldown/binding-linux-x64-gnu@1.0.2 --no-save` (ninguno de los dos toca `package.json`/`package-lock.json`, son fixes locales de `node_modules`, que está en `.gitignore`).

---

### Task 1: `src/propertyMatch.js` — motor de búsqueda por ciudad/tipo

**Files:**
- Create: `src/propertyMatch.js`
- Test: `src/propertyMatch.test.js`
- Modify: `package.json` (añadir script `test`)

**Interfaces:**
- Consumes: `propiedades` exportado por `src/mockDb.js` — array de objetos `{ id, nombre, tipo, ciudad, precio, alquiler, estado, habitaciones, m2, imagen, inquilino, rentabilidad }` (forma ya existente, sin cambios).
- Produces: `export function getPropertyAnswer(text, properties = propiedades)` → `string | null`. Task 3 importa y llama `getPropertyAnswer(lowerText)`.

- [ ] **Step 1: Escribir los tests (deben fallar — el módulo no existe todavía)**

Crear `src/propertyMatch.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPropertyAnswer } from './propertyMatch.js';

const fixture = [
  { id: 1, nombre: 'Ático Duplex Gran Vía', tipo: 'Ático', ciudad: 'Madrid', precio: 985000, alquiler: null, estado: 'En Venta', habitaciones: 4, m2: 220, imagen: 'x', inquilino: null, rentabilidad: 4.8 },
  { id: 2, nombre: 'Oficina Azca Premium', tipo: 'Comercial', ciudad: 'Madrid', precio: null, alquiler: 4800, estado: 'Alquilado', habitaciones: 0, m2: 320, imagen: 'x', inquilino: 'TechStart SL', rentabilidad: 5.1 },
  { id: 3, nombre: 'Piso Modernista Eixample', tipo: 'Piso', ciudad: 'Barcelona', precio: null, alquiler: 2800, estado: 'Alquilado', habitaciones: 3, m2: 145, imagen: 'x', inquilino: 'Carlos Vidal', rentabilidad: 5.2 },
];

test('devuelve null si no reconoce ninguna ciudad', () => {
  assert.equal(getPropertyAnswer('¿tenéis algo en Zaragoza?', fixture), null);
});

test('encuentra propiedades por ciudad y las nombra', () => {
  const answer = getPropertyAnswer('¿qué pisos tienes por Madrid?', fixture);
  assert.match(answer, /Madrid/);
  assert.match(answer, /Ático Duplex Gran Vía/);
  assert.match(answer, /€/);
});

test('filtra por tipo cuando el filtro no vacía el resultado', () => {
  const answer = getPropertyAnswer('¿tenéis oficina en Madrid?', fixture);
  assert.match(answer, /Oficina Azca Premium/);
  assert.doesNotMatch(answer, /Ático Duplex/);
});

test('ignora el filtro de tipo si lo deja vacío, y muestra la ciudad igualmente', () => {
  const answer = getPropertyAnswer('¿tenéis chalet en Barcelona?', fixture);
  assert.match(answer, /Piso Modernista Eixample/);
});

test('usa las propiedades reales de mockDb.js por defecto', () => {
  const answer = getPropertyAnswer('¿algo en Madrid?');
  assert.match(answer, /Madrid/);
});
```

- [ ] **Step 2: Confirmar que fallan**

Run: `node --test src/propertyMatch.test.js`
Expected: FAIL — `Cannot find module './propertyMatch.js'` (el archivo no existe todavía).

- [ ] **Step 3: Implementar `src/propertyMatch.js`**

```js
import { propiedades } from './mockDb.js';

const TYPE_KEYWORDS = {
  piso: ['Piso', 'Apartamento', 'Ático', 'Estudio', 'Penthouse'],
  pisos: ['Piso', 'Apartamento', 'Ático', 'Estudio', 'Penthouse'],
  apartamento: ['Apartamento', 'Piso', 'Estudio'],
  atico: ['Ático', 'Penthouse'],
  ático: ['Ático', 'Penthouse'],
  duplex: ['Ático', 'Penthouse'],
  penthouse: ['Penthouse', 'Ático'],
  casa: ['Chalet', 'Adosado', 'Villa', 'Rústico'],
  casas: ['Chalet', 'Adosado', 'Villa', 'Rústico'],
  chalet: ['Chalet', 'Adosado'],
  villa: ['Villa'],
  adosado: ['Adosado'],
  estudio: ['Estudio'],
  loft: ['Loft'],
  rustico: ['Rústico'],
  rústico: ['Rústico'],
  oficina: ['Comercial'],
  local: ['Comercial'],
  comercial: ['Comercial'],
};

function formatPrice(p) {
  return p.precio
    ? `${p.precio.toLocaleString('es-ES')}€`
    : `${p.alquiler.toLocaleString('es-ES')}€/mes`;
}

function formatAnswer(city, results) {
  const items = results.map(p => `${p.nombre} (${formatPrice(p)})`);
  const listado = items.length > 1
    ? `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
    : items[0];
  return `Sí, en ${city} tenemos disponible: ${listado}. ¿Quieres que un agente te pase más información?`;
}

export function getPropertyAnswer(text, properties = propiedades) {
  const lowerText = text.toLowerCase();
  const cities = [...new Set(properties.map(p => p.ciudad))];
  const matchedCity = cities.find(city => lowerText.includes(city.toLowerCase()));
  if (!matchedCity) return null;

  let results = properties.filter(p => p.ciudad === matchedCity);

  const matchedTypeWord = Object.keys(TYPE_KEYWORDS).find(word => lowerText.includes(word));
  if (matchedTypeWord) {
    const allowedTypes = TYPE_KEYWORDS[matchedTypeWord];
    const filtered = results.filter(p => allowedTypes.includes(p.tipo));
    if (filtered.length > 0) results = filtered;
  }

  return formatAnswer(matchedCity, results.slice(0, 3));
}
```

- [ ] **Step 4: Confirmar que los tests pasan**

Run: `node --test src/propertyMatch.test.js`
Expected: PASS — 5 tests, 0 fallos.

- [ ] **Step 5: Añadir script `test` a `package.json`**

En `package.json`, dentro de `"scripts"`, añadir:

```json
"test": "node --test src/*.test.js"
```

- [ ] **Step 6: Commit**

```bash
git add src/propertyMatch.js src/propertyMatch.test.js package.json
git commit -m "feat: motor de búsqueda de propiedades por ciudad/tipo para el bot"
```

---

### Task 2: Ampliar `src/mockDb.js` de 12 a 100 propiedades

**Files:**
- Modify: `src/mockDb.js`
- Test: `src/mockDb.test.js`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: `propiedades` (export existente de `src/mockDb.js`) pasa a tener 100 entradas, ids 1-100. Task 3 depende de esto para el city "Zaragoza" (no cubierta por las 12 originales) en su verificación end-to-end.

- [ ] **Step 1: Escribir el test de integridad (debe fallar — hoy hay 12, no 100)**

Crear `src/mockDb.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { propiedades } from './mockDb.js';

const ORIGINAL_12_NOMBRES = [
  'Ático Duplex Gran Vía', 'Piso Modernista Eixample', 'Villa con Piscina Marbella',
  'Apartamento Nuevo Levante', 'Loft Industrial Triana', 'Casa Adosada Pozuelo',
  'Estudio Céntrico Gótico', 'Chalet Zona Norte', 'Piso Playa La Malagueta',
  'Penthouse Torre Glòries', 'Casa Rural Sierra Norte', 'Oficina Azca Premium',
];

const CIUDADES_ESPERADAS = [
  'Madrid', 'Barcelona', 'Marbella', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga', 'Guadalajara',
  'Zaragoza', 'Murcia', 'Palma de Mallorca', 'Las Palmas de Gran Canaria',
  'Santa Cruz de Tenerife', 'A Coruña', 'Vigo', 'Gijón', 'Santander', 'Pamplona',
  'Logroño', 'Valladolid', 'Salamanca', 'Toledo', 'Badajoz', 'Cáceres', 'Córdoba',
  'Granada', 'Cádiz', 'Alicante', 'San Sebastián', 'Girona',
];

test('hay exactamente 100 propiedades', () => {
  assert.equal(propiedades.length, 100);
});

test('los ids son únicos y van de 1 a 100', () => {
  const ids = propiedades.map(p => p.id).sort((a, b) => a - b);
  assert.deepEqual(ids, Array.from({ length: 100 }, (_, i) => i + 1));
});

test('las 12 propiedades originales siguen intactas (las usa transacciones)', () => {
  const primeras12 = propiedades.filter(p => p.id <= 12).map(p => p.nombre);
  assert.deepEqual(primeras12, ORIGINAL_12_NOMBRES);
});

test('las 30 ciudades esperadas están todas presentes', () => {
  const ciudadesEnDatos = new Set(propiedades.map(p => p.ciudad));
  for (const ciudad of CIUDADES_ESPERADAS) {
    assert.ok(ciudadesEnDatos.has(ciudad), `Falta la ciudad: ${ciudad}`);
  }
});

test('toda propiedad alquilada tiene inquilino, y ninguna en venta lo tiene', () => {
  for (const p of propiedades) {
    if (p.estado === 'Alquilado') assert.ok(p.inquilino, `id ${p.id} alquilado sin inquilino`);
    if (p.estado === 'En Venta') assert.equal(p.inquilino, null, `id ${p.id} en venta con inquilino`);
  }
});
```

- [ ] **Step 2: Confirmar que fallan**

Run: `node --test src/mockDb.test.js`
Expected: FAIL — `propiedades.length` es 12, no 100.

- [ ] **Step 3: Generar las 88 propiedades nuevas y añadirlas a `mockDb.js`**

Este script es determinista (sin `Math.random`) y edita `src/mockDb.js` en el sitio, insertando las 88 propiedades nuevas justo antes del cierre del array `propiedades`. Guardarlo y ejecutarlo **desde la raíz del repo**:

```bash
mkdir -p /tmp/claude-1000/-home-jmari-proyectosIA-landing-inmobiliaria/f1cdaf69-5f60-4780-95b8-03fc7d29cf5a/scratchpad/genprop
cat > /tmp/claude-1000/-home-jmari-proyectosIA-landing-inmobiliaria/f1cdaf69-5f60-4780-95b8-03fc7d29cf5a/scratchpad/genprop/generate.mjs <<'SCRIPT'
import { readFileSync, writeFileSync } from 'node:fs';

const CITY_DATA = [
  ['Zaragoza', 1.0], ['Murcia', 0.85], ['Palma de Mallorca', 1.6],
  ['Las Palmas de Gran Canaria', 1.3], ['Santa Cruz de Tenerife', 1.25],
  ['A Coruña', 1.05], ['Vigo', 0.95], ['Gijón', 0.9], ['Santander', 1.1],
  ['Pamplona', 1.15], ['Logroño', 0.9], ['Valladolid', 0.85],
  ['Salamanca', 0.85], ['Toledo', 0.95], ['Badajoz', 0.65], ['Cáceres', 0.65],
  ['Córdoba', 0.8], ['Granada', 0.95], ['Cádiz', 1.05], ['Alicante', 1.15],
  ['San Sebastián', 1.7], ['Girona', 1.2],
];

const TYPE_SLOTS = [
  { tipo: 'Piso', habitaciones: 2, m2: 85, basePrice: 180000, baseRent: 850, prefix: 'Piso Centro' },
  { tipo: 'Chalet', habitaciones: 4, m2: 240, basePrice: 420000, baseRent: 1900, prefix: 'Chalet Residencial' },
  { tipo: 'Ático', habitaciones: 3, m2: 130, basePrice: 320000, baseRent: 1400, prefix: 'Ático Panorámico' },
  { tipo: 'Comercial', habitaciones: 0, m2: 180, basePrice: 250000, baseRent: 1600, prefix: 'Local Comercial' },
];

const IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  'https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
];

const TENANT_NAMES = [
  'Elena Castro', 'Javier Molina', 'Nuria Ferrer', 'Diego Herrera',
  'Patricia Lomas', 'Álvaro Nieto', 'Beatriz Cano', 'Rubén Iglesias',
];

let id = 13;
const nuevas = [];
CITY_DATA.forEach(([ciudad, tier], cityIdx) => {
  TYPE_SLOTS.forEach((slot, slotIdx) => {
    const enAlquiler = (cityIdx + slotIdx) % 2 === 0;
    const esVacante = (cityIdx + slotIdx) % 7 === 0;
    const estado = esVacante ? 'Vacante' : (enAlquiler ? 'Alquilado' : 'En Venta');
    const precio = estado === 'Alquilado' ? null : Math.round(slot.basePrice * tier / 1000) * 1000;
    const alquiler = estado === 'Alquilado' ? Math.round(slot.baseRent * tier / 10) * 10 : null;
    const inquilino = estado === 'Alquilado' ? TENANT_NAMES[(cityIdx * 4 + slotIdx) % TENANT_NAMES.length] : null;
    nuevas.push({
      id: id++,
      nombre: `${slot.prefix} ${ciudad}`,
      tipo: slot.tipo,
      ciudad,
      precio,
      alquiler,
      estado,
      habitaciones: slot.habitaciones,
      m2: slot.m2,
      imagen: IMAGES[(cityIdx * 4 + slotIdx) % IMAGES.length],
      inquilino,
      rentabilidad: Math.round((7.8 - tier * 2.2) * 10) / 10,
    });
  });
});

const lines = nuevas.map(p => {
  const precio = p.precio === null ? 'null' : p.precio;
  const alquiler = p.alquiler === null ? 'null' : p.alquiler;
  const inquilino = p.inquilino === null ? 'null' : `"${p.inquilino}"`;
  return `  { id: ${p.id}, nombre: "${p.nombre}", tipo: "${p.tipo}", ciudad: "${p.ciudad}", precio: ${precio}, alquiler: ${alquiler}, estado: "${p.estado}", habitaciones: ${p.habitaciones}, m2: ${p.m2}, imagen: "${p.imagen}", inquilino: ${inquilino}, rentabilidad: ${p.rentabilidad} },`;
});

const filePath = 'src/mockDb.js';
let content = readFileSync(filePath, 'utf8');
const marker = '];\n\nexport const leads = [';
if (!content.includes(marker)) {
  throw new Error('No se encontró el marcador de cierre de propiedades — revisa src/mockDb.js a mano');
}
content = content.replace(marker, lines.join('\n') + '\n' + marker);
writeFileSync(filePath, content);
console.log(`Insertadas ${nuevas.length} propiedades (ids ${nuevas[0].id}-${nuevas[nuevas.length - 1].id}) en ${filePath}`);
SCRIPT
node /tmp/claude-1000/-home-jmari-proyectosIA-landing-inmobiliaria/f1cdaf69-5f60-4780-95b8-03fc7d29cf5a/scratchpad/genprop/generate.mjs
```

Expected output: `Insertadas 88 propiedades (ids 13-100) en src/mockDb.js`

- [ ] **Step 4: Confirmar que los tests pasan**

Run: `node --test src/mockDb.test.js`
Expected: PASS — 5 tests, 0 fallos.

- [ ] **Step 5: Commit**

```bash
git add src/mockDb.js src/mockDb.test.js
git commit -m "feat: ampliar inventario de demo a 100 propiedades en 30 ciudades"
```

---

### Task 3: Conectar `propertyMatch.js` al chat y verificar end-to-end

**Files:**
- Modify: `src/chat.js`

**Interfaces:**
- Consumes: `getPropertyAnswer(text)` de `src/propertyMatch.js` (Task 1); `propiedades` con 100 entradas vía `mockDb.js` (Task 2, indirectamente a través de `propertyMatch.js`).
- Produces: nada nuevo exportado — cambia el comportamiento interno de `generateResponse()`.

**Depende de:** Task 1 y Task 2 completadas.

- [ ] **Step 1: Editar `src/chat.js`**

Añadir el import junto al de `knowledgeBase.js` (línea 1):

```js
import { getKnowledgeBase } from './knowledgeBase.js';
import { getPropertyAnswer } from './propertyMatch.js';
```

Dentro de `generateResponse(text)`, insertar la llamada entre el bloque de saludo y el bucle del KB (sustituir el bloque actual por este, renumerando los comentarios):

```js
  function generateResponse(text) {
    const lowerText = text.toLowerCase();

    // 1. Saludos por defecto
    if (lowerText.includes('hola') || lowerText.includes('buenos dias') || lowerText.includes('buenas tardes')) {
      return '¡Hola! Qué gusto saludarte. Soy el asistente de InmoTech. ¿Estás buscando comprar, vender o simplemente curioseando?';
    }

    // 2. Inventario real (ciudad / tipo de propiedad)
    const propertyAnswer = getPropertyAnswer(lowerText);
    if (propertyAnswer) {
      return propertyAnswer;
    }

    // 3. Recuperación (Retrieval) del Knowledge Base
    const kb = getKnowledgeBase();
```

El resto de la función (bucle de matches del KB y el `return` final de fallback) no cambia.

- [ ] **Step 2: Arrancar el servidor de desarrollo**

```bash
npm run dev -- --port 5173 --strictPort
```

Si falla, ver la nota de entorno en "Global Constraints" arriba (permiso de `node_modules/.bin` o binding nativo de rolldown).

- [ ] **Step 3: Verificación end-to-end en navegador real (Playwright, aislado del repo)**

```bash
mkdir -p /tmp/claude-1000/-home-jmari-proyectosIA-landing-inmobiliaria/f1cdaf69-5f60-4780-95b8-03fc7d29cf5a/scratchpad/pw
cd /tmp/claude-1000/-home-jmari-proyectosIA-landing-inmobiliaria/f1cdaf69-5f60-4780-95b8-03fc7d29cf5a/scratchpad/pw
npm init -y >/dev/null 2>&1
npm install playwright --no-audit --no-fund
```

Crear `verify.mjs` en ese mismo directorio:

```js
import { chromium } from 'playwright';

async function ask(page, text) {
  await page.fill('#chat-input', text);
  await page.click('#chat-send-btn');
  await page.waitForFunction(() => {
    const msgs = document.querySelectorAll('#chat-messages .bot-msg');
    return msgs.length > 0 && !document.querySelector('.typing-indicator');
  }, { timeout: 5000 });
  const bubbles = await page.$$eval('#chat-messages .bot-msg', els => els.map(e => e.textContent.trim()));
  return bubbles[bubbles.length - 1];
}

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.click('#chat-toggle-btn');
await page.waitForSelector('#chat-window.active');

const madrid = await ask(page, '¿Qué pisos tienes por Madrid?');
console.log('MADRID:', madrid);
if (!madrid.includes('Ático Duplex Gran Vía')) throw new Error('FALLO: Madrid no devolvió datos reales');

const zaragoza = await ask(page, '¿Tenéis algo en Zaragoza?');
console.log('ZARAGOZA:', zaragoza);
if (!/€/.test(zaragoza)) throw new Error('FALLO: Zaragoza (ciudad nueva) no devolvió datos reales');

const oficinaMadrid = await ask(page, '¿Tenéis oficina en Madrid?');
console.log('OFICINA MADRID:', oficinaMadrid);
if (!oficinaMadrid.includes('Oficina Azca')) throw new Error('FALLO: el filtro por tipo no funcionó');

const inventada = await ask(page, '¿Tenéis algo en Springfield?');
console.log('CIUDAD INVENTADA:', inventada);
if (!inventada.includes('formulario')) throw new Error('FALLO: el fallback no se mantuvo para una ciudad no reconocida');

const piscina = await ask(page, '¿Tenéis chalet con piscina?');
console.log('CONTROL PISCINA:', piscina);
if (!piscina.includes('piscina')) throw new Error('FALLO: regresión — el hecho fijo de piscina dejó de responder');

await page.goto('http://localhost:5173/dashboard.html', { waitUntil: 'networkidle' });
const propCount = await page.$$eval('.prop-card', els => els.length);
console.log('TARJETAS EN DASHBOARD:', propCount);
if (propCount !== 100) throw new Error(`FALLO: se esperaban 100 tarjetas de propiedad, hay ${propCount}`);

const kpiTotal = (await page.textContent('#kpi-total')).trim();
console.log('KPI TOTAL PROPIEDADES:', kpiTotal);
if (kpiTotal !== '100') throw new Error(`FALLO: KPI de propiedades totales es ${kpiTotal}, se esperaba 100`);

console.log('TODO OK');
await browser.close();
```

Run: `node verify.mjs`
Expected: siete líneas de log terminando en `TODO OK`, sin `throw` intermedio.

- [ ] **Step 4: Parar el servidor de desarrollo**

```bash
pkill -f "vite --port 5173" 2>/dev/null; true
```

- [ ] **Step 5: Commit**

```bash
git add src/chat.js
git commit -m "feat: conectar el chatbot al inventario real de propiedades"
```

---

## Self-Review

**Cobertura del spec:** arquitectura (Task 1+3), datos/100 propiedades/12 intactas (Task 2), lógica de matching con fallback de tipo (Task 1 tests), ejemplo de respuesta (Task 1 `formatAnswer`), casos límite — ciudad no reconocida y tipo que vacía el filtro (Task 1 tests + Task 3 verify.mjs), plan de pruebas manuales del spec (Task 3 Step 3, ahora automatizado con Playwright). Todo cubierto.

**Placeholders:** ninguno — cada step tiene código completo y ejecutable, sin "TBD" ni "similar a la task anterior".

**Consistencia de tipos/nombres:** `getPropertyAnswer(text, properties = propiedades)` se define igual en Task 1 y se consume igual (`getPropertyAnswer(lowerText)`) en Task 3. El marcador `'];\n\nexport const leads = ['` usado por el generador de Task 2 coincide exactamente con el `mockDb.js` real (confirmado leyendo el archivo). Nombres de las 12 propiedades originales en el test de Task 2 coinciden letra por letra con `mockDb.js`.
