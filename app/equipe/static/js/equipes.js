/* =========================================================
   EQUIPE.JS — InovaAcess
   Grid animado, lazy-load de imagens, modal acessível,
   smooth scroll e pequenos utilitários.
   ========================================================= */
(() => {
  "use strict";

  // ---------- Helpers ----------
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, cb, opt) => el && el.addEventListener(ev, cb, opt);

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const trapFocus = (root) => {
    const focusables = $$('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])', root)
      .filter(el => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));
    if (!focusables.length) return () => {};
    const first = focusables[0], last = focusables[focusables.length - 1];
    const handler = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };
    root.addEventListener("keydown", handler);
    return () => root.removeEventListener("keydown", handler);
  };

  // ---------- Lazy-load das imagens ----------
  function setupLazyImages() {
    const imgs = $$(".equipe-grid .card img");
    if (!imgs.length) return;

    // Se já tiver loading="lazy" no HTML, ainda assim observamos para fallback
    imgs.forEach(img => {
      // fallback de erro: cor sólida sutil
      on(img, "error", () => {
        img.style.background = "linear-gradient(180deg, #e5e7eb, #cbd5e1)";
      }, { once: true });
    });

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          // se existir data-src, trocamos; senão, mantemos src atual
          const ds = target.getAttribute("data-src");
          if (ds) target.src = ds;
          target.decoding = "async";
          target.loading  = "lazy";
          obs.unobserve(target);
        });
      }, { rootMargin: "200px 0px" });
      imgs.forEach(img => io.observe(img));
    } else {
      // fallback: marca todas como lazy nativo
      imgs.forEach(img => { img.loading = "lazy"; img.decoding = "async"; });
    }
  }

  // ---------- Animação de entrada dos cards ----------
  function setupCardsReveal() {
    if (prefersReduced) return;

    const cards = $$(".equipe-grid .card");
    if (!cards.length) return;

    // Já tem animação via CSS keyframes; reforçamos com IO para evitar animar offscreen
    if ("IntersectionObserver" in window) {
      cards.forEach(c => { c.style.willChange = "transform, opacity"; });
      const io = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return;
          target.style.opacity = "1";
          target.style.transform = "translateY(0)";
          target.style.animationDelay = "0s"; // ignora delays se quiser sincronizar
          io.unobserve(target);
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });
      cards.forEach(c => io.observe(c));
    }
  }

  // ---------- Modal simples de preview de membro ----------
  // (Opcional: se não existir no HTML, criamos dinamicamente)
  let modal, modalClose, cleanupTrap = () => {};
  function ensureModal() {
    modal = $("#equipe-modal");
    if (modal) return;

    modal = document.createElement("dialog");
    modal.id = "equipe-modal";
    modal.setAttribute("aria-labelledby", "equipe-modal-title");
    modal.className = "equipe-modal";
    modal.innerHTML = `
      <form method="dialog" class="modal-card">
        <header class="modal-head">
          <h3 id="equipe-modal-title">Detalhes</h3>
          <button type="submit" class="btn-close" aria-label="Fechar">✕</button>
        </header>
        <div class="modal-body">
          <div class="modal-media">
            <img alt="" />
          </div>
          <div class="modal-content">
            <h4 class="name"></h4>
            <p class="role"></p>
            <p class="bio"></p>
          </div>
        </div>
        <footer class="modal-foot">
          <button type="submit" class="btn primary">Fechar</button>
        </footer>
      </form>
    `;
    document.body.appendChild(modal);
  }

  function openModalFromCard(card) {
    ensureModal();
    const img  = card.querySelector("img");
    const name = card.querySelector("h3")?.textContent?.trim() || "Membro";
    const role = card.querySelector(".role")?.textContent?.trim() || "";
    const bio  = card.querySelector("p:not(.role)")?.textContent?.trim() || "";

    modal.querySelector("img").src = img?.src || img?.getAttribute?.("data-src") || "";
    modal.querySelector("img").alt = `Foto de ${name}`;
    modal.querySelector(".name").textContent = name;
    modal.querySelector(".role").textContent = role;
    modal.querySelector(".bio").textContent  = bio;

    // abre de forma acessível
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.setAttribute("open", "");
    }
    cleanupTrap = trapFocus(modal);
    modal.addEventListener("close", () => { cleanupTrap(); }, { once: true });

    // Esc para fechar
    const esc = (e) => {
      if (e.key === "Escape") {
        modal.close();
        document.removeEventListener("keydown", esc);
      }
    };
    document.addEventListener("keydown", esc);
  }

  function setupCardClicks() {
    const cards = $$(".equipe-grid .card");
    cards.forEach(card => {
      card.style.cursor = "pointer";
      on(card, "click", (e) => {
        // Evita abrir se o clique for em um <a>
        if (e.target.closest("a")) return;
        openModalFromCard(card);
      });
      on(card, "keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModalFromCard(card);
        }
      });
      card.tabIndex = 0; // acessível via teclado
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Ver detalhes do membro");
    });
  }

  // ---------- Smooth scroll para âncoras locais ----------
  function setupSmoothAnchors() {
    $$('a[href^="#"]').forEach(a => {
      on(a, "click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href === "#") return;
        const el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", href);
      });
    });
  }

  // ---------- Pequeno tracking (console) ----------
  function setupTracking() {
    $$(".equipe-grid .card").forEach((card) => {
      on(card, "click", () => {
        const name = card.querySelector("h3")?.textContent?.trim();
        console.debug("👤 Card equipe clicado:", name);
      }, { passive: true });
    });
  }

  // ---------- Expor API de debug ----------
  window.Equipe = Object.freeze({
    open: (idx = 0) => {
      const cards = $$(".equipe-grid .card");
      if (cards[idx]) openModalFromCard(cards[idx]);
    }
  });

  // ---------- Boot ----------
  function boot() {
    setupLazyImages();
    setupCardsReveal();
    setupCardClicks();
    setupSmoothAnchors();
    setupTracking();
    console.log("%cEquipe carregado ✅", "color:#fff;background:#378297;padding:2px 6px;border-radius:6px");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
