import { propiedades } from './propertiesData.js';

function normalize(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const TYPE_KEYWORDS = {
  piso: ['Piso', 'Apartamento', 'Ático', 'Estudio', 'Penthouse'],
  pisos: ['Piso', 'Apartamento', 'Ático', 'Estudio', 'Penthouse'],
  apartamento: ['Apartamento', 'Piso', 'Estudio'],
  atico: ['Ático', 'Penthouse'],
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
  oficina: ['Comercial'],
  local: ['Comercial'],
  comercial: ['Comercial'],
};

const CITY_ALIASES = {
  'palma': 'Palma de Mallorca',
  'las palmas': 'Las Palmas de Gran Canaria',
  'tenerife': 'Santa Cruz de Tenerife',
  'coruna': 'A Coruña',
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
  const lowerText = normalize(text.toLowerCase());
  const cities = [...new Set(properties.map(p => p.ciudad))];
  let matchedCity = cities.find(city => lowerText.includes(normalize(city.toLowerCase())));

  if (!matchedCity) {
    // Longest alias first: 'palma' is a substring of 'las palmas', so checking
    // short aliases first would make "las palmas" incorrectly match "palma".
    const alias = Object.keys(CITY_ALIASES)
      .sort((a, b) => b.length - a.length)
      .find(a => lowerText.includes(a));
    if (alias) matchedCity = cities.find(city => city === CITY_ALIASES[alias]);
  }

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
