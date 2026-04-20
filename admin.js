document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initSidebar();
  initPanelSwitching();
  initSaveButtons();
  initResetButtons();
  initModals();
  loadAllSections();
});

const STORAGE_KEY = 'cr_admin';
const PIN_KEY = 'cr_admin_pin';
const AUTH_KEY = 'cr_admin_auth';
const DEFAULT_PIN = '1234';

const DEFAULTS = {
  hero: {
    badge: 'Licensed & Insured \u2022 Farmington, NM',
    headline: 'Protecting Your Property\nFrom the Top Down',
    subtext: 'Professional residential and commercial roofing services. Quality craftsmanship, honest pricing, and results that last.',
    ctaPrimary: 'Get Free Estimate',
    ctaSecondary: 'Call Now'
  },
  services: {
    subtitle: 'What We Do',
    title: 'Our Roofing Services',
    description: 'From new installations to emergency repairs, Certified Roofing delivers expert solutions for every roofing need.',
    items: [
      { name: 'Residential Roofing', description: 'Complete roofing solutions for homes of all sizes. From asphalt shingles to metal roofing, we protect your biggest investment.' },
      { name: 'Commercial Roofing', description: 'Durable, code-compliant roofing systems for businesses. Flat roofs, TPO, EPDM, and built-up roofing expertise.' },
      { name: 'Roof Repairs', description: 'Fast, reliable repairs for leaks, storm damage, and wear. We diagnose the problem and fix it right the first time.' },
      { name: 'Roof Inspections', description: 'Thorough professional inspections for home buyers, insurance claims, and preventive maintenance.' },
      { name: 'Roof Replacements', description: 'When repairs aren\'t enough, trust our team for a seamless full roof replacement with premium materials.' },
      { name: 'Emergency Services', description: '24/7 emergency response for storm damage, fallen trees, and urgent leaks. We\'re here when you need us most.' }
    ]
  },
  about: {
    subtitle: 'Why Choose Us',
    title: 'Farmington\'s Trusted Roofing Experts',
    paragraph1: 'At Certified Roofing, we bring professional expertise and honest service to every project. As a locally owned and operated business in Farmington, we understand the unique roofing challenges of the Four Corners region \u2014 from intense sun exposure to severe weather events.',
    paragraph2: 'Our commitment is simple: quality materials, skilled craftsmanship, and customer service that goes above and beyond.',
    values: [
      'Licensed, Bonded & Fully Insured',
      'Free Detailed Estimates',
      'Quality Materials & Workmanship Warranty',
      'Residential & Commercial Specialists',
      'Storm Damage & Insurance Claim Assistance'
    ],
    stats: [
      { target: 500, suffix: '+', label: 'Roofs Completed' },
      { target: 100, suffix: '%', label: 'Customer Satisfaction' },
      { target: 10, suffix: '+', label: 'Years Experience' },
      { target: 24, suffix: '/7', label: 'Emergency Service' }
    ]
  },
  testimonials: [
    {
      text: 'Certified Roofing replaced our entire roof after a hail storm. They handled the insurance process, kept us informed every step of the way, and finished ahead of schedule. Outstanding quality and professionalism.',
      name: 'Michael Rodriguez',
      location: 'Farmington, NM',
      stars: 5
    },
    {
      text: 'We\'ve used Certified Roofing for our commercial properties for years. Their attention to detail and fair pricing keep us coming back. Highly recommend for any business owner in the area.',
      name: 'Sarah Thompson',
      location: 'Bloomfield, NM',
      stars: 5
    },
    {
      text: 'Called them for an emergency leak during a storm and they were at our house within two hours. Fixed the problem quickly and followed up the next week to make sure everything was solid. Top-notch service.',
      name: 'David & Lisa R.',
      location: 'Aztec, NM',
      stars: 5
    }
  ],
  areas: {
    title: 'Serving Farmington & the Four Corners Region',
    description: 'Proudly serving the communities of northwestern New Mexico and the surrounding Four Corners area.',
    items: ['Farmington', 'Bloomfield', 'Aztec', 'Kirtland', 'Shiprock', 'Flora Vista', 'Durango, CO', 'Cortez, CO', 'Gallup', 'San Juan County']
  },
  contact: {
    phone: '(505) 402-6288',
    email: 'brandon.certifiedroofing@yahoo.com',
    address: '310 Airport Drive\nFarmington, NM',
    hours: 'Mon\u2013Fri: 7:00 AM \u2013 6:00 PM\nSat: 8:00 AM \u2013 2:00 PM\n24/7 Emergency Service'
  }
};

