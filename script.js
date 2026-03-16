document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavScroll();
  initActiveNav();
  initScrollAnimations();
  initCounters();
  initContactForm();
  initBackToTop();
});

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
