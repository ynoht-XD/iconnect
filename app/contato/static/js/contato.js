/* =========================================================
   CONTATO.JS — InovaAcess
   Envio do formulário via fetch + UX e acessibilidade.
   ========================================================= */
(() => {
  "use strict";

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, cb, opt) => el && el.addEventListener(ev, cb, opt);

  const form     = $("#formContato");
  const feedback = form?.querySelector(".feedback");
  const submitBt = form?.querySelector('button[type="submit"]');

  if (!form) return;

  // Anti-duplo clique
  let locked = false;

  function setLoading(isLoading) {
    if (!submitBt) return;
    submitBt.disabled = isLoading;
    submitBt.dataset.loading = String(isLoading);
    submitBt.innerText = isLoading ? "Enviando..." : "Enviar Mensagem";
  }

  function showFeedback(msg, ok = true) {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.textContent = msg;
    feedback.style.color = ok ? "var(--primary)" : "#dc2626";
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
  }

  function clearFeedback() {
    if (!feedback) return;
    feedback.hidden = true;
    feedback.textContent = "";
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
  }

  function validate() {
    const nome     = form.elements.namedItem("nome")?.value?.trim();
    const email    = form.elements.namedItem("email")?.value?.trim();
    const assunto  = form.elements.namedItem("assunto")?.value?.trim();
    const mensagem = form.elements.namedItem("mensagem")?.value?.trim();

    if (!nome || !email || !assunto || !mensagem) {
      showFeedback("Por favor, preencha todos os campos obrigatórios (*).", false);
      return false;
    }
    if (!validEmail(email)) {
      showFeedback("Digite um e-mail válido (ex.: nome@dominio.com).", false);
      return false;
    }
    return true;
  }

  async function sendForm() {
    const action = form.getAttribute("action") || "/contato/enviar";
    const formData = new FormData(form);

    try {
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort("timeout"), 8000);

      const res = await fetch(action, {
        method: "POST",
        body: formData,
        signal: ctrl.signal,
        headers: { "Accept": "application/json" }
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));

      if (data?.ok) {
        showFeedback("✅ Mensagem enviada com sucesso! Em breve entraremos em contato.", true);
        form.reset();
      } else {
        throw new Error("Resposta inesperada do servidor.");
      }
    } catch (err) {
      console.error("Contato: falha no envio", err);
      showFeedback("Não foi possível enviar agora. Tente novamente em instantes.", false);
    }
  }

  on(form, "submit", async (e) => {
    e.preventDefault();
    if (locked) return;
    clearFeedback();

    if (!validate()) return;

    locked = true;
    setLoading(true);

    await sendForm();

    setLoading(false);
    // desbloqueia com leve atraso para evitar spam
    setTimeout(() => { locked = false; }, 600);
  }, { passive: false });

  // UX: Enter em textarea não envia por engano — só Ctrl+Enter envia
  const ta = form.querySelector("textarea[name='mensagem']");
  on(ta, "keydown", (e) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      // deixa quebrar linha normalmente
      return;
    }
    if ((e.key === "Enter") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submitBt?.click();
    }
  });

  // Expor API mínima para debug manual no console
  window.Contato = Object.freeze({
    validate,
    send: () => submitBt?.click()
  });

  console.log("%cContato carregado ✅", "color:#fff;background:#378297;padding:2px 6px;border-radius:6px");
})();
