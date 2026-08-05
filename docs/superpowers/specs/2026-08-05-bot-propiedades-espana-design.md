# Bot RAG: respuestas basadas en el inventario real de propiedades

## Contexto

Verificamos en vivo (navegador real, Playwright) que el chatbot InmoIA de la
landing (`src/chat.js`) responde a preguntas sobre propiedades ("¿qué pisos
tienes por Madrid?") con el mensaje genérico de captación de lead, para
cualquier ciudad, no solo Madrid.

Causa raíz: `generateResponse()` en `src/chat.js` solo busca coincidencias en
`src/knowledgeBase.js`, una lista fija de 6 hechos (horario, ubicación,
piscina/chalet genérico, precio, hipoteca, cita). Nunca consulta
`src/mockDb.js`, que ya tiene un array `propiedades` con inventario real
(nombre, ciudad, tipo, precio/alquiler, habitaciones, m², estado). El bot
literalmente no ve su propio inventario.

`src/mockDb.js` alimenta hoy solo el dashboard/CRM (`dashboard.js`), nunca el
chat.

## Objetivo

Que el chatbot conteste con datos reales cuando el visitante pregunta por una
ciudad (y opcionalmente un tipo de propiedad) que existe en `propiedades`,
sin tocar el mecanismo de KB fijo que ya funciona para el resto de preguntas
(horario, hipoteca, citas...).

## Fuera de alcance

- Motor de lenguaje real (embeddings/LLM) — seguimos con matching de
  substrings, igual que el resto del proyecto ("RAG simulado").
- Parsing de presupuesto/rango de precio ("piso barato", "menos de 300.000€").
- Memoria conversacional / contexto multi-turno.
- Cambios visuales en el widget de chat o en el dashboard.
- Cambios en el CRUD de `knowledgeBase.js` (añadir/borrar hechos desde el
  dashboard sigue igual).
- Arreglar el caso en que el mensaje mezcla saludo + pregunta de propiedad en
  la misma frase (hoy el saludo tiene prioridad y corta ahí; se queda así).

## Enfoque elegido

De tres opciones planteadas (fusionar propiedades como hechos sintéticos del
KB / función dedicada de matching / parser de intención completo con
presupuesto), se eligió la **función dedicada** (`propertyMatch.js`): resuelve
el bug reportado (ciudad, y de propina tipo), queda aislada y testeable, y no
añade conceptos nuevos al proyecto (mismo estilo de arrays + substring
matching que ya usa `knowledgeBase.js`). El parser completo con presupuesto se
descarta por sobre-ingeniería para un dataset de demo; fusionar como hechos
sintéticos del KB se descarta porque no permite filtrar por tipo dentro de
una misma ciudad.

## Arquitectura

**Nuevo archivo `src/propertyMatch.js`** — única responsabilidad: dado un
texto de usuario, devolver una respuesta en lenguaje natural basada en
`propiedades`, o `null` si no reconoce ninguna ciudad mencionada.

```
export function getPropertyAnswer(text) { ... }
```

No toca `localStorage` ni el CRUD de hechos — eso se queda solo en
`knowledgeBase.js`. Importa `propiedades` desde `mockDb.js` (solo lectura).

**`src/chat.js`** — añade `import { getPropertyAnswer } from './propertyMatch.js';`
y, dentro de `generateResponse()`, una llamada justo después del chequeo de
saludo y antes del bucle sobre el KB fijo:

```
// 2. Inventario real (ciudad / tipo de propiedad)
const propertyAnswer = getPropertyAnswer(lowerText);
if (propertyAnswer) return propertyAnswer;

// 3. Recuperación del Knowledge Base (como hoy)
...
```

Si `getPropertyAnswer` devuelve `null`, el flujo sigue exactamente igual que
hoy (KB fijo → mensaje de captación).

**Sin cambios** en `knowledgeBase.js`, `dashboard.js` (ya deriva todo de
`propiedades`/`kpis` dinámicamente) ni en la estructura de `mockDb.js` —
solo crece el array `propiedades`.

## Datos: ampliar `propiedades` a 100

Las **12 propiedades actuales no se modifican** (mismo `id`, `nombre`,
`ciudad`...): `transacciones` las referencia por nombre exacto en la pestaña
Finanzas del dashboard, y renombrarlas o quitarlas rompería esa vista.

Se añaden **88 propiedades nuevas** (`id` 13-100), repartidas en **22 ciudades
nuevas, 4 propiedades cada una**:

Zaragoza, Murcia, Palma de Mallorca, Las Palmas de Gran Canaria, Santa Cruz de
Tenerife, A Coruña, Vigo, Gijón, Santander, Pamplona, Logroño, Valladolid,
Salamanca, Toledo, Badajoz, Cáceres, Córdoba, Granada, Cádiz, Alicante, San
Sebastián, Girona.

Junto con las 8 ciudades originales (Madrid, Barcelona, Marbella, Valencia,
Sevilla, Bilbao, Málaga, Guadalajara), quedan **30 ciudades** cubriendo las 17
comunidades autónomas + Baleares + Canarias.

Reglas de generación para las 88 nuevas:

- **Tipo/habitaciones/m²** coherentes con lo ya existente: Estudio (~1
  hab/35-45m²), Piso/Apartamento (~2-3 hab/70-110m²), Ático/Penthouse (~3-5
  hab, más m²), Chalet/Villa/Adosado (~4-6 hab/200-400m²), Comercial (0 hab,
  m² variable).
- **Precio/alquiler** variando por ciudad (Madrid/Barcelona/Baleares/Canarias
  más caras que ciudades de interior) y por tipo (Villa/Chalet > Piso >
  Estudio).
- **rentabilidad**: ~3.5%-7.5%, inversamente relacionada con el precio (lujo =
  yield más bajo, como en los datos actuales).
- **Fotos**: se reciclan las 12 URLs de Unsplash ya usadas (round-robin) — sin
  URLs nuevas que puedan romperse.
- **estado**: mezcla realista de "En Venta"/"Alquilado"/"Vacante" (proporción
  similar a la actual); `inquilino` solo si `estado === 'Alquilado'`, si no
  `null` — mismo patrón que hoy.

`kpis` en `mockDb.js` ya se calcula dinámicamente desde `propiedades.length` y
`.filter()`, no son números fijos, así que no requiere ningún cambio y sigue
correcto automáticamente con 100 propiedades.

**Nota de peso:** `claude.md` documenta como objetivo "build < 50 KB" para el
proyecto. 100 propiedades como array plano añaden aproximadamente 30 KB de
texto fuente a `mockDb.js`. Se acepta conscientemente para este alcance
(sigue siendo JSON estático sin dependencias nuevas), pero queda anotado por
ser un objetivo explícito y documentado del proyecto.

## Lógica de matching (`propertyMatch.js`)

1. Derivar la lista de ciudades únicas desde `propiedades` en tiempo de
   carga del módulo (no hardcodear una lista aparte).
2. Sobre el texto en minúsculas, comprobar si contiene alguna de esas
   ciudades (substring, igual estilo que el resto del bot).
3. Si hay ciudad: filtrar `propiedades` por esa ciudad.
4. Comprobar si el texto contiene alguna palabra de un mapa corto de tipos
   (`piso`/`apartamento` → Piso/Apartamento/Ático/Estudio/Penthouse;
   `casa`/`chalet` → Chalet/Adosado/Villa/Rústico; `oficina`/`local` →
   Comercial; etc.). Si hay coincidencia y el filtro no deja la lista vacía,
   aplicarlo; si la deja vacía, ignorar el filtro de tipo y mostrar la ciudad
   completa (mejor mostrar algo relevante que nada).
5. Tomar hasta 3 resultados, en el orden en que aparecen en el array
   (determinista, fácil de probar).
6. Formatear una frase natural con nombre + precio (si `precio`) o alquiler
   (si `alquiler`) de cada resultado, cerrando con una pregunta de
   seguimiento, mismo tono que las respuestas existentes del KB.
7. Sin ciudad reconocida → devolver `null`; `chat.js` sigue con el KB fijo y
   después el mensaje de captación, igual que hoy — comportamiento honesto
   para ciudades fuera de cobertura, no una regresión.

## Ejemplo de respuesta

> Usuario: "¿Qué pisos tienes por Madrid?"
> Bot: "Sí, en Madrid tenemos varias propiedades disponibles: un Ático Duplex
> en Gran Vía (985.000€), una Casa Adosada en Pozuelo (3.200€/mes) y una
> Oficina en Azca (4.800€/mes). ¿Quieres que te pase el catálogo completo?"

## Casos límite

- Ciudad reconocida pero el tipo pedido no existe ahí → se ignora el filtro
  de tipo y se muestra la ciudad completa (paso 4 arriba).
- Ciudad no reconocida (fuera de las 30) → `null`, cae al flujo actual
  (KB → mensaje de captación).
- Saludo + pregunta de propiedad en el mismo mensaje → el saludo sigue
  teniendo prioridad (comportamiento actual sin cambios, ver "Fuera de
  alcance").

## Plan de pruebas manuales (tras implementar)

Repitiendo el mismo método de verificación en navegador real (Playwright)
usado para diagnosticar el bug original:

1. Reproducir la pregunta original de Madrid → debe responder con datos
   reales, sin necesitar enseñar nada manualmente desde el dashboard.
2. Ciudad nueva cubierta (ej. "¿algo en Zaragoza?").
3. Ciudad no cubierta (ej. una inventada) → debe seguir cayendo al mensaje de
   captación.
4. Combinación tipo + ciudad (ej. "oficina en Madrid").
5. Repetir el control ya usado en la verificación anterior ("¿tenéis chalet
   con piscina?") → debe seguir funcionando igual que antes.
6. Revisar pestañas "Propiedades" y "Finanzas" del dashboard con 100
   propiedades: KPIs cuadran, buscador sigue filtrando, y las transacciones
   siguen casando con sus 12 propiedades originales.

## Riesgos / seguimiento

- Tamaño añadido a `mockDb.js` (~30 KB) frente al objetivo `<50 KB` de
  `claude.md` — aceptado, ver nota arriba.
- Si en el futuro se necesitan filtros combinados más ricos (presupuesto,
  varias ciudades a la vez), retomar el "Enfoque C" descartado en este spec.
