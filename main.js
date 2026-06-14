// ══════════════════════════════════════════════════════════
//  GULMIRA SAHNA BEZAKLARI — Main JS
//  Features: SPA routing · Dark/Light · i18n · Nav scroll
// ══════════════════════════════════════════════════════════

// ─── STATE ────────────────────────────────────────────────
let currentLang = localStorage.getItem('gsb-lang') || 'uz';
let currentTheme = localStorage.getItem('gsb-theme') || 'dark';
let currentPage = 'home';

// ─── DOM ──────────────────────────────────────────────────
const html       = document.documentElement;
const navbar     = document.getElementById('navbar');
const themeBtn   = document.getElementById('themeToggle');
const langBtns   = document.querySelectorAll('.lang-btn');
const navLinks   = document.querySelectorAll('.nav-link');
const allPages   = document.querySelectorAll('.page');
const burger     = document.getElementById('burger');
const navLinksEl = document.getElementById('navLinks');
const sendTgBtn  = document.getElementById('sendTgBtn');

// ─── INIT ─────────────────────────────────────────────────
function init() {
  applyTheme(currentTheme, false);
  applyLang(currentLang);
  navigateTo('home', false);
  bindEvents();
}

// ─── THEME ────────────────────────────────────────────────
function applyTheme(theme, animate = true) {
  currentTheme = theme;
  html.setAttribute('data-theme', theme);
  localStorage.setItem('gsb-theme', theme);
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// ─── LANGUAGE ─────────────────────────────────────────────
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('gsb-lang', lang);
  html.setAttribute('lang', lang);

  const t = window.translations[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      // Keep placeholder for inputs
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        // skip, handled separately
      } else if (el.tagName === 'OPTION') {
        el.textContent = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Update active lang button
  langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Re-apply nav active state
  updateNavActive(currentPage);
}

// ─── ROUTING ──────────────────────────────────────────────
function navigateTo(page, animate = true) {
  currentPage = page;

  // Show / hide pages
  allPages.forEach(p => {
    if (p.dataset.page === page) {
      p.classList.remove('hidden');
      if (animate) {
        p.style.animation = 'none';
        p.offsetHeight; // reflow
        p.style.animation = '';
      }
    } else {
      p.classList.add('hidden');
    }
  });

  // Update nav link states
  updateNavActive(page);

  // Close mobile menu
  navLinksEl.classList.remove('open');

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavActive(page) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
}

// ─── NAV SCROLL ───────────────────────────────────────────
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ─── EVENTS ───────────────────────────────────────────────
function bindEvents() {

  // Theme toggle
  themeBtn.addEventListener('click', toggleTheme);

  // Language buttons
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  // Nav links (header)
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  // Footer links
  document.querySelectorAll('.footer-links a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      if (a.dataset.page) navigateTo(a.dataset.page);
    });
  });

  // CTA buttons with data-page (hero, service cards, pricing)
  document.querySelectorAll('[data-page]:not(.nav-link):not(.footer-links a)').forEach(el => {
    if (el.tagName === 'BUTTON' || (el.tagName === 'A' && !el.href.startsWith('http'))) {
      el.addEventListener('click', e => {
        e.preventDefault();
        if (el.dataset.page) navigateTo(el.dataset.page);
      });
    }
  });

  // Burger menu
  burger.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
  });

  // Close menu on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinksEl.classList.remove('open');
    }
  });

  // Telegram form submit
  if (sendTgBtn) {
    sendTgBtn.addEventListener('click', () => {
      const name    = (document.getElementById('fname')?.value || '').trim();
      const phone   = (document.getElementById('fphone')?.value || '').trim();
      const service = (document.getElementById('fservice')?.value || '').trim();
      const msg     = (document.getElementById('fmsg')?.value || '').trim();

      if (!name || !phone) {
        sendTgBtn.textContent = '⚠ Ism va telefon kiritish shart!';
        sendTgBtn.style.background = '#E67E22';
        setTimeout(() => {
          sendTgBtn.textContent = window.translations[currentLang]?.formSend || 'Telegram orqali yuborish ✈';
          sendTgBtn.style.background = '';
        }, 2500);
        return;
      }

      // ─── O'ZGARTIRING: t.me/YOUR_BOT_USERNAME joyiga o'zingizning bot username kiriting ───
      const BOT_USERNAME = 'Gulmira_sahna';

      const text = encodeURIComponent(
        `🌹 Yangi murojaat:\n\n` +
        `👤 Ism: ${name}\n` +
        `📞 Telefon: ${phone}\n` +
        (service ? `🎭 Xizmat: ${service}\n` : '') +
        (msg ? `💬 Xabar: ${msg}\n` : '') +
        `\n📅 Sana: ${new Date().toLocaleDateString('uz-UZ')}`
      );

      const tgUrl = `https://t.me/${BOT_USERNAME}?start=order_${Date.now()}&text=${text}`;
      window.open(tgUrl, '_blank', 'noopener');

      // Visual feedback
      sendTgBtn.textContent = '✅ Telegram ochildi!';
      sendTgBtn.style.background = '#27AE60';
      setTimeout(() => {
        sendTgBtn.textContent = window.translations[currentLang]?.formSend || 'Telegram orqali yuborish ✈';
        sendTgBtn.style.background = '';
      }, 3000);
    });
  }

  // Keyboard nav
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') navLinksEl.classList.remove('open');
  });

  // Intersection Observer for subtle reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.feature-card, .service-card, .price-card, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ─── START ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
