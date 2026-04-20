document.addEventListener('DOMContentLoaded', () => {
  applyRemoteContent();
  initMobileMenu();
  initNavScroll();
  initActiveNav();
  initScrollAnimations();
  initCounters();
  initContactForm();
  initBackToTop();
});

/* ===== Remote Content Overrides ===== */
function applyRemoteContent() {
  try {
    const raw = localStorage.getItem('cr_admin');
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.hero) applyHero(data.hero);
    if (data.services) applyServices(data.services);
    if (data.about) applyAbout(data.about);
    if (data.testimonials) applyTestimonials(data.testimonials);
    if (data.areas) applyAreas(data.areas);
    if (data.contact) applyContact(data.contact);
  } catch (e) {
    // Silently fail — show default content
  }
}

function applyHero(d) {
  const section = document.getElementById('hero');
  if (!section) return;
  const badge = section.querySelector('.hero__badge');
  const h1 = section.querySelector('h1');
  const p = section.querySelector('.hero__content > p');
  const btns = section.querySelectorAll('.hero__actions .btn');

  if (badge && d.badge) badge.textContent = d.badge;
  if (h1 && d.headline) h1.innerHTML = d.headline.replace(/\n/g, '<br>');
  if (p && d.subtext) p.textContent = d.subtext;
  if (btns[0] && d.ctaPrimary) btns[0].textContent = d.ctaPrimary;
  if (btns[1] && d.ctaSecondary) btns[1].textContent = d.ctaSecondary;
}

function applyServices(d) {
  const section = document.getElementById('services');
  if (!section) return;
  const subtitle = section.querySelector('.section-subtitle');
  const title = section.querySelector('.section-title');
  const desc = section.querySelector('.section-description');
  const grid = section.querySelector('.services__grid');

  if (subtitle && d.subtitle) subtitle.textContent = d.subtitle;
  if (title && d.title) title.textContent = d.title;
  if (desc && d.description) desc.textContent = d.description;

  if (grid && d.items) {
    grid.innerHTML = '';
    d.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.setAttribute('data-animate', '');
      card.innerHTML = `
        <div class="service-card__icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22L24 8l18 14"/><path d="M10 20v16h28V20"/><path d="M20 36V28h8v8"/></svg>
        </div>
        <h3>${escapeHtmlMain(item.name)}</h3>
        <p>${escapeHtmlMain(item.description)}</p>
        <a href="#contact" class="service-card__link">Get a Quote &rarr;</a>
      `;
      grid.appendChild(card);
    });
  }
}

function applyAbout(d) {
  const section = document.getElementById('about');
  if (!section) return;
  const subtitle = section.querySelector('.section-subtitle');
  const title = section.querySelector('.section-title');
  const paragraphs = section.querySelectorAll('.about__text > p');
  const valuesList = section.querySelector('.about__values');
  const stats = section.querySelectorAll('.stat');

  if (subtitle && d.subtitle) subtitle.textContent = d.subtitle;
  if (title && d.title) title.textContent = d.title;
  if (paragraphs[0] && d.paragraph1) paragraphs[0].textContent = d.paragraph1;
  if (paragraphs[1] && d.paragraph2) paragraphs[1].textContent = d.paragraph2;

  if (valuesList && d.values) {
    valuesList.innerHTML = '';
    d.values.forEach(v => {
      const li = document.createElement('li');
      li.textContent = v;
      valuesList.appendChild(li);
    });
  }

  if (d.stats) {
    d.stats.forEach((s, i) => {
      if (stats[i]) {
        const num = stats[i].querySelector('.stat__number');
        const suffix = stats[i].querySelector('.stat__suffix');
        const label = stats[i].querySelector('.stat__label');
        if (num) num.dataset.target = s.target;
        if (suffix) suffix.textContent = s.suffix;
        if (label) label.textContent = s.label;
      }
    });
  }
}