function getData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSectionData(section) {
  const data = getData();
  return (data && data[section]) ? data[section] : JSON.parse(JSON.stringify(DEFAULTS[section]));
}

function saveSectionData(section, value) {
  const data = getData() || {};
  data[section] = value;
  setData(data);
}

function removeSectionData(section) {
  const data = getData();
  if (data) {
    delete data[section];
    if (Object.keys(data).length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      setData(data);
    }
  }
}

/* ===== AUTH ===== */
function initAuth() {
  const loginScreen = document.getElementById('login-screen');
  const dashboard = document.getElementById('dashboard');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');

  if (sessionStorage.getItem(AUTH_KEY) === 'true') {
    loginScreen.hidden = true;
    dashboard.hidden = false;
    return;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = document.getElementById('pin').value;
    const storedPin = localStorage.getItem(PIN_KEY) || DEFAULT_PIN;

    if (pin === storedPin) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      loginScreen.hidden = true;
      dashboard.hidden = false;
      loginError.hidden = true;
    } else {
      loginError.hidden = false;
      document.getElementById('pin').value = '';
      document.getElementById('pin').focus();
    }
  });
}

/* ===== SIDEBAR ===== */
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('is-open');
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
  });
}

/* ===== PANEL SWITCHING ===== */
function initPanelSwitching() {
  const links = document.querySelectorAll('.sidebar__link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;

      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      document.querySelectorAll('.panel').forEach(p => p.hidden = true);
      const panel = document.getElementById('panel-' + section);
      if (panel) panel.hidden = false;

      const sidebar = document.getElementById('sidebar');
      if (sidebar.classList.contains('is-open')) {
        sidebar.classList.remove('is-open');
      }
    });
  });
}

/* ===== SAVE BUTTONS ===== */
function initSaveButtons() {
  document.querySelectorAll('[data-save]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.save;
      saveFunctions[section]();
      showToast('Changes saved successfully!', 'success');
    });
  });
}

/* ===== RESET BUTTONS ===== */
function initResetButtons() {
  document.querySelectorAll('[data-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.reset;
      removeSectionData(section);
      loadFunctions[section]();
      showToast('Section reset to defaults.', 'info');
    });
  });
}

/* ===== MODALS ===== */
function initModals() {
  const pinModal = document.getElementById('pin-modal');
  const resetModal = document.getElementById('reset-modal');

  document.getElementById('btn-change-pin').addEventListener('click', () => {
    pinModal.hidden = false;
  });

  document.getElementById('btn-cancel-pin').addEventListener('click', () => {
    pinModal.hidden = true;
    document.getElementById('pin-form').reset();
  });

  document.getElementById('pin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const current = document.getElementById('current-pin').value;
    const newPin = document.getElementById('new-pin').value;
    const confirm = document.getElementById('confirm-pin').value;
    const storedPin = localStorage.getItem(PIN_KEY) || DEFAULT_PIN;

    if (current !== storedPin) {
      showToast('Current PIN is incorrect.', 'error');
      return;
    }
    if (newPin.length < 4) {
      showToast('New PIN must be at least 4 characters.', 'error');
      return;
    }
    if (newPin !== confirm) {
      showToast('New PINs do not match.', 'error');
      return;
    }

    localStorage.setItem(PIN_KEY, newPin);
    pinModal.hidden = true;
    document.getElementById('pin-form').reset();
    showToast('PIN updated successfully!', 'success');
  });

  document.getElementById('btn-reset-all').addEventListener('click', () => {
    resetModal.hidden = false;
  });

  document.getElementById('btn-cancel-reset').addEventListener('click', () => {
    resetModal.hidden = true;
  });

  document.getElementById('btn-confirm-reset').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    resetModal.hidden = true;
    loadAllSections();
    showToast('All content reset to defaults.', 'success');
  });
}

/* ===== TOAST ===== */
function showToast(message, type) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, 3000);
}

/* ===== LOAD ALL SECTIONS ===== */
function loadAllSections() {
  Object.keys(loadFunctions).forEach(key => loadFunctions[key]());
}

const loadFunctions = {
  hero: loadHero,
  services: loadServices,
  about: loadAbout,
  testimonials: loadTestimonials,
  areas: loadAreas,
  contact: loadContact
};

const saveFunctions = {
  hero: saveHero,
  services: saveServices,
  about: saveAbout,
  testimonials: saveTestimonials,
  areas: saveAreas,
  contact: saveContact
};

