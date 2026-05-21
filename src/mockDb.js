// ============================================================
// InmoTech - Mock Database (BBDD de Demostración)
// Simula el comportamiento de una BBDD real.
// Para producción en VPS, reemplazar con llamadas a una API REST.
// ============================================================

export const propiedades = [
  { id: 1, nombre: "Ático Duplex Gran Vía", tipo: "Ático", ciudad: "Madrid", precio: 985000, alquiler: null, estado: "En Venta", habitaciones: 4, m2: 220, imagen: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", inquilino: null, rentabilidad: 4.8 },
  { id: 2, nombre: "Piso Modernista Eixample", tipo: "Piso", ciudad: "Barcelona", precio: null, alquiler: 2800, estado: "Alquilado", habitaciones: 3, m2: 145, imagen: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", inquilino: "Carlos Vidal", rentabilidad: 5.2 },
  { id: 3, nombre: "Villa con Piscina Marbella", tipo: "Villa", ciudad: "Marbella", precio: 2100000, alquiler: null, estado: "En Venta", habitaciones: 6, m2: 580, imagen: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", inquilino: null, rentabilidad: 3.9 },
  { id: 4, nombre: "Apartamento Nuevo Levante", tipo: "Apartamento", ciudad: "Valencia", precio: null, alquiler: 1100, estado: "Alquilado", habitaciones: 2, m2: 72, imagen: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", inquilino: "Ana Martínez", rentabilidad: 5.8 },
  { id: 5, nombre: "Loft Industrial Triana", tipo: "Loft", ciudad: "Sevilla", precio: 395000, alquiler: null, estado: "En Venta", habitaciones: 1, m2: 110, imagen: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80", inquilino: null, rentabilidad: 6.1 },
  { id: 6, nombre: "Casa Adosada Pozuelo", tipo: "Adosado", ciudad: "Madrid", precio: null, alquiler: 3200, estado: "Alquilado", habitaciones: 5, m2: 290, imagen: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80", inquilino: "Roberto Sáenz", rentabilidad: 4.4 },
  { id: 7, nombre: "Estudio Céntrico Gótico", tipo: "Estudio", ciudad: "Barcelona", precio: 195000, alquiler: null, estado: "Vacante", habitaciones: 1, m2: 38, imagen: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", inquilino: null, rentabilidad: 7.2 },
  { id: 8, nombre: "Chalet Zona Norte", tipo: "Chalet", ciudad: "Bilbao", precio: null, alquiler: 2100, estado: "Alquilado", habitaciones: 4, m2: 210, imagen: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", inquilino: "Marta Eguren", rentabilidad: 4.9 },
  { id: 9, nombre: "Piso Playa La Malagueta", tipo: "Piso", ciudad: "Málaga", precio: 520000, alquiler: null, estado: "En Venta", habitaciones: 3, m2: 105, imagen: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80", inquilino: null, rentabilidad: 5.5 },
  { id: 10, nombre: "Penthouse Torre Glòries", tipo: "Penthouse", ciudad: "Barcelona", precio: null, alquiler: 6500, estado: "Alquilado", habitaciones: 5, m2: 380, imagen: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", inquilino: "Inversiones Grupo Alpha", rentabilidad: 3.7 },
  { id: 11, nombre: "Casa Rural Sierra Norte", tipo: "Rústico", ciudad: "Guadalajara", precio: 280000, alquiler: null, estado: "En Venta", habitaciones: 4, m2: 190, imagen: "https://images.unsplash.com/photo-1448630360428-65456885c650?w=800&q=80", inquilino: null, rentabilidad: 6.8 },
  { id: 12, nombre: "Oficina Azca Premium", tipo: "Comercial", ciudad: "Madrid", precio: null, alquiler: 4800, estado: "Alquilado", habitaciones: 0, m2: 320, imagen: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", inquilino: "TechStart SL", rentabilidad: 5.1 },
];

export const leads = [
  { id: 1, nombre: "Laura Domínguez", email: "l.dominguez@agenciadomo.es", agencia: "Agencia Domo", telefono: "612 345 678", estado: "Caliente", fecha: "2026-05-20", origen: "Landing Page", notas: "Interesada en el módulo de captación IA." },
  { id: 2, nombre: "Pedro Alcántara", email: "pedro@inmopremium.com", agencia: "InmoPremium SL", telefono: "693 210 445", estado: "En Progreso", fecha: "2026-05-19", origen: "LinkedIn", notas: "Agencia con 5 agentes. Quiere plan Profesional." },
  { id: 3, nombre: "Sofía Reyes", email: "sofia.r@casasur.net", agencia: "CasaSur Gestión", telefono: "650 987 123", estado: "Caliente", fecha: "2026-05-18", origen: "Landing Page", notas: "Solicita demo la próxima semana." },
  { id: 4, nombre: "Miguel Fernández", email: "mfernandez@propiedad360.es", agencia: "Propiedad 360", telefono: "677 543 210", estado: "Frío", fecha: "2026-05-15", origen: "Referido", notas: "Precio es su mayor preocupación." },
  { id: 5, nombre: "Carmen Ruiz", email: "c.ruiz@grupocarmelo.es", agencia: "Grupo Carmelo", telefono: "611 222 333", estado: "Caliente", fecha: "2026-05-14", origen: "Landing Page", notas: "Gran agencia, 12 agentes. Alto potencial." },
  { id: 6, nombre: "Javier Moreno", email: "javier@madridestate.com", agencia: "Madrid Estate", telefono: "699 876 543", estado: "Cerrado", fecha: "2026-05-10", origen: "Google Ads", notas: "¡Convertido! Plan Agencia 12 meses." },
  { id: 7, nombre: "Isabel Vega", email: "isabel@costadelsolvillas.es", agencia: "Costa del Sol Villas", telefono: "622 111 999", estado: "En Progreso", fecha: "2026-05-09", origen: "Landing Page", notas: "Enfocada en propiedades de lujo." },
  { id: 8, nombre: "Antonio Blanco", email: "ablanco@inmogroup.es", agencia: "InmoGroup España", telefono: "655 444 321", estado: "Frío", fecha: "2026-05-05", origen: "Feria", notas: "Contactado en SIMA 2026. Follow-up pendiente." },
  { id: 9, nombre: "María del Mar Ortiz", email: "mmar@soleinmuebles.com", agencia: "Sole Inmuebles", telefono: "618 765 432", estado: "Cerrado", fecha: "2026-04-28", origen: "Referido", notas: "¡Convertido! Plan Starter primer trimestre." },
  { id: 10, nombre: "Roberto Gómez", email: "rgomez@fincaraiz.net", agencia: "Finca Raíz Madrid", telefono: "634 000 111", estado: "En Progreso", fecha: "2026-04-22", origen: "Landing Page", notas: "Tiene dudas sobre la integración con su CRM actual." },
];

export const transacciones = [
  { id: 1, concepto: "Comisión Venta - Ático Duplex Gran Vía", tipo: "Ingreso", importe: 19700, fecha: "2026-05-20", estado: "Pagado", propiedad: "Ático Duplex Gran Vía" },
  { id: 2, concepto: "Renta Mensual - Piso Modernista Eixample", tipo: "Ingreso", importe: 2800, fecha: "2026-05-15", estado: "Pagado", propiedad: "Piso Modernista Eixample" },
  { id: 3, concepto: "Mantenimiento HVAC - Villa Marbella", tipo: "Gasto", importe: -1200, fecha: "2026-05-12", estado: "Pagado", propiedad: "Villa con Piscina Marbella" },
  { id: 4, concepto: "Renta Mensual - Apartamento Levante", tipo: "Ingreso", importe: 1100, fecha: "2026-05-10", estado: "Pagado", propiedad: "Apartamento Nuevo Levante" },
  { id: 5, concepto: "Seguro Multirriesgo - Torre Glòries", tipo: "Gasto", importe: -890, fecha: "2026-05-08", estado: "Pagado", propiedad: "Penthouse Torre Glòries" },
  { id: 6, concepto: "Comisión Alquiler - Casa Adosada Pozuelo", tipo: "Ingreso", importe: 3200, fecha: "2026-05-05", estado: "Pendiente", propiedad: "Casa Adosada Pozuelo" },
  { id: 7, concepto: "Licencia Software InmoTech PRO", tipo: "Gasto", importe: -499, fecha: "2026-05-01", estado: "Pagado", propiedad: "—" },
  { id: 8, concepto: "Renta Mensual - Chalet Zona Norte", tipo: "Ingreso", importe: 2100, fecha: "2026-04-30", estado: "Pagado", propiedad: "Chalet Zona Norte" },
  { id: 9, concepto: "IBI Anual - Loft Industrial Triana", tipo: "Gasto", importe: -780, fecha: "2026-04-25", estado: "Pendiente", propiedad: "Loft Industrial Triana" },
  { id: 10, concepto: "Renta Mensual - Oficina Azca Premium", tipo: "Ingreso", importe: 4800, fecha: "2026-04-20", estado: "Pagado", propiedad: "Oficina Azca Premium" },
  { id: 11, concepto: "Reforma Cocina - Estudio Gótico", tipo: "Gasto", importe: -3400, fecha: "2026-04-15", estado: "Pagado", propiedad: "Estudio Céntrico Gótico" },
  { id: 12, concepto: "Comisión Venta - Piso Playa Malagueta", tipo: "Ingreso", importe: 10400, fecha: "2026-04-10", estado: "Pendiente", propiedad: "Piso Playa La Malagueta" },
  { id: 13, concepto: "Renta Mensual - Penthouse Torre Glòries", tipo: "Ingreso", importe: 6500, fecha: "2026-04-05", estado: "Pagado", propiedad: "Penthouse Torre Glòries" },
  { id: 14, concepto: "Gestoría Fiscal Q1 2026", tipo: "Gasto", importe: -620, fecha: "2026-04-01", estado: "Pagado", propiedad: "—" },
  { id: 15, concepto: "Renta Mensual - Casa Adosada Pozuelo", tipo: "Ingreso", importe: 3200, fecha: "2026-03-28", estado: "Pagado", propiedad: "Casa Adosada Pozuelo" },
];

// Estadísticas pre-calculadas para el resumen
export const kpis = {
  propiedadesTotales: propiedades.length,
  alquiladas: propiedades.filter(p => p.estado === 'Alquilado').length,
  enVenta: propiedades.filter(p => p.estado === 'En Venta').length,
  vacantes: propiedades.filter(p => p.estado === 'Vacante').length,
  totalLeads: leads.length,
  leadsCalientes: leads.filter(l => l.estado === 'Caliente').length,
  leadsCerrados: leads.filter(l => l.estado === 'Cerrado').length,
  ingresosUltimos30: transacciones.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.importe, 0),
  gastosUltimos30: transacciones.filter(t => t.tipo === 'Gasto').reduce((sum, t) => sum + Math.abs(t.importe), 0),
  pendienteCobro: transacciones.filter(t => t.estado === 'Pendiente' && t.tipo === 'Ingreso').reduce((sum, t) => sum + t.importe, 0),
};
