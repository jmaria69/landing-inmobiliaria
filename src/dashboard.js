import { propiedades, leads, transacciones, kpis } from './mockDb.js';

document.addEventListener('DOMContentLoaded', () => {
  populateKPIs();
  initRevenueChart();
  initLeaseChart();
  loadLeadsAsTasks();
  initTabs();
  renderPropiedades();
  renderLeadsCRM();
  renderFinanzas();
  renderAjustes();
});

// ============================================================
// Navegación por Pestañas
// ============================================================
function initTabs() {
  const links = document.querySelectorAll('.sidebar-nav a[data-tab]');
  const tabs = document.querySelectorAll('.tab-content');
  const pageTitle = document.querySelector('.topbar h1');

  const titles = {
    resumen: 'Resumen del Portafolio',
    propiedades: 'Directorio de Propiedades',
    leads: 'CRM — Gestión de Leads',
    finanzas: 'Panel Financiero',
    ajustes: 'Ajustes de la Agencia'
  };

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-tab');

      links.forEach(l => l.classList.remove('active'));
      tabs.forEach(t => { t.classList.remove('active'); t.classList.add('hidden'); });

      link.classList.add('active');
      const targetTab = document.getElementById('tab-' + target);
      if (targetTab) { targetTab.classList.add('active'); targetTab.classList.remove('hidden'); }
      if (pageTitle) pageTitle.textContent = titles[target] || 'Dashboard';
    });
  });
}

// ============================================================
// KPIs dinámicos en el Resumen
// ============================================================
function populateKPIs() {
  const el = (id) => document.getElementById(id);
  if (el('kpi-total')) el('kpi-total').textContent = kpis.propiedadesTotales;
  if (el('kpi-vacantes')) el('kpi-vacantes').textContent = kpis.vacantes;
  if (el('kpi-alquiladas')) el('kpi-alquiladas').textContent = kpis.alquiladas;
  if (el('kpi-enventa')) el('kpi-enventa').textContent = kpis.enVenta;
  if (el('kpi-ingresos')) el('kpi-ingresos').textContent = '€ ' + kpis.ingresosUltimos30.toLocaleString('es-ES');
  if (el('kpi-gastos')) el('kpi-gastos').textContent = '€ ' + kpis.gastosUltimos30.toLocaleString('es-ES');
  if (el('kpi-pagadas')) el('kpi-pagadas').textContent = '€ ' + (kpis.ingresosUltimos30 - kpis.pendienteCobro).toLocaleString('es-ES');
  if (el('kpi-pendiente')) el('kpi-pendiente').textContent = '€ ' + kpis.pendienteCobro.toLocaleString('es-ES');
}

// ============================================================
// Gráfico de Ingresos / Gastos (Chart.js)
// ============================================================
function initRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;
  new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
        { label: 'Gastos', data: [4200, 3800, 5100, 6690, 2589, 3400, 4100, 2900, 3600, 4800, 5200, 3100], backgroundColor: '#93c5fd', barPercentage: 0.6, categoryPercentage: 0.5 },
        { label: 'Ingresos', data: [12000, 15400, 19800, 33700, 24100, 28600, 31200, 22000, 36400, 38900, 42100, 29800], backgroundColor: '#4f46e5', barPercentage: 0.6, categoryPercentage: 0.5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: 'top', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { family: 'Inter', size: 12 } } } },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => '€' + (v / 1000) + 'k', font: { size: 11 } }, grid: { borderDash: [4, 4], color: '#e2e8f0' } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}

// ============================================================
// Gráfico Donut — Contratos por Expirar
// ============================================================
function initLeaseChart() {
  const ctx = document.getElementById('leasesChart');
  if (!ctx) return;
  new Chart(ctx.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: ['< 30 días', '31-60 días', '61-90 días'],
      datasets: [{ data: [8, 16, 22], backgroundColor: ['#2563eb', '#1e3a8a', '#93c5fd'], borderWidth: 0, cutout: '75%' }]
    },
    options: { responsive: true, maintainAspectRatio: false, rotation: -90, circumference: 180, plugins: { legend: { display: false } } }
  });
}

