/* ============================================================
   MAXIMILIANO FERNANDES ADVOCACIA — script.js
   1. Navbar sticky/glass ao rolar
   2. Menu mobile
   3. Scroll reveals (IntersectionObserver)
   4. Carrossel 3D das áreas de atuação
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --------------------- 1. Navbar --------------------- */
  const navbar = document.getElementById("navbar");
  const hero = document.querySelector(".hero");
  const heroImagem = document.querySelector(".hero__image");
  let alturaDoHero = hero ? hero.offsetHeight : 1;
  let quadroDeScroll = 0;

  const atualizarScroll = () => {
    quadroDeScroll = 0;
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    if (!heroImagem || reduzirMovimento) return;
    const progresso = Math.min(Math.max(window.scrollY / alturaDoHero, 0), 1);
    heroImagem.style.setProperty("--hero-shift", `${progresso * 36}px`);
  };
  const agendarScroll = () => {
    if (!quadroDeScroll) quadroDeScroll = requestAnimationFrame(atualizarScroll);
  };
  atualizarScroll();
  window.addEventListener("scroll", agendarScroll, { passive: true });

  /* --------------------- 2. Menu mobile --------------------- */
  const burger = document.getElementById("navBurger");
  const navMenu = document.getElementById("navMenu");
  burger.addEventListener("click", () => {
    const aberto = navbar.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(aberto));
  });
  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  /* Máscara para celular brasileiro com DDD. */
  const telefone = document.getElementById("telefone");
  if (telefone) {
    telefone.addEventListener("input", () => {
      const numeros = telefone.value.replace(/\D/g, "").slice(0, 11);
      let formatado = numeros;

      if (numeros.length > 2 && numeros.length <= 7) {
        formatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
      } else if (numeros.length > 7) {
        formatado = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
      }

      telefone.value = formatado;
    });
  }

  /* --------------------- 3. Scroll reveals --------------------- */
  const revelaveis = document.querySelectorAll(
    ".reveal, .reveal-section, .reveal-item"
  );
  revelaveis.forEach((elemento, indice) => {
    if (elemento.classList.contains("reveal-item")) {
      elemento.style.setProperty("--reveal-delay", `${(indice % 6) * 110}ms`);
    }
  });
  if ("IntersectionObserver" in window && !reduzirMovimento) {
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observer.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8%" }
    );
    revelaveis.forEach((el) => observer.observe(el));
  } else {
    revelaveis.forEach((el) => el.classList.add("is-visible"));
  }

  /* --------------------- 4. Carrossel 3D --------------------- */
  const track = document.getElementById("carouselTrack");
  const viewport = document.getElementById("carouselViewport");
  if (!track || !viewport) return;

  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  const paginacao = document.getElementById("carouselPagination");
  const botaoAnterior = document.querySelector(".carousel-prev");
  const botaoProximo = document.querySelector(".carousel-next");
  const totalDeSlides = slides.length;

  let indiceAtivo = 0;
  let posicaoAtual = 0;
  let arrastando = false;
  let inicioX = 0;
  let deslocamentoXAtual = 0;
  let larguraDoCard = 0;
  let temporizador;

  function medir() {
    larguraDoCard = slides[0].getBoundingClientRect().width;
  }

  function renderizar() {
    const espacamento = larguraDoCard + 28;

    slides.forEach((slide, indice) => {
      let distancia = indice - posicaoAtual;

      if (distancia > totalDeSlides / 2) distancia -= totalDeSlides;
      if (distancia < -totalDeSlides / 2) distancia += totalDeSlides;

      const x = distancia * espacamento;
      const z = -Math.abs(distancia) * 150;
      const rotacao = -distancia * 34;
      const escala = 1 - Math.min(Math.abs(distancia) * 0.09, 0.42);
      const desfoque = Math.min(Math.abs(distancia) * 2, 2);

      slide.style.transform = `
        translate3d(${x}px, -50%, ${z}px)
        rotateY(${rotacao}deg)
        scale(${escala})
      `;
      slide.style.filter = `blur(${desfoque}px)`;
      slide.style.zIndex = Math.round(1000 - Math.abs(distancia) * 10);
      slide.style.pointerEvents = Math.abs(distancia) < 0.5 ? "auto" : "none";

      /* parallax interno */
      const parallaxX = Math.max(-1, Math.min(1, -distancia)) * 48;
      const titulo = slide.querySelector(".card-title");
      const lista = slide.querySelector(".card-list");
      if (titulo) titulo.style.transform = `translate3d(${parallaxX * 0.35}px, 0, 0)`;
      if (lista) lista.style.transform = `translate3d(${parallaxX * 0.25}px, 0, 0)`;
    });

    atualizarPaginacao();
  }

  function atualizarPaginacao() {
    const pontos = paginacao.querySelectorAll("button");
    pontos.forEach((ponto, indice) => {
      ponto.setAttribute("aria-current", String(indice === indiceAtivo));
    });
  }

  function irPara(novoIndice) {
    const inicio = posicaoAtual;
    const fim = novoIndice;
    const duracao = reduzirMovimento ? 1 : 1200;
    const inicioTempo = performance.now();

    function animar(tempoAtual) {
      const progressoBruto = Math.min((tempoAtual - inicioTempo) / duracao, 1);
      const progresso = 1 - Math.pow(1 - progressoBruto, 4);

      posicaoAtual = inicio + (fim - inicio) * progresso;
      renderizar();

      if (progressoBruto < 1) {
        requestAnimationFrame(animar);
      } else {
        indiceAtivo = novoIndice;
        posicaoAtual = novoIndice;
        renderizar();
      }
    }

    requestAnimationFrame(animar);
  }

  function proximo() {
    irPara((indiceAtivo + 1) % totalDeSlides);
  }
  function anterior() {
    irPara((indiceAtivo - 1 + totalDeSlides) % totalDeSlides);
  }

  /* Paginação dinâmica */
  slides.forEach((slide, indice) => {
    const ponto = document.createElement("button");
    ponto.type = "button";
    ponto.setAttribute("aria-label", `Ir para o slide ${indice + 1}`);
    ponto.addEventListener("click", () => irPara(indice));
    paginacao.appendChild(ponto);
  });

  botaoAnterior.addEventListener("click", anterior);
  botaoProximo.addEventListener("click", proximo);

  document.addEventListener("keydown", (evento) => {
    if (!isCarouselInView()) return;
    if (evento.key === "ArrowLeft") anterior();
    if (evento.key === "ArrowRight") proximo();
  });

  function isCarouselInView() {
    const rect = viewport.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  /* Arraste (mouse + touch via Pointer Events) */
  viewport.addEventListener("pointerdown", (evento) => {
    arrastando = true;
    inicioX = evento.clientX;
    deslocamentoXAtual = 0;
    viewport.setPointerCapture(evento.pointerId);
    clearInterval(temporizador);
  });

  viewport.addEventListener("pointermove", (evento) => {
    if (!arrastando) return;
    deslocamentoXAtual = evento.clientX - inicioX;
    const espacamento = larguraDoCard + 28;
    posicaoAtual = indiceAtivo - deslocamentoXAtual / espacamento;
    renderizar();
  });

  function finalizarArraste(evento) {
    if (!arrastando) return;
    arrastando = false;

    if (deslocamentoXAtual < -80) {
      proximo();
    } else if (deslocamentoXAtual > 80) {
      anterior();
    } else {
      irPara(indiceAtivo);
    }
    iniciarAutoplay();
  }

  viewport.addEventListener("pointerup", finalizarArraste);
  viewport.addEventListener("pointercancel", finalizarArraste);

  /* Autoplay */
  function iniciarAutoplay() {
    clearInterval(temporizador);
    if (reduzirMovimento) return;
    temporizador = setInterval(() => {
      if (!arrastando) proximo();
    }, 4500);
  }

  viewport.addEventListener("mouseenter", () => clearInterval(temporizador));
  viewport.addEventListener("mouseleave", iniciarAutoplay);

  /* Inicialização */
  window.addEventListener("resize", () => {
    alturaDoHero = hero ? hero.offsetHeight : 1;
    medir();
    renderizar();
  });

  medir();
  renderizar();
  iniciarAutoplay();

  /* Ano do rodapé */
  const anoEl = document.getElementById("ano");
  if (anoEl) anoEl.textContent = new Date().getFullYear();
});