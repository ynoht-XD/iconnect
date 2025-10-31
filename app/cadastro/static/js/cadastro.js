// hackathon/app/cadastro/static/js/cadastro.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#form-cadastro");
  const feedback = document.querySelector("#cadastro-feedback");
  const cards = document.querySelectorAll(".choice-card");
  const inputs = form?.querySelectorAll("input");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // -------------------------------
  // Foco automático no primeiro campo do formulário rápido
  // -------------------------------
  if (inputs && inputs.length) {
    // timeout pequeno para garantir que o layout já aplicou estilos
    setTimeout(() => inputs[0].focus(), 50);
  }

  // -------------------------------
  // Máscara simples de telefone (BR)
  // -------------------------------
  const tel = form?.querySelector('input[name="telefone"]');
  if (tel) {
    tel.addEventListener("input", () => {
      let v = tel.value.replace(/\D/g, "").slice(0, 11); // até 11 dígitos
      if (v.length > 6) {
        tel.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
      } else if (v.length > 2) {
        tel.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
      } else if (v.length > 0) {
        tel.value = `(${v}`;
      } else {
        tel.value = "";
      }
    }, { passive: true });
  }

  // -------------------------------
  // Envio do formulário rápido com feedback suave
  // -------------------------------
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));

    try {
      // Placeholder: envio futuro para API real
      // await fetch("/cadastro/enviar", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });

      // Limpa o formulário
      form.reset();

      // Mostra feedback com animação
      feedback.hidden = false;
      feedback.style.opacity = 0;
      feedback.style.transition = "opacity 0.4s ease";
      requestAnimationFrame(() => {
        feedback.style.opacity = 1;
      });

      // Some suavemente depois de 4s
      setTimeout(() => {
        feedback.style.opacity = 0;
        setTimeout(() => (feedback.hidden = true), 400);
      }, 4000);
    } catch (err) {
      console.error("Erro ao enviar cadastro:", err);
      alert("⚠️ Ocorreu um erro ao enviar seu cadastro. Tente novamente.");
    }
  });

  // -------------------------------
  // Efeito suave nos cards de escolha
  // - Respeita prefers-reduced-motion
  // - Acessível via teclado (Enter ativa o link focado)
  // -------------------------------
  cards.forEach((card) => {
    const baseScale = prefersReduced ? 1.01 : 1.03;
    const baseLift = prefersReduced ? -2 : -6;

    card.addEventListener("mouseenter", () => {
      card.style.transform = `translateY(${baseLift}px) scale(${baseScale})`;
      card.style.transition = "transform 0.28s ease";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0) scale(1)";
    });

    // Foco via teclado: Enter "clica" no card
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // como é <a>, disparar o clique já navega
        card.click();
      }
    });
  });
});
