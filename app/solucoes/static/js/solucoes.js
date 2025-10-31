/* =========================================================
   SOLUCOES.JS — InovaAcess
   Módulo parrudo: animações leves, tracking de CTAs, ping,
   helpers utilitários e APIs para DX (window.Solucoes).
   ========================================================= */
(() => {
  "use strict";

  // =========================
  // Helpers básicos
  // =========================
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, cb, opt) => el && el.addEventListener(ev, cb, opt);

  const raf = (fn) => window.requestAnimationFrame(fn);
  const idle = (fn) => ("requestIdleCallback" in window) ? requestIdleCallback(fn, { timeout: 800 }) : setTimeout(fn, 1);

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const debounce = (fn, wait = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const throttle = (fn, wait = 200) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn(...args);
      }
    };
  };

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =========================
  // Ping do módulo (sanity-check)
  // =========================
  async function modulePing({ tries = 2, delay = 400 } = {}) {
    const url = "/solucoes/ping";
    let lastErr = null;
    for (let i = 0; i < tries; i++) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort("timeout"), 3000);
        const res = await fetch(url, { signal: ctrl.signal, headers: { "Accept": "application/json" } });
        clearTimeout(timer);
        if (!res.ok) throw new Error(`Ping HTTP ${res.status}`);
        const data = await res.json().catch(() => ({}));
        console.info("🟢 Soluções: ping OK", data);
        return true;
      } catch (e) {
        lastErr = e;
        console.warn(`⚠️ Soluções: ping falhou (tentativa ${i + 1}/${tries})`, e);
        await sleep(delay);
      }
    }
    console.error("🔴 Soluções: ping falhou definitivamente:", lastErr);
    return false;
  }

  // =========================
  // Tracking simples das CTAs
  // =========================
  function setupCtaTracking() {
    const CTAS = $$('a.btn, .card .btn, .hero-actions .btn');
    CTAS.forEach((btn) => {
      on(btn, "click", (e) => {
        const label = btn.textContent.trim();
        const href  = btn.getAttribute("href") || "";
        console.debug("📝 CTA click:", { label, href, ts: Date.now() });
        // Anti double-click básico
        if (!btn.dataset.locked) {
          btn.dataset.locked = "1";
          btn.classList.add("is-clicked");
          setTimeout(() => {
            btn.classList.remove("is-clicked");
            delete btn.dataset.locked;
          }, 600);
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
      }, { passive: true });
    });
  }

  // =========================
  // Animação de entrada dos cards
  // =========================
  function setupCardsReveal() {
    if (prefersReducedMotion) return;

    const cards = $$(".cards .card");
    if (!cards.length) return;

    cards.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = "translateY(8px)";
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.style.transition = "opacity .5s ease, transform .5s ease";
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    cards.forEach((c, i) => {
      // atraso leve em cascata
      c.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
      io.observe(c);
    });
  }

  // =========================
  // Scroll suave (fallback/robust)
  // =========================
  function smoothScrollTo(hash) {
    try {
      const el = document.querySelector(hash);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      // no-op
    }
  }

  function setupSmoothAnchors() {
    // aplica só em anchors locais
    $$('a[href^="#"]').forEach((a) => {
      on(a, "click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#" || href.startsWith("#!") ) return;
        e.preventDefault();
        history.pushState(null, "", href);
        smoothScrollTo(href);
      });
    });
  }

  // =========================
  // Guardar última visita (LS)
  // =========================
  const LS_KEY = "solucoes:last_visit";
  function rememberVisit() {
    try {
      localStorage.setItem(LS_KEY, String(Date.now()));
    } catch {}
  }
  function getLastVisit() {
    try {
      const v = localStorage.getItem(LS_KEY);
      return v ? new Date(Number(v)) : null;
    } catch { return null; }
  }

  // =========================
  // Pequenas melhorias de UX
  // =========================
  function setupKeyboardShortcuts() {
    // atalhos leves para DX (somente em desktop)
    on(document, "keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key.toLowerCase() === "g") {
        // G = go top
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      }
      if (e.key.toLowerCase() === "e") {
        // E = cadastrar empresa
        const link = $('a[href*="cadastro-empresa"]');
        if (link) link.click();
      }
    });
  }

  // =========================
  // Expor API mínima p/ debug
  // =========================
  const API = {
    ping: modulePing,
    smoothScrollTo,
    getLastVisit
  };
  Object.defineProperty(window, "Solucoes", {
    value: API,
    writable: false
  });

  // =========================
  // Boot
  // =========================
  function boot() {
    idle(() => modulePing());        // roda em idle para não bloquear render
    setupCtaTracking();
    setupCardsReveal();
    setupSmoothAnchors();
    setupKeyboardShortcuts();
    rememberVisit();

    console.log("%cSoluções carregado ✅", "color:#fff;background:#378297;padding:2px 6px;border-radius:6px");
  }

  // inicia quando DOM estiver pronto
  if (document.readyState === "loading") {
    on(document, "DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  // Reage à mudança do reduce-motion (opcional)
  if ("matchMedia" in window) {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    on(mq, "change", throttle(() => {
      // se usuário mudar a preferência, reconfigura as animações
      setupCardsReveal();
    }, 500));
  }
})();