function applyTestimonials(items) {
  const section = document.getElementById('testimonials');
  if (!section) return;
  const grid = section.querySelector('.testimonials__grid');
  if (!grid || !items.length) return;

  grid.innerHTML = '';
  items.forEach(item => {
    const initials = item.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    const stars = '\u2605'.repeat(Math.min(item.stars, 5));
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    card.setAttribute('data-animate', '');
    card.innerHTML = `
      <div class="testimonial-card__stars">${stars}</div>
      <p class="testimonial-card__text">"${escapeHtmlMain(item.text)}"</p>
      <div class="testimonial-card__author">
        <div class="testimonial-card__avatar">${escapeHtmlMain(initials)}</div>
        <div>
          <strong>${escapeHtmlMain(item.name)}</strong>
          <span>${escapeHtmlMain(item.location)}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function applyAreas(d) {
  const section = document.getElementById('areas');
  if (!section) return;
  const title = section.querySelector('.section-title');
  const desc = section.querySelector('.section-description');
  const list = section.querySelector('.areas__list');

  if (title && d.title) title.textContent = d.title;
  if (desc && d.description) desc.textContent = d.description;

  if (list && d.items) {
    list.innerHTML = '';
    d.items.forEach(area => {
      const tag = document.createElement('span');
      tag.className = 'area-tag';
      tag.textContent = area;
      list.appendChild(tag);
    });
  }
}

function applyContact(d) {
  const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

  if (d.phone) {
    const digits = d.phone.replace(/\D/g, '');
    phoneLinks.forEach(a => {
      a.href = 'tel:' + digits;
      if (a.childNodes.length === 1 || a.textContent.trim().match(/^\(?\d/)) {
        a.textContent = d.phone;
      }
    });
  }

  if (d.email) {
    emailLinks.forEach(a => {
      a.href = 'mailto:' + d.email;
      a.textContent = d.email;
    });
  }

  if (d.address) {
    const addressEls = document.querySelectorAll('.contact__info-item p, .footer__contact p');
    addressEls.forEach(p => {
      if (p.textContent.includes('Airport') || p.textContent.includes('Farmington')) {
        p.innerHTML = d.address.replace(/\n/g, '<br>');
      }
    });
  }

  if (d.hours) {
    const hoursItems = document.querySelectorAll('.contact__info-item');
    hoursItems.forEach(item => {
      const strong = item.querySelector('strong');
      if (strong && strong.textContent.trim() === 'Hours') {
        const p = item.querySelector('p');
        if (p) p.innerHTML = d.hours.replace(/\n/g, '<br>');
      }
    });
  }
}

function escapeHtmlMain(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ===== Mobile Menu Toggle ===== */
function initMobileMenu() {
  const hamburger = document.querySelector('.nav__hamburger');
  const menu = document.querySelector('.nav__menu');
  const navLinks = document.querySelectorAll('.nav__list a');

  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') &&
        !menu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      menu.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
  });
}

/* ===== Sticky Nav Scroll Effect ===== */
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ===== Active Nav Link Highlighting ===== */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__list a');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -70% 0px'
  });

  sections.forEach(section => observer.observe(section));
}

/* ===== Scroll-Triggered Animations ===== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ===== Stats Counter Animation ===== */
function initCounters() {
  const counters = document.querySelectorAll('.stat__number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    el.textContent = Math.floor(eased * target);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

/* ===== Contact Form Handling ===== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  if (!form || !successEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(form);

    if (!validateForm(form)) return;

    // Show success message (no backend — integrate with Formspree, Netlify Forms, or EmailJS)
    form.style.display = 'none';
    successEl.hidden = false;

    // Reset after 5 seconds
    setTimeout(() => {
      form.reset();
      form.style.display = '';
      successEl.hidden = true;
    }, 5000);
  });
}

function validateForm(form) {
  let isValid = true;

  const name = form.querySelector('#name');
  if (!name.value.trim()) {
    showError(name, 'Please enter your name');
    isValid = false;
  }

  const phone = form.querySelector('#phone');
  if (!phone.value.trim()) {
    showError(phone, 'Please enter your phone number');
    isValid = false;
  } else if (phone.value.replace(/\D/g, '').length < 10) {
    showError(phone, 'Please enter a valid phone number');
    isValid = false;
  }

  const email = form.querySelector('#email');
  if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    showError(email, 'Please enter a valid email address');
    isValid = false;
  }

  const service = form.querySelector('#service');
  if (!service.value) {
    showError(service, 'Please select a service');
    isValid = false;
  }

  return isValid;
}

function showError(input, message) {
  const group = input.closest('.form-group');
  group.classList.add('error');
  const errorEl = document.createElement('span');
  errorEl.className = 'error-message';
  errorEl.textContent = message;
  group.appendChild(errorEl);
}

function clearErrors(form) {
  form.querySelectorAll('.form-group.error').forEach(g => g.classList.remove('error'));
  form.querySelectorAll('.error-message').forEach(el => el.remove());
}

/* ===== Back to Top Button ===== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
