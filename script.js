// Higieniza: navegación, método, formulario Formspree y animaciones suaves.
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

  // Elegir una plaga en las tarjetas completa el selector del formulario.
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
        if (!exists) pestSelect.add(new Option(pest, pest));
        pestSelect.value = pest;
      }

      if (formResult) {
        formResult.hidden = true;
        formResult.classList.remove("is-error");
      }
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

  // Deja abierta una sola pregunta frecuente.
  const questions = document.querySelectorAll(".faq-list details");
  questions.forEach((question) => {
    question.addEventListener("toggle", () => {
      if (!question.open) return;
      questions.forEach((other) => {
        if (other !== question) other.open = false;
      });
    });
  });

  // Envío real a Formspree sin salir de la página.
  const form = document.querySelector("#contact-form");
  const resultTitle = document.querySelector("#form-result-title");
  const resultMessage = document.querySelector("#form-result-message");
  const submitButton = form?.querySelector('[type="submit"]');

  if (form && formResult && resultTitle && resultMessage && submitButton) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const endpoint = form.getAttribute("action")?.trim() || "";
      if (!endpoint || endpoint.includes("REEMPLAZAR_CON_ID")) {
        formResult.hidden = false;
        formResult.classList.add("is-error");
        resultTitle.textContent = "El formulario todavía no está configurado";
        resultMessage.textContent =
          "Escribinos por WhatsApp mientras terminamos de configurar el formulario.";
        scrollToElement(formResult);
        return;
      }

      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
      submitButton.dataset.originalText = submitButton.textContent.trim();
      submitButton.textContent = "Enviando consulta…";
      formResult.hidden = true;
      formResult.classList.remove("is-error");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });

        if (!response.ok) {
          let detail = "";
          try {
            const errorData = await response.json();
            detail = Array.isArray(errorData.errors)
              ? errorData.errors.map((item) => item.message).join(" ")
              : "";
          } catch {
            // El servidor puede responder sin un cuerpo JSON.
          }
          throw new Error(detail || "No se pudo enviar la consulta.");
        }

        form.reset();
        resultTitle.textContent = "Consulta enviada";
        resultMessage.textContent =
          "Gracias por escribirnos. Recibimos tu consulta y nos comunicaremos con vos.";
        formResult.hidden = false;
        scrollToElement(formResult);
      } catch (error) {
        formResult.classList.add("is-error");
        resultTitle.textContent = "No pudimos enviar la consulta";
        resultMessage.textContent =
          "Revisá tu conexión e intentá de nuevo. Si continúa el problema, escribinos por WhatsApp.";
        formResult.hidden = false;
        scrollToElement(formResult);
      } finally {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
        submitButton.innerHTML = 'Enviar consulta <span aria-hidden="true">↗</span>';
      }
    });

    form.addEventListener("input", () => {
      if (formResult.classList.contains("is-error")) {
        formResult.hidden = true;
        formResult.classList.remove("is-error");
      }
    });
  }

  // Revela secciones con suavidad al entrar en pantalla.
  const revealSelectors = [
    ".feature",
    ".services-heading",
    ".service-card",
    ".why-image-panel",
    ".why-green-panel",
    ".spaces-heading",
    ".space-card",
    ".spaces-note",
    ".method-section .section-heading",
    ".method-photo",
    ".method-card",
    ".method-note",
    ".faq-layout > *",
    ".cta-inner > *",
    ".contact-layout > *",
    ".footer-main"
  ];
  const revealElements = new Set();
  revealSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => revealElements.add(element));
  });

  const staggerGroups = [".feature-grid", ".service-grid", ".spaces-list"];
  staggerGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((group) => {
      Array.from(group.children).forEach((element, index) => {
        element.style.setProperty("--reveal-delay", `${Math.min(index * 75, 350)}ms`);
      });
    });
  });

  if (!prefersReducedMotion.matches && "IntersectionObserver" in window) {
    revealElements.forEach((element) => element.classList.add("scroll-reveal"));
    document.documentElement.classList.add("has-scroll-reveal");

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("scroll-reveal-visible");
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    });

    revealElements.forEach((element) => observer.observe(element));
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
});
