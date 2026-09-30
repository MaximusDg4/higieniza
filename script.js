// Higieniza: interacciones de la página.
// El formulario prepara enlaces para WhatsApp y correo; la persona confirma el envío.
document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function scrollToElement(element) {
    element?.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }

  // Menú para celulares.
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");

  if (menuButton && navigation) {
    function setMenuOpen(open) {
      navigation.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }

    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") === "true";
      setMenuOpen(!open);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });

    document.addEventListener("click", (event) => {
      if (
        !navigation.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });
  }

  // Al elegir una plaga, completa el selector y lleva al formulario.
  const pestSelect = document.querySelector("#plaga-select");
  const contactSection = document.querySelector("#contacto");
  const formResult = document.querySelector("#form-result");

  document.querySelectorAll(".service-card[data-pest]").forEach((card) => {
    card.addEventListener("click", () => {
      const pest = card.dataset.pest?.trim();

      if (pestSelect && pest) {
        const exists = Array.from(pestSelect.options).some(
          (option) => option.value === pest
        );

        if (!exists) {
          pestSelect.add(new Option(pest, pest));
        }

        pestSelect.value = pest;
      }

      if (formResult) formResult.hidden = true;
      scrollToElement(contactSection);
    });
  });

  // Pasos del método de trabajo.
  const methodSteps = [
    {
      title: "Inspección",
      text: "Revisamos los indicios de actividad, los accesos y las condiciones del entorno.",
      image: "inspeccion.png",
      imageLabel: "Técnico inspeccionando el zócalo de una cocina con una linterna."
    },
    {
      title: "Diagnóstico",
      text: "Identificamos el problema y los factores que pueden favorecer su presencia.",
      image: "diagnostico.png",
      imageLabel: "Técnico observando indicios de plagas dentro de un mueble de cocina."
    },
    {
      title: "Intervención",
      text: "Definimos las medidas de control de acuerdo con la plaga y el uso del espacio.",
      image: "intervencion.png",
      imageLabel: "Técnico sellando una abertura junto a una cañería."
    },
    {
      title: "Seguimiento",
      text: "Compartimos recomendaciones de prevención y evaluamos los pasos siguientes.",
      image: "seguimiento.png",
      imageLabel: "Técnico registrando una revisión de una estación de monitoreo."
    }
  ];

  const methodNumber = document.querySelector(".method-number");
  const methodTitle = document.querySelector("#method-title");
  const methodText = document.querySelector("#method-text");
  const methodPhoto = document.querySelector(".method-photo");
  const previousStep = document.querySelector("#method-prev");
  const nextStep = document.querySelector("#method-next");
  let methodIndex = 0;

  function renderMethod() {
    if (!methodNumber || !methodTitle || !methodText) return;

    const step = methodSteps[methodIndex];
    methodNumber.textContent =
      `${String(methodIndex + 1).padStart(2, "0")} / ${String(methodSteps.length).padStart(2, "0")}`;
    methodTitle.textContent = step.title;
    methodText.textContent = step.text;

    if (methodPhoto) {
      methodPhoto.style.backgroundImage = `url("${step.image}")`;
      methodPhoto.setAttribute("aria-label", step.imageLabel);
    }
  }

  methodSteps.slice(1).forEach(({ image }) => {
    const preload = new Image();
    preload.src = image;
  });

  previousStep?.addEventListener("click", () => {
    methodIndex = (methodIndex - 1 + methodSteps.length) % methodSteps.length;
    renderMethod();
  });

  nextStep?.addEventListener("click", () => {
    methodIndex = (methodIndex + 1) % methodSteps.length;
    renderMethod();
  });

  // Mantiene abierta una sola pregunta frecuente a la vez.
  const questions = document.querySelectorAll(".faq-list details");

  questions.forEach((question) => {
    question.addEventListener("toggle", () => {
      if (!question.open) return;

      questions.forEach((other) => {
        if (other !== question) other.open = false;
      });
    });
  });

  // Prepara el resumen y los enlaces de envío.
  const form = document.querySelector("#contact-form");
  const summary = document.querySelector("#summary-text");
  const copyButton = document.querySelector("#copy-summary");
  const copyStatus = document.querySelector("#copy-status");
  const whatsappLink = document.querySelector("#send-whatsapp");
  const emailLink = document.querySelector("#send-email");

  if (form && formResult && summary) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const field = (name) => String(data.get(name) ?? "").trim();

      summary.textContent = [
        "Consulta para Higieniza",
        `Nombre: ${field("nombre")}`,
        `Localidad: ${field("localidad")}`,
        `Espacio: ${field("espacio")}`,
        `Plaga: ${field("plaga")}`,
        `Situación: ${field("detalle")}`
      ].join("\n");

      const message = summary.textContent;

      if (whatsappLink) {
        whatsappLink.href =
          `https://wa.me/5492962401598?text=${encodeURIComponent(message)}`;
      }

      if (emailLink) {
        emailLink.href =
          `mailto:higieniza.control@gmail.com?subject=${encodeURIComponent("Consulta para Higieniza")}&body=${encodeURIComponent(message)}`;
      }

      formResult.hidden = false;
      if (copyStatus) copyStatus.textContent = "";
      scrollToElement(formResult);
    });

    form.addEventListener("input", () => {
      formResult.hidden = true;
      if (copyStatus) copyStatus.textContent = "";
    });
  }

  if (copyButton && summary && copyStatus) {
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(summary.textContent);
        copyStatus.textContent = "Resumen copiado.";
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();

        range.selectNodeContents(summary);
        selection.removeAllRanges();
        selection.addRange(range);

        copyStatus.textContent =
          "Texto seleccionado. Copialo desde el navegador.";
      }
    });
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
});
  // Revela los bloques cuando entran en pantalla.
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealTargets = document.querySelectorAll([
      ".feature",
      ".services-heading",
      ".service-card",
      ".why-image-panel",
      ".why-green-panel",
      ".spaces-heading",
      ".space-card",
      ".method-section .section-heading",
      ".method-photo",
      ".method-card",
      ".method-note",
      ".faq-layout > div",
      ".cta-inner > *",
      ".contact-layout > *",
      ".footer-main"
    ].join(","));

    // Separa un poco la aparición de las tarjetas.
    document.querySelectorAll(
      ".feature-grid, .service-grid, .spaces-list"
    ).forEach((group) => {
      Array.from(group.children).forEach((item, index) => {
        const delay = Math.min(index * 70, 350);
        item.style.setProperty("--reveal-delay", `${delay}ms`);
      });
    });

    if (revealTargets.length) {
      revealTargets.forEach((element) => {
        element.classList.add("scroll-reveal");
      });

      document.documentElement.classList.add("scroll-reveal-enabled");

      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("scroll-reveal-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -35px 0px"
        }
      );

      revealTargets.forEach((element) => {
        revealObserver.observe(element);
      });
    }
  }
