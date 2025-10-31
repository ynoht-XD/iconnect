// ==========================
// layout.js — Inconnect (robusto)
// ==========================
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const body    = document.body;
  const nav     = $("#main-navigation");
  const toggle  = $("#nav-toggle");
  const overlay = document.querySelector('[data-js="nav-overlay"]');

  // Guarda: se faltar algo essencial, aborta com log
  if (!nav || !toggle) {
    console.warn("[layout.js] Elementos essenciais não encontrados:", { nav: !!nav, toggle: !!toggle });
    return;
  }

  // ===== Estado / A11y
  let isOpen = false;
  const setA11y = () => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  };

  // Foco inicial dentro do menu ao abrir (primeiro link)
  const focusFirstInNav = () => {
    const focusables = $$("a, button, [tabindex]:not([tabindex='-1'])", nav).filter(el => !el.hasAttribute("disabled"));
    if (focusables.length) focusables[0].focus({ preventScroll: true });
  };

  // Focus-trap simples enquanto o drawer está aberto
  const onKeydownTrap = (e) => {
    if (!isOpen || e.key !== "Tab") return;
    const focusables = $$("a, button, [tabindex]:not([tabindex='-1'])", nav).filter(el => !el.hasAttribute("disabled"));
    if (!focusables.length) return;

    const first = focusables[0];
    const last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };

  // ===== Ações
  const open = () => {
    if (isOpen) return;
    isOpen = true;
    body.classList.add("nav-open");
    nav.setAttribute("data-state", "open");
    setA11y();

    // Overlay
    if (overlay) {
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add("active"));
    }
    // Travar scroll do body
    body.style.overflow = "hidden";

    // Focus e trap
    document.addEventListener("keydown", onKeydownTrap);
    focusFirstInNav();
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    body.classList.remove("nav-open");
    nav.setAttribute("data-state", "closed");
    setA11y();

    if (overlay) {
      overlay.classList.remove("active");
      setTimeout(() => { overlay.hidden = true; }, 250);
    }
    body.style.overflow = "";

    document.removeEventListener("keydown", onKeydownTrap);
    // devolve foco ao botão
    toggle.focus({ preventScroll: true });
  };

  const toggleNav = (ev) => {
    if (ev) ev.preventDefault();
    isOpen ? close() : open();
  };

  // ===== Eventos principais
  toggle.addEventListener("click", toggleNav);
  overlay && overlay.addEventListener("click", close);

  // Fecha ao clicar em qualquer link da nav no mobile
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    if (window.matchMedia("(max-width: 991px)").matches) close();
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) close();
  });

  // Resize: garante reset no desktop
  const onResize = () => {
    if (window.matchMedia("(min-width: 992px)").matches) {
      isOpen = false;
      body.classList.remove("nav-open");
      nav.setAttribute("data-state", "closed");
      setA11y();
      if (overlay) { overlay.classList.remove("active"); overlay.hidden = true; }
      body.style.overflow = "";
    }
  };
  window.addEventListener("resize", onResize, { passive: true });

  // Init: começa fechado
  nav.setAttribute("data-state", "closed");
  setA11y();
})();

// ==========================
// Sincroniza --topbar-h dinamicamente
// ==========================
(() => {
  const tb = document.querySelector(".topbar");
  if (!tb) return;

  const sync = () => {
    const h = tb.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--topbar-h", h + "px");
  };

  // Observa mudanças de tamanho/linha
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(sync);
    ro.observe(tb);
  } else {
    window.addEventListener("load", sync);
    window.addEventListener("resize", sync);
  }
  sync();
})();

// ==========================
// Ícones Feather + Slider de Depoimentos (imagens)
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  // substitui ícones
  if (window.feather) feather.replace();

  // Slider depoimentos (imagens)
  const slidesWrap = document.getElementById('slides');
  if (!slidesWrap) return; // página pode não ter a seção

  const slides = Array.from(slidesWrap.querySelectorAll('img'));
  let idx = Math.max(0, slides.findIndex(img => img.classList.contains('active')));
  if (idx < 0) idx = 0;

  const show = (i) => {
    slides.forEach((img, k) => img.classList.toggle('active', k === i));
  };
  show(idx);

  const next = () => { idx = (idx + 1) % slides.length; show(idx); };
  const prev = () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); };

  const btnNext = document.getElementById('nextT');
  const btnPrev = document.getElementById('prevT');
  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  // autoplay + pausa ao passar o mouse
  let timer = setInterval(next, 6000);
  const stage = document.querySelector('.testi .stage');
  if (stage) {
    stage.addEventListener('mouseenter', () => clearInterval(timer));
    stage.addEventListener('mouseleave', () => { timer = setInterval(next, 6000); });
  }
});
