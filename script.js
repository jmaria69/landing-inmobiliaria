/* ==========================================
   LIVE COUNTER + DEMO FORM HANDLER
   ========================================== */

// Qdrant configuration
const QDRANT_CONFIG = {
    url: 'http://localhost:6333', // Cambiar a tu Qdrant real en prod
    collection: 'idealista_properties',
    apiKey: '' // Opcional para Qdrant cloud
};

// Fetch property count from Qdrant
async function fetchPropertyCount() {
    try {
        const response = await fetch(`${QDRANT_CONFIG.url}/collections/${QDRANT_CONFIG.collection}/points/scroll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': QDRANT_CONFIG.apiKey
            },
            body: JSON.stringify({ limit: 1 })
        });
        if (response.ok) {
            const data = await response.json();
            return data.result.points.length > 0 ? 'Conectado' : 'Sin datos';
        }
    } catch (e) {
        console.warn('Qdrant no disponible (usando fallback):', e.message);
    }
    return null; // Fallback a mock
}

// Update live counter on page load
document.addEventListener('DOMContentLoaded', async function () {
    const counterEl = document.getElementById('live-property-count');
    if (counterEl) {
        const count = await fetchPropertyCount();
        if (count) {
            counterEl.textContent = count;
            counterEl.parentElement.classList.add('connected');
        } else {
            counterEl.textContent = '89.234'; // Fallback estático
        }
    }

    // Demo form handler
    initDemoForm();
});

function initDemoForm() {
    const demoForm = document.getElementById('demo-form');
    const demoOutput = document.getElementById('demo-output');
    const leadScore = document.getElementById('lead-score');
    const propCount = document.getElementById('prop-count');
    const crmAction = document.getElementById('crm-action');

    // Mock property database (fallback si Qdrant no está disponible)
    const mockProperties = {
        madrid: {
            chamberi: [
                {
                    id: "IDE-28471",
                    direccion: "Calle Bravo Murillo 45, Chamberí",
                    precio: 265000,
                    habitaciones: 2,
                    metros: 75,
                    url: "https://idealista.com/...",
                    descripcion: "Piso reformado en Chamberí, cerca de metro"
                },
                {
                    id: "IDE-28472",
                    direccion: "Calle Agustín de Foxá 12, Chamberí",
                    precio: 275000,
                    habitaciones: 2,
                    metros: 68,
                    url: "https://idealista.com/...",
                    descripcion: "Luminoso exterior con ascensor"
                },
                {
                    id: "IDE-28473",
                    direccion: "Plaza Castilla 8, Chamberí",
                    precio: 290000,
                    habitaciones: 2,
                    metros: 82,
                    url: "https://idealista.com/...",
                    descripcion: "Vistas panorámicas, garaje incluido"
                }
            ],
            salamanca: [
                {
                    id: "IDE-28501",
                    direccion: "Calle Serrano 89, Salamanca",
                    precio: 385000,
                    habitaciones: 3,
                    metros: 95,
                    url: "https://idealista.com/...",
                    descripcion: "Clásico barrio Salamanca, alto standing"
                },
                {
                    id: "IDE-28502",
                    direccion: "Calle Velázquez 124, Salamanca",
                    precio: 395000,
                    habitaciones: 3,
                    metros: 100,
                    url: "https://idealista.com/...",
                    descripcion: "Recién reformado, terraza 20m²"
                }
            ],
            centro: [
                {
                    id: "IDE-28601",
                    direccion: "Calle Gran Vía 28, Centro",
                    precio: 320000,
                    habitaciones: 2,
                    metros: 70,
                    url: "https://idealista.com/...",
                    descripcion: "Iconico edificio Gran Vía, todo exterior"
                },
                {
                    id: "IDE-28602",
                    direccion: "Calle Fuencarral 56, Centro",
                    precio: 298000,
                    habitaciones: 2,
                    metros: 65,
                    url: "https://idealista.com/...",
                    descripcion: "Malasaña, ambiente urbano"
                }
            ],
            vallecas: [
                {
                    id: "IDE-28701",
                    direccion: "Avenida de la Albufera 120, Vallecas",
                    precio: 185000,
                    habitaciones: 3,
                    metros: 85,
                    url: "https://idealista.com/...",
                    descripcion: "Luminoso piso exterior, al lado del metro"
                },
                {
                    id: "IDE-28702",
                    direccion: "Calle del Monte Igueldo 45, Vallecas",
                    precio: 155000,
                    habitaciones: 2,
                    metros: 65,
                    url: "https://idealista.com/...",
                    descripcion: "Ideal inversores, buena rentabilidad"
                }
            ]
        },
        barcelona: {
            eixample: [
                {
                    id: "BCN-15234",
                    direccion: "Carrer de Balmes 157, Eixample",
                    precio: 425000,
                    habitaciones: 3,
                    metros: 90,
                    url: "https://idealista.com/...",
                    descripcion: "Modernista original, balcones terraza"
                }
            ],
            gracia: [
                {
                    id: "BCN-15301",
                    direccion: "Carrer de Verdi 42, Gràcia",
                    precio: 315000,
                    habitaciones: 2,
                    metros: 72,
                    url: "https://idealista.com/...",
                    descripcion: "Village feel, cerca Plaza del Sol"
                }
            ]
        },
        valencia: {
            centro: [
                {
                    id: "VLC-09123",
                    direccion: "Calle Colón 24, Centro",
                    precio: 245000,
                    habitaciones: 2,
                    metros: 80,
                    url: "https://idealista.com/...",
                    descripcion: "Centro histórico, cerca Mercado Colón"
                }
            ]
        },
        sevilla: {
            triana: [
                {
                    id: "SVQ-04521",
                    direccion: "Calle Betis 67, Triana",
                    precio: 198000,
                    habitaciones: 2,
                    metros: 75,
                    url: "https://idealista.com/...",
                    descripcion: "Vistas al Guadalquivir, barrio castizo"
                }
            ]
        }
    };

    // Scoring logic basada en señales
    function calculateScore(formData) {
        let score = 1;
        let nivel = "No Calificado";
        let acciones = [];

        // Zona explícpita = +1
        if (formData.zona && formData.zona.trim() !== "") {
            score = 2;
            nivel = "Frío";
        }

        // Presupuesto explícito = +1
        if (formData.precioMax && formData.precioMax > 0) {
            score = 3;
            nivel = "Tibio";
            acciones.push("Preparar propiedades dentro del rango");
        }

        // Habitaciones explícitas = +1
        if (formData.habitaciones) {
            score = 4;
            nivel = "Calificado";
            acciones.push("Filtrar por # habitaciones");
        }

        // Consulta específica con urgencia = +1
        if (formData.consulta && formData.consulta.length > 30) {
            const urgentWords = ["urgente", "inmediato", "ya", "lo antes posible", "asap"];
            const hasUrgency = urgentWords.some(word => formData.consulta.toLowerCase().includes(word));
            if (hasUrgency) {
                score = 5;
                nivel = "Premium";
                acciones.unshift("Contactar en <1 hora");
            } else {
                acciones.push("Contactar en 24 horas");
            }
        }

        if (score <= 2) {
            acciones.push("Nurturing sequence");
        }

        return { score, nivel, acciones };
    }

    // Generar respuesta del agente
    function generateResponse(formData, properties, scoring) {
        const zona = formData.zona || formData.city;
        const precioMax = formData.precioMax ? `${formData.precioMax.toLocaleString()}€` : "presupuesto a definir";
        const habitaciones = formData.habitaciones;

        let respuesta = `Hola! Hemos encontrado ${properties.length} propiedades en ${zona} que podrían encajar con tu búsqueda de ${habitaciones} habitación${habitaciones > 1 ? 'es' : ''} hasta ${precioMax}.`;

        if (properties.length > 0) {
            respuesta += `\n\nTe destacamos:\n`;
            properties.slice(0, 3).forEach((prop, i) => {
                respuesta += `• ${prop.direccion} - ${prop.precio.toLocaleString()}€ (${prop.metros}m², ${prop.habitaciones} hab)\n`;
            });
            respuesta += `\n¿Te gustaría agendar una visita esta semana?`;
        } else {
            respuesta += `\n\nNo tenemos propiedades exactas en este momento, pero podemos activar alertas para cuando se liberen nuevas. ¿Te interesa?`;
        }

        return respuesta;
    }

    // Determinar acción Salesforce
    function getSalesforceAction(score) {
        const actions = {
            5: "Lead creado · Status: Hot_Lead · Task: Call <1h",
            4: "Lead creado · Status: Warm_Lead · Task: Call <24h",
            3: "Lead creado · Status: Nurturing · Email sequence",
            2: "Lead creado · Status: Cold_Lead · Newsletter",
            1: "Lead archivado · Sin acción"
        };
        return actions[score] || actions[1];
    }

    // Query Qdrant for real properties
    async function queryQdrant(city, zona, precioMax, habitaciones) {
        try {
            const query = {
                must: [
                    { key: 'city', match: { value: city } }
                ],
                filter: []
            };

            if (zona && zona.trim() !== '') {
                query.must.push({
                    key: 'neighborhood',
                    match: { text: zona }
                });
            }

            if (precioMax && precioMax > 0) {
                query.filter.push({
                    key: 'price',
                    range: { lte: parseInt(precioMax) }
                });
            }

            if (habitaciones) {
                query.filter.push({
                    key: 'rooms',
                    range: { gte: parseInt(habitaciones) }
                });
            }

            const response = await fetch(`${QDRANT_CONFIG.url}/collections/${QDRANT_CONFIG.collection}/points/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': QDRANT_CONFIG.apiKey
                },
                body: JSON.stringify({
                    vector: [0, 0, 0], // Reemplazar con embedding real de la consulta
                    limit: 5,
                    filter: { must: query.must, filter: query.filter }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.result.map(p => ({
                    id: p.id,
                    direccion: p.payload?.address || 'Dirección no disponible',
                    precio: p.payload?.price || 0,
                    habitaciones: p.payload?.rooms || 0,
                    metros: p.payload?.area || 0,
                    url: p.payload?.url || '#',
                    descripcion: p.payload?.description || ''
                }));
            }
        } catch (e) {
            console.warn('Qdrant query fallida, usando fallback:', e.message);
        }
        return null;
    }

    // Form submit handler
    demoForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(demoForm);
        const data = Object.fromEntries(formData.entries());

        // Show loading state
        demoOutput.innerHTML = '<p class="placeholder-text">Consultando RAG en Qdrant... (17s SLA)</p>';

        // Query real Qdrant data
        let properties = await queryQdrant(data.city, data.zona, data.precioMax, data.habitaciones);

        // Fallback to mock if Qdrant unavailable
        if (!properties || properties.length === 0) {
            const cityData = mockProperties[data.city];
            const zonaKey = data.zona ? Object.keys(cityData).find(k => k.includes(data.zona.toLowerCase())) : null;
            properties = zonaKey ? cityData[zonaKey] : Object.values(cityData).flat();
        }

        // Calculate score
        const scoring = calculateScore(data);

        // Generate response
        const respuesta = generateResponse(data, properties, scoring);

        // Render output
        demoOutput.innerHTML = `
            <div class="demo-output">
                <div class="respuesta">${respuesta.replace(/\n/g, '<br>')}</div>
                <div class="propiedades">
                    <strong>Propiedades matching:</strong>
                    ${properties.slice(0, 3).map(p => `
                        <div class="propiedad">
                            <strong>${p.direccion}</strong><br>
                            ${p.precio.toLocaleString()}€ · ${p.metros}m² · ${p.habitaciones} hab<br>
                            <small>${p.descripcion}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Update meta badges
        leadScore.textContent = `${scoring.score}/5 (${scoring.nivel})`;
        propCount.textContent = properties.length;
        crmAction.textContent = getSalesforceAction(scoring.score);
    });
});
