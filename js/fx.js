/* =========================================================
   Efectos compartidos: explosión de corazones, pétalos,
   estrellas y corazones flotantes.
   ========================================================= */
(function () {
  const HEART_D = "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";
  const heartPath = new Path2D(HEART_D);
  const COLORES = ["#ff5c9a", "#ff8fb8", "#ffb3cf", "#f0397d", "#ffffff", "#ffd1e1"];

  const cv = document.getElementById("cv-fx");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  let piezas = [];
  let corriendo = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function loop() {
    ctx.clearRect(0, 0, W, H);
    piezas = piezas.filter(p => p.vida > 0);
    for (const p of piezas) {
      p.vx *= p.roce; p.vy = p.vy * p.roce + p.grav;
      p.x += p.vx; p.y += p.vy;
      p.rot += p.vr;
      p.vida -= 1;
      const a = Math.min(1, p.vida / 40);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const s = p.tam / 24;
      ctx.scale(s, s);
      ctx.translate(-12, -12);
      ctx.fillStyle = p.color;
      if (p.tipo === "corazon") ctx.fill(heartPath);
      else { ctx.beginPath(); ctx.arc(12, 12, 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (piezas.length) requestAnimationFrame(loop);
    else { corriendo = false; ctx.clearRect(0, 0, W, H); }
  }

  /** Explosión de corazones desde (x, y). */
  function explosion(x, y, cantidad = 70, fuerza = 1) {
    const max = W < 700 ? cantidad * .7 : cantidad;
    for (let i = 0; i < max; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = (3 + Math.random() * 9) * fuerza;
      piezas.push({
        x, y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel - 3 * fuerza,
        grav: .18, roce: .975,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .2,
        tam: 10 + Math.random() * 22,
        color: COLORES[(Math.random() * COLORES.length) | 0],
        tipo: Math.random() < .85 ? "corazon" : "punto",
        vida: 90 + Math.random() * 80
      });
    }
    if (!corriendo) { corriendo = true; requestAnimationFrame(loop); }
  }

  /** Lluvia de corazones desde arriba. */
  function lluvia(cantidad = 80) {
    for (let i = 0; i < cantidad; i++) {
      piezas.push({
        x: Math.random() * W, y: -40 - Math.random() * H * .8,
        vx: (Math.random() - .5) * 1.5, vy: 2 + Math.random() * 3,
        grav: .03, roce: .995,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .08,
        tam: 12 + Math.random() * 20,
        color: COLORES[(Math.random() * COLORES.length) | 0],
        tipo: "corazon",
        vida: 260 + Math.random() * 120
      });
    }
    if (!corriendo) { corriendo = true; requestAnimationFrame(loop); }
  }

  /** Pétalos cayendo con CSS dentro de un contenedor. */
  function petalos(contenedor, n) {
    if (!contenedor || contenedor.childElementCount) return;
    const cant = window.innerWidth < 700 ? Math.round(n * .65) : n;
    for (let i = 0; i < cant; i++) {
      const el = document.createElement("i");
      el.className = "petalo";
      el.style.left = Math.random() * 100 + "%";
      el.style.setProperty("--t", 10 + Math.random() * 14 + "px");
      el.style.setProperty("--d", 9 + Math.random() * 10 + "s");
      el.style.setProperty("--del", -Math.random() * 18 + "s");
      el.style.setProperty("--x", (Math.random() - .5) * 140 + "px");
      el.style.opacity = .45 + Math.random() * .5;
      contenedor.appendChild(el);
    }
  }

  /** Estrellas titilantes con CSS. */
  function estrellas(contenedor, n) {
    if (!contenedor || contenedor.childElementCount) return;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("i");
      el.style.left = Math.random() * 100 + "%";
      el.style.top = Math.random() * 100 + "%";
      const t = Math.random() < .85 ? 1 + Math.random() * 1.5 : 2.5 + Math.random();
      el.style.width = el.style.height = t + "px";
      el.style.setProperty("--d", 2 + Math.random() * 4 + "s");
      el.style.setProperty("--del", -Math.random() * 5 + "s");
      el.style.setProperty("--o", .5 + Math.random() * .5);
      if (Math.random() < .2) el.style.background = "#ffb3cf";
      contenedor.appendChild(el);
    }
  }

  /** Corazones (icono SVG) subiendo. */
  function corazonesFlotantes(contenedor, n) {
    if (!contenedor || contenedor.childElementCount) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("viewBox", "0 0 24 24");
      s.innerHTML = '<path d="' + HEART_D + '"/>';
      const t = 14 + Math.random() * 30;
      s.style.width = s.style.height = t + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.setProperty("--d", 10 + Math.random() * 12 + "s");
      s.style.setProperty("--del", -Math.random() * 20 + "s");
      s.style.setProperty("--x", (Math.random() - .5) * 120 + "px");
      s.style.setProperty("--o", .15 + Math.random() * .35);
      contenedor.appendChild(s);
    }
  }

  window.FX = { explosion, lluvia, petalos, estrellas, corazonesFlotantes, HEART_D };
})();