/* ===== HERO ===== */
function loadHero() {
  const d = getSectionData('hero');
  document.getElementById('hero-badge').value = d.badge;
  document.getElementById('hero-headline').value = d.headline.replace(/\n/g, ' ');
  document.getElementById('hero-subtext').value = d.subtext;
  document.getElementById('hero-cta-primary').value = d.ctaPrimary;
  document.getElementById('hero-cta-secondary').value = d.ctaSecondary;
}

function saveHero() {
  saveSectionData('hero', {
    badge: document.getElementById('hero-badge').value,
    headline: document.getElementById('hero-headline').value,
    subtext: document.getElementById('hero-subtext').value,
    ctaPrimary: document.getElementById('hero-cta-primary').value,
    ctaSecondary: document.getElementById('hero-cta-secondary').value
  });
}

/* ===== SERVICES ===== */
function loadServices() {
  const d = getSectionData('services');
  document.getElementById('services-subtitle').value = d.subtitle;
  document.getElementById('services-title').value = d.title;
  document.getElementById('services-description').value = d.description;
  renderServicesList(d.items);

  document.getElementById('btn-add-service').onclick = () => {
    const list = document.getElementById('services-list');
    list.appendChild(createServiceItem({ name: '', description: '' }, list.children.length));
  };
}

function renderServicesList(items) {
  const list = document.getElementById('services-list');
  list.innerHTML = '';
  items.forEach((item, i) => list.appendChild(createServiceItem(item, i)));
}

function createServiceItem(item, index) {
  const el = document.createElement('div');
  el.className = 'list-item';
  el.innerHTML = `
    <div class="list-item__header">
      <span class="list-item__title">Service ${index + 1}</span>
      <div class="list-item__actions">
        <button class="btn-icon btn-remove" aria-label="Remove">&times;</button>
      </div>
    </div>
    <div class="field">
      <label>Service Name</label>
      <input type="text" class="svc-name" value="${escapeAttr(item.name)}">
    </div>
    <div class="field">
      <label>Description</label>
      <textarea class="svc-desc" rows="2">${escapeHtml(item.description)}</textarea>
    </div>
  `;
  el.querySelector('.btn-remove').addEventListener('click', () => el.remove());
  return el;
}

function saveServices() {
  const items = [];
  document.querySelectorAll('#services-list .list-item').forEach(el => {
    items.push({
      name: el.querySelector('.svc-name').value,
      description: el.querySelector('.svc-desc').value
    });
  });
  saveSectionData('services', {
    subtitle: document.getElementById('services-subtitle').value,
    title: document.getElementById('services-title').value,
    description: document.getElementById('services-description').value,
    items
  });
}

/* ===== ABOUT ===== */
function loadAbout() {
  const d = getSectionData('about');
  document.getElementById('about-subtitle').value = d.subtitle;
  document.getElementById('about-title').value = d.title;
  document.getElementById('about-paragraph1').value = d.paragraph1;
  document.getElementById('about-paragraph2').value = d.paragraph2;
  renderValuesList(d.values);
  renderStatsGrid(d.stats);

  document.getElementById('btn-add-value').onclick = () => {
    const list = document.getElementById('values-list');
    list.appendChild(createValueItem(''));
  };
}

function renderValuesList(values) {
  const list = document.getElementById('values-list');
  list.innerHTML = '';
  values.forEach(v => list.appendChild(createValueItem(v)));
}

function createValueItem(value) {
  const el = document.createElement('div');
  el.className = 'value-item';
  el.innerHTML = `
    <input type="text" class="value-text" value="${escapeAttr(value)}">
    <button class="btn-icon btn-remove" aria-label="Remove">&times;</button>
  `;
  el.querySelector('.btn-remove').addEventListener('click', () => el.remove());
  return el;
}

function renderStatsGrid(stats) {
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';
  stats.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'stat-item';
    el.innerHTML = `
      <label>${escapeHtml(s.label)}</label>
      <div class="stat-item__row">
        <input type="number" class="stat-target" value="${s.target}">
        <input type="text" class="stat-suffix" value="${escapeAttr(s.suffix)}" placeholder="suffix">
      </div>
      <div class="field" style="margin-top:0.5rem;margin-bottom:0">
        <input type="text" class="stat-label" value="${escapeAttr(s.label)}" placeholder="Label">
      </div>
    `;
    grid.appendChild(el);
  });
}

