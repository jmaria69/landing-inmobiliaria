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