// ============================================================
// Leads rápidos en Resumen (desde localStorage + mockDb)
// ============================================================
function loadLeadsAsTasks() {
  const container = document.getElementById('dashboard-leads');
  if (!container) return;

  const localLeads = JSON.parse(localStorage.getItem('inmotech_leads') || '[]').map(l => ({
    nombre: l.name, agencia: l.agency, email: l.email, estado: 'Caliente', fecha: l.date || 'Hoy', origen: 'Landing Page'
  }));

  const allLeads = [...localLeads.reverse(), ...leads.slice(0, 4)];
  container.innerHTML = '';

  allLeads.slice(0, 5).forEach(lead => {
    const stateClass = lead.estado === 'Caliente' ? 'tag-hot' : lead.estado === 'Cerrado' ? 'tag-closed' : lead.estado === 'Frío' ? 'tag-cold' : 'tag-progress';
    container.innerHTML += `
      <div class="task-item">
        <div class="task-title">${lead.agencia}</div>
        <div class="task-meta"><span>👤 ${lead.nombre} — ${lead.email}</span><span>${lead.fecha}</span></div>
        <div class="task-tags"><span class="tag ${stateClass}">${lead.estado}</span><span class="tag">${lead.origen}</span></div>
      </div>`;
  });
}

// ============================================================
// TAB: Propiedades — Galería de tarjetas
// ============================================================
function renderPropiedades() {
  const container = document.getElementById('tab-propiedades');
  if (!container) return;

  const estadoColor = { 'En Venta': '#f59e0b', 'Alquilado': '#10b981', 'Vacante': '#ef4444' };

  container.innerHTML = `
    <div class="tab-toolbar">
      <input type="text" id="search-props" class="search-input" placeholder="🔍 Buscar propiedad, ciudad..." />
      <div class="tab-stats">
        <span class="mini-kpi"><strong>${kpis.propiedadesTotales}</strong> Total</span>
        <span class="mini-kpi green"><strong>${kpis.alquiladas}</strong> Alquiladas</span>
        <span class="mini-kpi yellow"><strong>${kpis.enVenta}</strong> En Venta</span>
        <span class="mini-kpi red"><strong>${kpis.vacantes}</strong> Vacantes</span>
      </div>
    </div>
    <div class="props-grid" id="props-grid">
      ${propiedades.map(p => `
        <div class="prop-card" data-search="${p.nombre} ${p.ciudad} ${p.tipo}".toLowerCase()>
          <div class="prop-card-img" style="background-image: url('${p.imagen}')">
            <span class="prop-badge" style="background: ${estadoColor[p.estado] || '#64748b'}">${p.estado}</span>
          </div>
          <div class="prop-card-body">
            <h4>${p.nombre}</h4>
            <p class="prop-location">📍 ${p.ciudad} · ${p.tipo} · ${p.m2} m²  · ${p.habitaciones} hab.</p>
            <div class="prop-card-footer">
              <span class="prop-price">${p.precio ? '€ ' + p.precio.toLocaleString('es-ES') : '€ ' + p.alquiler.toLocaleString('es-ES') + '/mes'}</span>
              <span class="prop-yield">📈 ${p.rentabilidad}%</span>
            </div>
            ${p.inquilino ? `<div class="prop-tenant">👤 ${p.inquilino}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;

  // Buscador
  document.getElementById('search-props').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.prop-card').forEach(card => {
      card.style.display = card.dataset.search.includes(q) ? '' : 'none';
    });
  });
}

// ============================================================
// TAB: Leads / CRM — Tabla profesional con filtros
// ============================================================
function renderLeadsCRM() {
  const container = document.getElementById('tab-leads');
  if (!container) return;

  const localLeads = JSON.parse(localStorage.getItem('inmotech_leads') || '[]').map((l, i) => ({
    id: 100 + i, nombre: l.name, email: l.email, agencia: l.agency, telefono: '—', estado: 'Caliente', fecha: l.date || 'Hoy', origen: 'Landing Page', notas: 'Capturado desde la web.'
  }));

  const allLeads = [...localLeads.reverse(), ...leads];

  const estadoBadge = (e) => {
    const cls = e === 'Caliente' ? 'tag-hot' : e === 'Cerrado' ? 'tag-closed' : e === 'Frío' ? 'tag-cold' : 'tag-progress';
    return `<span class="tag ${cls}">${e}</span>`;
  };

  container.innerHTML = `
    <div class="tab-toolbar">
      <input type="text" id="search-leads" class="search-input" placeholder="🔍 Buscar lead, agencia, email..." />
      <div class="tab-stats">
        <span class="mini-kpi"><strong>${allLeads.length}</strong> Total</span>
        <span class="mini-kpi red"><strong>${allLeads.filter(l=>l.estado==='Caliente').length}</strong> 🔥 Calientes</span>
        <span class="mini-kpi green"><strong>${allLeads.filter(l=>l.estado==='Cerrado').length}</strong> ✅ Cerrados</span>
      </div>
    </div>
    <div class="card table-card">
      <div class="table-scroll">
        <table class="data-table" id="leads-table">
          <thead>
            <tr>
              <th>Nombre</th><th>Agencia</th><th>Email</th><th>Teléfono</th><th>Estado</th><th>Origen</th><th>Fecha</th><th>Notas</th>
            </tr>
          </thead>
          <tbody>
            ${allLeads.map(l => `
              <tr data-search="${l.nombre} ${l.agencia} ${l.email}".toLowerCase()>
                <td><strong>${l.nombre}</strong></td>
                <td>${l.agencia}</td>
                <td>${l.email}</td>
                <td>${l.telefono}</td>
                <td>${estadoBadge(l.estado)}</td>
                <td>${l.origen}</td>
                <td>${l.fecha}</td>
                <td class="notes-cell">${l.notas}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  document.getElementById('search-leads').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#leads-table tbody tr').forEach(row => {
      row.style.display = row.dataset.search.includes(q) ? '' : 'none';
    });
  });
}

// ============================================================
// TAB: Finanzas — Tabla de transacciones + resumen
// ============================================================
function renderFinanzas() {
  const container = document.getElementById('tab-finanzas');
  if (!container) return;

  const totalIngresos = transacciones.filter(t => t.tipo === 'Ingreso').reduce((s, t) => s + t.importe, 0);
  const totalGastos = transacciones.filter(t => t.tipo === 'Gasto').reduce((s, t) => s + Math.abs(t.importe), 0);
  const beneficio = totalIngresos - totalGastos;

  container.innerHTML = `
    <div class="finance-kpis">
      <div class="card finance-kpi-card">
        <div class="finance-kpi-icon green">💰</div>
        <div><div class="stat-value text-accent">€ ${totalIngresos.toLocaleString('es-ES')}</div><div class="stat-label">Ingresos Totales</div></div>
      </div>
      <div class="card finance-kpi-card">
        <div class="finance-kpi-icon red">📉</div>
        <div><div class="stat-value" style="color:#ef4444">€ ${totalGastos.toLocaleString('es-ES')}</div><div class="stat-label">Gastos Totales</div></div>
      </div>
      <div class="card finance-kpi-card">
        <div class="finance-kpi-icon blue">📊</div>
        <div><div class="stat-value" style="color:#10b981">€ ${beneficio.toLocaleString('es-ES')}</div><div class="stat-label">Beneficio Neto</div></div>
      </div>
      <div class="card finance-kpi-card">
        <div class="finance-kpi-icon yellow">⏳</div>
        <div><div class="stat-value" style="color:#f59e0b">€ ${kpis.pendienteCobro.toLocaleString('es-ES')}</div><div class="stat-label">Pendiente de Cobro</div></div>
      </div>
    </div>
    <div class="card table-card">
      <div class="card-header"><h2>Historial de Transacciones</h2></div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr><th>Fecha</th><th>Concepto</th><th>Propiedad</th><th>Tipo</th><th>Importe</th><th>Estado</th></tr>
          </thead>
          <tbody>
            ${transacciones.map(t => `
              <tr>
                <td>${t.fecha}</td>
                <td>${t.concepto}</td>
                <td>${t.propiedad}</td>
                <td><span class="tag ${t.tipo === 'Ingreso' ? 'tag-closed' : 'tag-cold'}">${t.tipo}</span></td>
                <td class="${t.importe > 0 ? 'text-green' : 'text-red'}"><strong>${t.importe > 0 ? '+' : ''}€ ${Math.abs(t.importe).toLocaleString('es-ES')}</strong></td>
                <td><span class="tag ${t.estado === 'Pagado' ? 'tag-progress' : 'tag-hot'}">${t.estado}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

// ============================================================
// TAB: Ajustes
// ============================================================
function renderAjustes() {
  const container = document.getElementById('tab-ajustes');
  if (!container) return;

  container.innerHTML = `
    <div class="settings-grid">
      <div class="card settings-card">
        <div class="settings-icon">🏢</div>
        <h3>Datos de la Agencia</h3>
        <p>Nombre, dirección, CIF y datos fiscales.</p>
        <div class="settings-fields">
          <label>Nombre de la Agencia</label><input type="text" value="InmoTech Demo Agencia" class="settings-input" />
          <label>CIF</label><input type="text" value="B-12345678" class="settings-input" />
          <label>Dirección</label><input type="text" value="Calle Gran Vía 32, 3ºA, Madrid" class="settings-input" />
        </div>
      </div>
      <div class="card settings-card">
        <div class="settings-icon">👥</div>
        <h3>Equipo y Roles</h3>
        <p>Gestiona los agentes y sus permisos.</p>
        <div class="team-list">
          <div class="team-member"><div class="avatar-sm">AD</div><div><strong>Admin Demo</strong><br><span class="text-gray">Administrador</span></div></div>
          <div class="team-member"><div class="avatar-sm" style="background:#10b981">LG</div><div><strong>Laura García</strong><br><span class="text-gray">Agente Senior</span></div></div>
          <div class="team-member"><div class="avatar-sm" style="background:#f59e0b">PM</div><div><strong>Pedro Muñoz</strong><br><span class="text-gray">Agente Junior</span></div></div>
        </div>
      </div>
      <div class="card settings-card">
        <div class="settings-icon">🔔</div>
        <h3>Notificaciones</h3>
        <p>Configura cuándo y cómo recibes alertas.</p>
        <div class="settings-toggles">
          <label class="toggle-row"><input type="checkbox" checked /> Nuevos leads por email</label>
          <label class="toggle-row"><input type="checkbox" checked /> Resumen semanal</label>
          <label class="toggle-row"><input type="checkbox" /> Alertas de contratos por expirar</label>
          <label class="toggle-row"><input type="checkbox" checked /> Notificaciones push en navegador</label>
        </div>
      </div>
      <div class="card settings-card">
        <div class="settings-icon">🔗</div>
        <h3>Integraciones</h3>
        <p>Conecta con tus herramientas favoritas.</p>
        <div class="integrations-list">
          <div class="integration"><span>📧 Mailchimp</span><span class="tag tag-closed">Conectado</span></div>
          <div class="integration"><span>📊 Google Analytics</span><span class="tag tag-closed">Conectado</span></div>
          <div class="integration"><span>💬 WhatsApp Business</span><span class="tag tag-progress">Pendiente</span></div>
          <div class="integration"><span>🏦 Stripe Payments</span><span class="tag tag-cold">No conectado</span></div>
        </div>
      </div>
    </div>`;
}