function saveAbout() {
  const values = [];
  document.querySelectorAll('#values-list .value-text').forEach(input => {
    if (input.value.trim()) values.push(input.value.trim());
  });

  const stats = [];
  document.querySelectorAll('#stats-grid .stat-item').forEach(el => {
    stats.push({
      target: parseInt(el.querySelector('.stat-target').value, 10) || 0,
      suffix: el.querySelector('.stat-suffix').value,
      label: el.querySelector('.stat-label').value
    });
  });

  saveSectionData('about', {
    subtitle: document.getElementById('about-subtitle').value,
    title: document.getElementById('about-title').value,
    paragraph1: document.getElementById('about-paragraph1').value,
    paragraph2: document.getElementById('about-paragraph2').value,
    values,
    stats
  });
}

/* ===== TESTIMONIALS ===== */
function loadTestimonials() {
  const d = getSectionData('testimonials');
  renderTestimonialsList(d);

  document.getElementById('btn-add-testimonial').onclick = () => {
    const list = document.getElementById('testimonials-list');
    list.appendChild(createTestimonialItem({ text: '', name: '', location: '', stars: 5 }, list.children.length));
  };
}

function renderTestimonialsList(items) {
  const list = document.getElementById('testimonials-list');
  list.innerHTML = '';
  items.forEach((item, i) => list.appendChild(createTestimonialItem(item, i)));
}

function createTestimonialItem(item, index) {
  const el = document.createElement('div');
  el.className = 'list-item';
  el.innerHTML = `
    <div class="list-item__header">
      <span class="list-item__title">Testimonial ${index + 1}</span>
      <div class="list-item__actions">
        <button class="btn-icon btn-remove" aria-label="Remove">&times;</button>
      </div>
    </div>
    <div class="field">
      <label>Review Text</label>
      <textarea class="test-text" rows="3">${escapeHtml(item.text)}</textarea>
    </div>
    <div class="field">
      <label>Customer Name</label>
      <input type="text" class="test-name" value="${escapeAttr(item.name)}">
    </div>
    <div class="field">
      <label>Location</label>
      <input type="text" class="test-location" value="${escapeAttr(item.location)}">
    </div>
    <div class="field">
      <label>Stars (1-5)</label>
      <input type="number" class="test-stars" min="1" max="5" value="${item.stars}">
    </div>
  `;
  el.querySelector('.btn-remove').addEventListener('click', () => el.remove());
  return el;
}

function saveTestimonials() {
  const items = [];
  document.querySelectorAll('#testimonials-list .list-item').forEach(el => {
    items.push({
      text: el.querySelector('.test-text').value,
      name: el.querySelector('.test-name').value,
      location: el.querySelector('.test-location').value,
      stars: parseInt(el.querySelector('.test-stars').value, 10) || 5
    });
  });
  saveSectionData('testimonials', items);
}

/* ===== SERVICE AREAS ===== */
function loadAreas() {
  const d = getSectionData('areas');
  document.getElementById('areas-title').value = d.title;
  document.getElementById('areas-description').value = d.description;
  renderAreaTags(d.items);

  document.getElementById('btn-add-area').onclick = () => {
    const input = document.getElementById('new-area-input');
    const val = input.value.trim();
    if (!val) return;
    const container = document.getElementById('areas-tags');
    container.appendChild(createAreaTag(val));
    input.value = '';
    input.focus();
  };

  document.getElementById('new-area-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('btn-add-area').click();
    }
  });
}

function renderAreaTags(items) {
  const container = document.getElementById('areas-tags');
  container.innerHTML = '';
  items.forEach(item => container.appendChild(createAreaTag(item)));
}

function createAreaTag(name) {
  const el = document.createElement('span');
  el.className = 'area-tag-edit';
  el.innerHTML = `${escapeHtml(name)}<button class="area-tag-edit__remove" aria-label="Remove">&times;</button>`;
  el.querySelector('.area-tag-edit__remove').addEventListener('click', () => el.remove());
  return el;
}

function saveAreas() {
  const items = [];
  document.querySelectorAll('#areas-tags .area-tag-edit').forEach(el => {
    const text = el.childNodes[0].textContent.trim();
    if (text) items.push(text);
  });
  saveSectionData('areas', {
    title: document.getElementById('areas-title').value,
    description: document.getElementById('areas-description').value,
    items
  });
}

/* ===== CONTACT ===== */
function loadContact() {
  const d = getSectionData('contact');
  document.getElementById('contact-phone').value = d.phone;
  document.getElementById('contact-email').value = d.email;
  document.getElementById('contact-address').value = d.address;
  document.getElementById('contact-hours').value = d.hours;
}

function saveContact() {
  saveSectionData('contact', {
    phone: document.getElementById('contact-phone').value,
    email: document.getElementById('contact-email').value,
    address: document.getElementById('contact-address').value,
    hours: document.getElementById('contact-hours').value
  });
}

/* ===== UTILS ===== */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
