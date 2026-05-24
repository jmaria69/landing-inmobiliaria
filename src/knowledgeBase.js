// Base de conocimiento inicial
const defaultKnowledge = [
  {
    id: 1,
    keywords: ['horario', 'hora', 'abierto', 'cierran', 'abris', 'cerrar'],
    answer: 'Nuestro horario de atención al público es de Lunes a Viernes de 9:00 a 14:00 y de 16:00 a 19:30. Los fines de semana atendemos solo con cita previa.'
  },
  {
    id: 2,
    keywords: ['donde', 'ubicacion', 'oficina', 'direccion', 'estais', 'calle'],
    answer: 'Nuestra oficina principal está en el centro de la ciudad: Calle Gran Vía 45, Planta 2. ¡Estaremos encantados de recibirte!'
  },
  {
    id: 3,
    keywords: ['piscina', 'chalet', 'villa'],
    answer: '¡Sí! Tenemos excelentes chalets y villas con piscina, especialmente en la zona norte y en áreas residenciales de lujo. ¿Te gustaría que un agente te envíe el catálogo?'
  },
  {
    id: 4,
    keywords: ['precio', 'cuanto', 'presupuesto', 'cuesta'],
    answer: 'El precio varía según la zona y características. Tenemos propiedades desde 150.000€ y propiedades de lujo por más de 2.000.000€. ¿Cuál es tu presupuesto aproximado?'
  },
  {
    id: 5,
    keywords: ['hipoteca', 'financiacion', 'financiar', 'banco'],
    answer: 'Trabajamos con los principales bancos para ayudarte a conseguir hasta el 100% de financiación. Nuestro departamento financiero puede hacerte un estudio gratuito.'
  },
  {
    id: 6,
    keywords: ['cita', 'visita', 'ver', 'agente'],
    answer: '¡Claro que sí! Puedes programar una visita o un Tour 360 online dejando tus datos en nuestro formulario de la web.'
  }
];

// Obtener el conocimiento actual (del localStorage o por defecto)
export function getKnowledgeBase() {
  const saved = localStorage.getItem('inmotech_rag_knowledge');
  if (saved) {
    return JSON.parse(saved);
  }
  // Si no hay guardado, inicializamos con el de por defecto
  saveKnowledgeBase(defaultKnowledge);
  return defaultKnowledge;
}

// Guardar nueva base
export function saveKnowledgeBase(data) {
  localStorage.setItem('inmotech_rag_knowledge', JSON.stringify(data));
}

// Añadir un nuevo "fact"
export function addKnowledge(keywordsStr, answer) {
  const kb = getKnowledgeBase();
  // Transformar string separada por comas en array
  const keywords = keywordsStr.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
  
  const newFact = {
    id: Date.now(),
    keywords,
    answer
  };
  kb.push(newFact);
  saveKnowledgeBase(kb);
  return newFact;
}

// Eliminar un "fact"
export function removeKnowledge(id) {
  const kb = getKnowledgeBase();
  const updated = kb.filter(f => f.id !== id);
  saveKnowledgeBase(updated);
}
