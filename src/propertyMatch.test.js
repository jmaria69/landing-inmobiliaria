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
