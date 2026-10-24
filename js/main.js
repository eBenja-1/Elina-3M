/* =========================================================
   Flujo principal: escenas, navegación, música e interacciones
   ========================================================= */
(function () {
  const C = window.CONFIG;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  document.querySelectorAll("[data-ella]").forEach(e => { e.textContent = C.ella; });
  document.title = "Para " + C.ella;

  /* ---------------- Escenas ---------------- */
  const escenas = $$(".escena");
  const CLARAS = ["e-contador", "e-rosas", "e-carta"];
  let actual = 0;
  const hooks = {};

  const nav = $("#navegacion");
  const btnAnt = $("#btnAnterior");
  const btnSig = $("#btnSiguiente");
  const puntos = $("#puntos");

  escenas.slice(1).forEach((esc, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", "Ir a la parte " + (i + 1));
    b.addEventListener("click", () => ir(i + 1));
    puntos.appendChild(b);
  });

  function ir(i) {
    if (i === actual || i < 1 || i >= escenas.length) return;
    const vieja = escenas[actual];
    const nueva = escenas[i];
    vieja.classList.remove("activa");
    hooks[vieja.id]?.salir?.();
    actual = i;
    nueva.classList.add("activa");
    hooks[nueva.id]?.entrar?.();
    actualizarNav();
  }

  function actualizarNav() {
    const esc = escenas[actual];
    nav.hidden = actual === 0;
    nav.classList.toggle("clara", CLARAS.includes(esc.id));
    document.body.classList.toggle("tema-claro", CLARAS.includes(esc.id));
    btnAnt.disabled = actual <= 1;
    btnSig.disabled = esc.dataset.navNext === "false" || actual === escenas.length - 1;
    btnSig.classList.remove("llamar");
    [...puntos.children].forEach((p, k) => p.classList.toggle("activo", k === actual - 1));
  }

  btnAnt.addEventListener("click", () => ir(actual - 1));
  btnSig.addEventListener("click", () => ir(actual + 1));
  document.addEventListener("keydown", e => {
    if (actual === 0) return;
    if (!$("#cartaModal").hidden || !$("#lightbox").hidden) {
      if (e.key === "Escape") { cerrarCarta(); cerrarLightbox(); }
      return;
    }
    if (e.key === "ArrowRight" && !btnSig.disabled) ir(actual + 1);
    if (e.key === "ArrowLeft" && !btnAnt.disabled) ir(actual - 1);
  });

  /** Helper: arranca un canvas al entrar y lo frena cuando ya no se ve. */
  function conCanvas(id, motor, extra = {}) {
    let timer;
    hooks[id] = {
      entrar() { clearTimeout(timer); motor().iniciar(); extra.entrar?.(); },
      salir() { extra.salir?.(); timer = setTimeout(() => motor().detener(), 1300); }
    };
  }

  /* ---------------- Música ---------------- */
  const audio = $("#musica");
  const btnMusica = $("#btnMusica");
  let musicaDisponible = false;
  audio.src = C.cancion;
  audio.volume = 0;
  audio.addEventListener("canplay", () => { musicaDisponible = true; }, { once: true });
  audio.addEventListener("error", () => { musicaDisponible = false; btnMusica.hidden = true; });

  function sonar() {
    if (!musicaDisponible && audio.readyState === 0) return;
    audio.play().then(() => {
      btnMusica.hidden = false;
      btnMusica.classList.remove("pausada");
      let v = 0;
      const fade = setInterval(() => { v = Math.min(.8, v + .04); audio.volume = v; if (v >= .8) clearInterval(fade); }, 120);
    }).catch(() => { btnMusica.hidden = false; btnMusica.classList.add("pausada"); });
  }
  btnMusica.addEventListener("click", () => {
    if (audio.paused) { audio.volume = .8; audio.play(); btnMusica.classList.remove("pausada"); }
    else { audio.pause(); btnMusica.classList.add("pausada"); }
  });

  /* ---------------- 0. Candado ---------------- */
  FX.estrellas($("#e-candado .estrellas-css"), 90);
  FX.estrellas($("#e-pregunta .estrellas-css"), 70);
  let pin = "";
  const pinPuntos = $("#pinPuntos");
  const pinMsg = $("#pinMensaje");
  let bloqueado = false;

  function tecla(k) {
    if (bloqueado) return;
    if (k === "del") pin = pin.slice(0, -1);
    else if (pin.length < 4) pin += k;
    [...pinPuntos.children].forEach((p, i) => p.classList.toggle("lleno", i < pin.length));
    pinPuntos.classList.remove("error");
    pinMsg.classList.remove("error");
    if (pin.length === 4) setTimeout(verificar, 180);
  }

  function verificar() {
    if (pin === C.pin) {
      bloqueado = true;
      pinPuntos.classList.add("ok");
      pinMsg.textContent = "Bienvenida, mi amor";
      const icono = $("#candadoIcono");
      icono.classList.add("abierto");
      sonar();
      const r = icono.getBoundingClientRect();
      setTimeout(() => FX.explosion(r.left + r.width / 2, r.top + r.height / 2, 90, 1.1), 250);
      setTimeout(() => ir(1), 1500);
    } else {
      pinPuntos.classList.add("error");
      pinMsg.classList.add("error");
      pinMsg.textContent = "Ese no es, mi amor. Probá de nuevo";
      if (navigator.vibrate) navigator.vibrate(120);
      pin = "";
      setTimeout(() => [...pinPuntos.children].forEach(p => p.classList.remove("lleno")), 400);
    }
  }

  $("#teclado").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) tecla(b.dataset.k);
  });
  document.addEventListener("keydown", e => {
    if (actual !== 0) return;
    if (/^[0-9]$/.test(e.key)) tecla(e.key);
    if (e.key === "Backspace") tecla("del");
    const b = $(`#teclado [data-k="${/^[0-9]$/.test(e.key) ? e.key : e.key === "Backspace" ? "del" : "x"}"]`);
    if (b) { b.classList.add("pulsada"); setTimeout(() => b.classList.remove("pulsada"), 150); }
  });

  /* ---------------- 1. Intro con partículas ---------------- */
  let tp;
  const motorTexto = () => tp || (tp = TextoParticulas($("#cv-texto")));
  let frase = 0, timerFrase;
  const hintIntro = $("#hintIntro");

  function siguienteFrase() {
    clearTimeout(timerFrase);
    if (frase >= C.frases.length - 1) return;
    frase++;
    motorTexto().explotar();
    setTimeout(() => motorTexto().objetivo(C.frases[frase]), 120);
    if (frase === C.frases.length - 1) {
      btnSig.classList.add("llamar");
      hintIntro.innerHTML = '<svg class="ico"><use href="#i-next"/></svg> Seguí con la flecha';
    } else timerFrase = setTimeout(siguienteFrase, 3200);
  }

  conCanvas("e-intro", motorTexto, {
    entrar() {
      frase = 0;
      hintIntro.innerHTML = '<svg class="ico"><use href="#i-tap"/></svg> Tocá la pantalla';
      document.fonts.ready.then(() => {
        motorTexto().objetivo(C.frases[0]);
        timerFrase = setTimeout(siguienteFrase, 3400);
      });
    },
    salir() { clearTimeout(timerFrase); }
  });
  $("#cv-texto").addEventListener("click", () => siguienteFrase());

  /* ---------------- 2. Galaxia ---------------- */
  let gx;
  conCanvas("e-galaxia", () => gx || (gx = Galaxia($("#cv-galaxia"), C.palabrasGalaxia, C.fotos)));

  /* ---------------- 3. Luna ---------------- */
  let oc;
  conCanvas("e-luna", () => oc || (oc = Oceano($("#cv-luna"), $("#luna"))));

  /* ---------------- 4. Contador ---------------- */
  FX.corazonesFlotantes($("#e-contador .corazones-flotan"), 18);
  const inicio = new Date(C.inicio);
  let timerContador;

  function sumarMeses(d, n) {
    const r = new Date(d);
    const dia = r.getDate();
    r.setDate(1);
    r.setMonth(r.getMonth() + n);
    const ultimo = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(dia, ultimo));
    return r;
  }

  function poner(id, v) {
    const e = document.getElementById(id);
    const s = String(v);
    if (e.textContent !== s) {
      e.textContent = s;
      e.classList.remove("tick"); void e.offsetWidth; e.classList.add("tick");
    }
  }

  function actualizarContador() {
    const ahora = new Date();
    let meses = (ahora.getFullYear() - inicio.getFullYear()) * 12 + ahora.getMonth() - inicio.getMonth();
    let ancla = sumarMeses(inicio, meses);
    if (ancla > ahora) { meses--; ancla = sumarMeses(inicio, meses); }
    let resto = Math.max(0, ahora - ancla) / 1000;
    const dias = Math.floor(resto / 86400); resto -= dias * 86400;
    const horas = Math.floor(resto / 3600); resto -= horas * 3600;
    const min = Math.floor(resto / 60);
    const seg = Math.floor(resto - min * 60);
    poner("cMeses", meses); poner("cDias", dias); poner("cHoras", horas); poner("cMin", min); poner("cSeg", seg);
    $("#cMesesGrande").textContent = meses;
    const totalSeg = Math.max(0, (ahora - inicio) / 1000);
    $("#cTotalDias").textContent = Math.floor(totalSeg / 86400).toLocaleString("es-AR");
    $("#cTotalHoras").textContent = Math.floor(totalSeg / 3600).toLocaleString("es-AR");
    $("#cTotalLatidos").textContent = Math.floor(totalSeg * 1.2).toLocaleString("es-AR");
  }
  hooks["e-contador"] = {
    entrar() { actualizarContador(); timerContador = setInterval(actualizarContador, 1000); },
    salir() { setTimeout(() => clearInterval(timerContador), 1200); }
  };

  /* ---------------- 5. Fotos (carrusel 3D) ---------------- */
  const carrusel = $("#carrusel");
  const carruselEscena = $("#carruselEscena");
  let rot = 0, radio = 300, rafCarrusel = 0, arrastrando = false, movido = 0, lastX = 0, velRot = 0;

  function fotoEn(contenedor, src) {
    contenedor.innerHTML = '<svg class="ico"><use href="#i-camera"/></svg>';
    const img = new Image();
    img.alt = "";
    img.onload = () => contenedor.appendChild(img);
    img.src = src;
  }

  C.fotos.forEach((f, i) => {
    const fig = document.createElement("figure");
    fig.className = "polaroid";
    fig.dataset.i = i;
    fig.innerHTML = '<div class="polaroid-foto"></div><div class="pie"></div>';
    fotoEn(fig.firstChild, f.src);
    fig.lastChild.textContent = f.texto || "\u00a0";
    carrusel.appendChild(fig);
  });

  function colocarFotos() {
    const n = C.fotos.length;
    const ancho = carrusel.offsetWidth || 220;
    radio = Math.round((ancho / 2) / Math.tan(Math.PI / n) * 1.12 + 16);
    [...carrusel.children].forEach((f, i) => {
      f.style.transform = `rotateY(${(360 / n) * i}deg) translateZ(${radio}px)`;
    });
  }
  function girar() {
    rafCarrusel = requestAnimationFrame(girar);
    if (!arrastrando) { velRot *= .94; rot += velRot + .12; }
    carrusel.style.transform = `translateZ(${-radio}px) rotateX(-7deg) rotateY(${rot}deg)`;
  }
  carruselEscena.addEventListener("pointerdown", e => {
    arrastrando = true; movido = 0; lastX = e.clientX; velRot = 0;
  });
  window.addEventListener("pointermove", e => {
    if (!arrastrando) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    movido += Math.abs(dx);
    velRot = dx * .35; rot += velRot;
  });
  window.addEventListener("pointerup", e => {
    if (!arrastrando) return;
    arrastrando = false;
    if (movido < 8) {
      const fig = e.target.closest?.(".polaroid");
      if (fig && carrusel.contains(fig)) abrirLightbox(+fig.dataset.i);
    }
  });

  const lightbox = $("#lightbox");
  function abrirLightbox(i) {
    fotoEn($("#lightboxFoto"), C.fotos[i].src);
    $("#lightboxTexto").textContent = C.fotos[i].texto;
    lightbox.hidden = false;
    document.body.classList.add("modal");
  }
  function cerrarLightbox() { lightbox.hidden = true; document.body.classList.remove("modal"); }
  $("#lightboxCerrar").addEventListener("click", cerrarLightbox);
  lightbox.addEventListener("click", e => { if (e.target === lightbox) cerrarLightbox(); });

  hooks["e-fotos"] = {
    entrar() { colocarFotos(); cancelAnimationFrame(rafCarrusel); girar(); },
    salir() { cerrarLightbox(); setTimeout(() => { if (escenas[actual].id !== "e-fotos") cancelAnimationFrame(rafCarrusel); }, 1300); }
  };
  window.addEventListener("resize", () => { if (escenas[actual].id === "e-fotos") colocarFotos(); });

  /* ---------------- 6. Rosas ---------------- */
  hooks["e-rosas"] = {
    entrar() { construirRamo($("#ramo")); FX.petalos($("#e-rosas .petalos"), 22); }
  };

  /* ---------------- 7. Carta ---------------- */
  const sobre = $("#sobre");
  const cartaModal = $("#cartaModal");
  const carta = $("#carta");
  let escribiendo = null;

  hooks["e-carta"] = {
    entrar() { FX.petalos($("#e-carta .petalos"), 26); },
    salir() { cerrarCarta(); }
  };

  sobre.addEventListener("click", () => {
    if (sobre.classList.contains("abierto")) { abrirCarta(false); return; }
    sobre.classList.add("abierto");
    $("#hintSobre").style.visibility = "hidden";
    const r = sobre.getBoundingClientRect();
    setTimeout(() => FX.explosion(r.left + r.width / 2, r.top + r.height * .55, 50, .8), 300);
    setTimeout(() => abrirCarta(true), 1700);
  });

  function abrirCarta(animar) {
    cartaModal.hidden = false;
    document.body.classList.add("modal");
    if (animar && !carta.classList.contains("terminada")) escribirCarta();
  }
  function cerrarCarta() { cartaModal.hidden = true; document.body.classList.remove("modal"); }
  $("#cartaCerrar").addEventListener("click", e => { e.stopPropagation(); cerrarCarta(); });
  cartaModal.addEventListener("click", e => { if (e.target === cartaModal) cerrarCarta(); });
  carta.addEventListener("click", () => escribiendo?.saltar());

  /** "hola **mundo**" -> [{t:"hola ", b:false}, {t:"mundo", b:true}] */
  function segmentos(txt) {
    return txt.split("**").map((t, i) => ({ t, b: i % 2 === 1 })).filter(x => x.t);
  }

  function pintar(el, segs, n) {
    el.textContent = "";
    for (const sg of segs) {
      if (n <= 0) break;
      const trozo = sg.t.slice(0, n);
      n -= trozo.length;
      if (sg.b) { const st = document.createElement("strong"); st.textContent = trozo; el.appendChild(st); }
      else el.appendChild(document.createTextNode(trozo));
    }
  }

  function escribirCarta() {
    const cuerpo = $("#cartaCuerpo");
    cuerpo.innerHTML = "";
    const tareas = [{ el: $("#cartaSaludo"), txt: C.carta.saludo }];
    [...C.carta.parrafos, C.carta.despedida].filter(Boolean).forEach(p => {
      const el = document.createElement("p");
      cuerpo.appendChild(el);
      tareas.push({ el, txt: p });
    });
    tareas.push({ el: $("#cartaFirma"), txt: C.carta.firma });
    tareas.forEach(t => {
      t.segs = segmentos(t.txt);
      t.plano = t.segs.map(x => x.t).join("");
      t.el.textContent = "";
    });

    const cursor = document.createElement("span");
    cursor.className = "cursor";
    const scroll = $("#cartaScroll");
    let ti = 0, ci = 0, timer, fin = false;

    function paso() {
      if (fin) return;
      const t = tareas[ti];
      if (!t) return terminar();
      // si ella subió a releer, no la movemos
      const abajo = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 90;
      ci++;
      pintar(t.el, t.segs, ci);
      t.el.appendChild(cursor);
      if (abajo) scroll.scrollTop = scroll.scrollHeight;
      const ch = t.plano[ci - 1];
      let espera = 14 + Math.random() * 18;
      if (".!?".includes(ch)) espera = 260;
      else if (",;:".includes(ch)) espera = 110;
      if (ci >= t.plano.length) { ti++; ci = 0; espera = 450; }
      timer = setTimeout(paso, espera);
    }
    function terminar() {
      fin = true; clearTimeout(timer);
      tareas.forEach(t => pintar(t.el, t.segs, Infinity));
      cursor.remove();
      carta.classList.add("terminada");
      escribiendo = null;
    }
    escribiendo = { saltar: terminar };
    timer = setTimeout(paso, 700);
  }

  /* ---------------- 8. ¿Me amas? ---------------- */
  const btnSi = $("#btnSi");
  const btnNo = $("#btnNo");
  const TEXTOS_NO = ["No", "¿Segura?", "Pensalo bien", "Ni lo intentes", "Última chance", "Dale que sí", "No vas a poder", "Sí, pero al revés"];
  let escala = 1, intentos = 0;

  function resetPregunta() {
    escala = 1; intentos = 0;
    btnSi.style.setProperty("--s", 1);
    btnNo.classList.remove("escapando");
    btnNo.style.left = btnNo.style.top = "";
    btnNo.textContent = "No";
  }

  function escapar(e) {
    e.preventDefault();
    intentos++;
    escala = Math.min(escala + .32, 4);
    btnSi.style.setProperty("--s", escala);
    btnNo.textContent = TEXTOS_NO[Math.min(intentos, TEXTOS_NO.length - 1)];

    const W = window.innerWidth, H = window.innerHeight;
    if (!btnNo.classList.contains("escapando")) {
      const r0 = btnNo.getBoundingClientRect();
      btnNo.style.left = r0.left + "px"; btnNo.style.top = r0.top + "px";
      btnNo.classList.add("escapando");
      void btnNo.offsetWidth;
    }
    const rNo = btnNo.getBoundingClientRect();
    // tamaño final del Sí (aplica la escala nueva aunque la transición no terminó)
    const rSi0 = btnSi.getBoundingClientRect();
    const k = escala / (rSi0.width / btnSi.offsetWidth || 1);
    const cxSi = rSi0.left + rSi0.width / 2, cySi = rSi0.top + rSi0.height / 2;
    const wSi = rSi0.width * k / 2 + 16, hSi = rSi0.height * k / 2 + 16;

    let mejor = null;
    for (let i = 0; i < 30; i++) {
      const x = 16 + Math.random() * Math.max(0, W - rNo.width - 32);
      const y = 80 + Math.random() * Math.max(0, H - rNo.height - 190);
      const choca = x + rNo.width > cxSi - wSi && x < cxSi + wSi && y + rNo.height > cySi - hSi && y < cySi + hSi;
      const lejos = Math.hypot(x - rNo.left, y - rNo.top) > 90;
      if (!choca && lejos) { mejor = { x, y }; break; }
      if (!choca && !mejor) mejor = { x, y };
    }
    if (mejor) { btnNo.style.left = mejor.x + "px"; btnNo.style.top = mejor.y + "px"; }
  }

  btnNo.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") escapar(e); });
  btnNo.addEventListener("pointerdown", escapar);
  btnNo.addEventListener("click", e => { e.preventDefault(); if (e.detail === 0) escapar(e); });

  btnSi.addEventListener("click", () => {
    const r = btnSi.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    FX.explosion(x, y, 120, 1.4);
    setTimeout(() => FX.explosion(window.innerWidth * .25, window.innerHeight * .4, 60, 1), 250);
    setTimeout(() => FX.explosion(window.innerWidth * .75, window.innerHeight * .35, 60, 1), 450);
    setTimeout(() => ir(escenas.length - 1), 900);
  });

  hooks["e-pregunta"] = { entrar: resetPregunta, salir() { setTimeout(resetPregunta, 1000); } };

  /* ---------------- 9. Final ---------------- */
  hooks["e-final"] = {
    entrar() {
      FX.petalos($("#e-final .petalos"), 30);
      setTimeout(() => FX.lluvia(90), 600);
    }
  };
  $("#btnRepetir").addEventListener("click", () => ir(1));

  /* ---------------- Inicio ---------------- */
  actualizarNav();
})();
