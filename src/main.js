document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initCalculator();
  initSimulator();
  initLeadForm();
  initAdminModal();
});

// 1. Animaciones de Scroll con Intersection Observer
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);
  animatedElements.forEach(el => observer.observe(el));
}

// 2. Calculadora de ROI
function initCalculator() {
  const leadsRange = document.getElementById('leads-range');
  const leadsVal = document.getElementById('leads-val');
  const contractsRange = document.getElementById('contracts-range');
  const contractsVal = document.getElementById('contracts-val');
  
  const resHours = document.getElementById('res-hours');
  const resAdmin = document.getElementById('res-admin');
  const resTotal = document.getElementById('res-total');

  function calculate() {
    const leads = parseInt(leadsRange.value);
    const contracts = parseInt(contractsRange.value);

    // Asumimos que IA cualificadora ahorra 15 mins (0.25h) por lead
    const horasCualificacion = leads * 0.25;
    // Asumimos que Back-Office automático ahorra 3 horas por contrato cerrado
    const horasContratos = contracts * 3;
    
    const total = horasCualificacion + horasContratos;

    leadsVal.innerText = leads;
    contractsVal.innerText = contracts;
    
    resHours.innerText = `${Math.round(horasCualificacion)}h`;
    resAdmin.innerText = `${Math.round(horasContratos)}h`;
    resTotal.innerText = `${Math.round(total)} Horas`;
  }

  if(leadsRange && contractsRange) {
    leadsRange.addEventListener('input', calculate);
    contractsRange.addEventListener('input', calculate);
    calculate(); // init
  }
}

// 3. Simulador de IA (Tecnología)
function initSimulator() {
  const btns = document.querySelectorAll('.btn-sim');
  const grid = document.getElementById('sim-grid');
  
  const props = {
    inversor: [
      { price: "12% ROI", title: "Edificio de 4 Apartamentos, Centro", color: "#10b981" },
      { price: "9.5% ROI", title: "Local Comercial, Zona Sur", color: "#059669" }
    ],
    familia: [
      { price: "4 Habitaciones", title: "Chalet con piscina cerca de colegios", color: "#3b82f6" },
      { price: "3 Habitaciones", title: "Piso luminoso con terraza, parques", color: "#2563eb" }
    ],
    lujo: [
      { price: "€2,500,000", title: "Ático Panorámico, Vistas al Mar", color: "#8b5cf6" },
      { price: "€4,200,000", title: "Villa Exclusiva, Seguridad 24h", color: "#7c3aed" }
    ]
  };

  function renderProps(profile) {
    if(!grid) return;
    grid.innerHTML = '';
    props[profile].forEach(p => {
      const card = document.createElement('div');
      card.className = 'prop-card';
      card.innerHTML = `
        <div class="prop-img" style="background: ${p.color}20; border-bottom: 2px solid ${p.color}"></div>
        <div class="prop-details">
          <div class="prop-price" style="color: ${p.color}">${p.price}</div>
          <div class="prop-title">${p.title}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      btns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderProps(e.target.dataset.profile);
    });
  });

  // Init default
  renderProps('inversor');
}

// 4. Formulario de Captación y LocalStorage
function initLeadForm() {
  const form = document.getElementById('lead-form');
  const successMsg = document.getElementById('form-success');

  if (!form || !successMsg) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const agency = document.getElementById('agency').value;
    const date = new Date().toLocaleDateString();

    const newLead = { name, email, agency, date };

    // Guardar en LocalStorage
    const leads = JSON.parse(localStorage.getItem('inmotech_leads') || '[]');
    leads.push(newLead);
    localStorage.setItem('inmotech_leads', JSON.stringify(leads));

    const btn = form.querySelector('button[type="submit"]');
    btn.innerText = 'Guardando...';
    btn.disabled = true;

    setTimeout(() => {
      form.classList.add('hidden');
      successMsg.classList.remove('hidden');
      // Actualizar tabla admin si está abierta o para la próxima vez
      renderAdminTable();
    }, 800);
  });
}

// 5. Panel de Control (Modal Admin)
function initAdminModal() {
  const openBtn = document.getElementById('open-admin');
  const closeBtn = document.getElementById('close-admin');
  const modal = document.getElementById('admin-modal');
  const clearBtn = document.getElementById('clear-leads');

  if(!openBtn || !modal) return;

  openBtn.addEventListener('click', () => {
    renderAdminTable();
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Cerrar al clickear fuera
  modal.addEventListener('click', (e) => {
    if(e.target === modal) modal.classList.add('hidden');
  });

  if(clearBtn) {
    clearBtn.addEventListener('click', () => {
      localStorage.removeItem('inmotech_leads');
      renderAdminTable();
    });
  }
}

function renderAdminTable() {
  const tbody = document.getElementById('leads-list');
  const noLeads = document.getElementById('no-leads');
  const table = document.querySelector('.leads-table');
  
  if(!tbody) return;

  const leads = JSON.parse(localStorage.getItem('inmotech_leads') || '[]');
  
  tbody.innerHTML = '';

  if(leads.length === 0) {
    table.classList.add('hidden');
    noLeads.classList.remove('hidden');
  } else {
    table.classList.remove('hidden');
    noLeads.classList.add('hidden');
    
    leads.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lead.name}</td>
        <td>${lead.email}</td>
        <td>${lead.agency}</td>
        <td>${lead.date}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}
