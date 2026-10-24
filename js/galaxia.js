/* =========================================================
   Galaxia 3D con corazón de partículas, palabras y fotos
   (canvas 2D con proyección en perspectiva)
   ========================================================= */
(function () {
  function Galaxia(canvas, palabras, fotos) {
    const ctx = canvas.getContext("2d");
    let W, H, dpr, cx, cy, F;
    let raf = 0, activo = false;
    const movil = window.innerWidth < 700;

    const N_CORAZON = movil ? 2200 : 3800;
    const N_DISCO = movil ? 4200 : 8000;
    const N_POLVO = movil ? 500 : 900;

    // --- geometría (coordenadas mundo, y hacia arriba) ---
    const ESC = movil ? 10 : 8.5;
    const corazon = [];
    for (let i = 0; i < N_CORAZON; i++) {
      const t = Math.random() * Math.PI * 2;
      const borde = Math.random() < .55;
      const r = borde ? 1 - Math.random() * .04 : Math.sqrt(Math.random());
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const grosor = Math.sqrt(Math.max(0, 1 - r * r)) * 7 + .6;
      corazon.push({
        x: hx * r * ESC, y: hy * r * ESC + 150, z: (Math.random() - .5) * grosor * ESC,
        c: borde ? (Math.random() < .5 ? 0 : 1) : (Math.random() < .7 ? 1 : 2),
        s: Math.random() < .1 ? 2 : 1
      });
    }

    const disco = [];
    const BRAZOS = 3, RADIO = 420;
    for (let i = 0; i < N_DISCO; i++) {
      const rr = Math.pow(Math.random(), .7) * RADIO;
      const brazo = (i % BRAZOS) * (Math.PI * 2 / BRAZOS);
      const giro = rr * .012;
      const disp = (Math.random() - .5) * (1.1 - rr / RADIO * .6) * .9;
      const a = brazo + giro + disp;
      const n = rr / RADIO;
      disco.push({
        r: rr, a,
        y: (Math.random() - .5) * (18 * (1 - n) + 3),
        c: n < .15 ? 3 : n < .45 ? (Math.random() < .5 ? 0 : 4) : (Math.random() < .5 ? 5 : 1),
        s: Math.random() < .06 ? 2 : 1
      });
    }

    const polvo = [];
    for (let i = 0; i < N_POLVO; i++) {
      polvo.push({ x: (Math.random() - .5) * 2200, y: (Math.random() - .5) * 1400, z: (Math.random() - .5) * 2200, tw: Math.random() * 6.28 });
    }

    const COLORES = ["#ff5c9a", "#ff9cc4", "#ffffff", "#fff0f6", "#ff3d86", "#c26bff"];

    // palabras en anillos
    const textos = palabras.map((p, i) => ({
      txt: p,
      r: 230 + (i % 3) * 70 + Math.random() * 30,
      a: (i / palabras.length) * Math.PI * 2,
      y: 20 + Math.random() * 60
    }));

    // fotos en burbujas
    const burbujas = [];
    const enOrbita = fotos.slice(0, movil ? 6 : 9);
    enOrbita.forEach((f, i) => {
      const img = new Image();
      const b = { img, ok: false, r: 290 + (i % 3) * 50, a: i * (Math.PI * 2 / enOrbita.length) + .4, y: 70 + (i % 3) * 35 };
      img.onload = () => { b.ok = true; };
      img.src = f.src;
      burbujas.push(b);
    });

    // --- cámara ---
    let yawDrag = 0, pitch = .42, velYaw = 0;
    let arrastrando = false, lx = 0, ly = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, movil ? 1.6 : 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H * (W < H ? .58 : .6);
      F = Math.min(W * (W < H ? 1.25 : .9), H * 1.05);
    }

    const D = 1100;
    let sy, cyw, sp, cp; // senos/cosenos actuales

    function proyectar(x, y, z, yaw) {
      const s1 = Math.sin(yaw), c1 = Math.cos(yaw);
      const x1 = x * c1 - z * s1;
      const z1 = x * s1 + z * c1;
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      const k = F / (D + z2);
      return { x: cx + x1 * k, y: cy - y2 * k, k, z: z2 };
    }

    function frame(tms) {
      raf = requestAnimationFrame(frame);
      const t = tms * .001;
      if (!arrastrando) { velYaw *= .95; yawDrag += velYaw; }
      sp = Math.sin(pitch); cp = Math.cos(pitch);

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(10, 3, 14, .55)";
      ctx.fillRect(0, 0, W, H);

      // brillo central
      const nucleo = proyectar(0, 0, 0, 0);
      const gr = ctx.createRadialGradient(nucleo.x, nucleo.y, 0, nucleo.x, nucleo.y, 160 * nucleo.k);
      gr.addColorStop(0, "rgba(255,230,240,.55)");
      gr.addColorStop(.25, "rgba(255,92,154,.25)");
      gr.addColorStop(1, "rgba(255,92,154,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);

      // polvo estelar
      const yawPolvo = yawDrag * .3 + t * .01;
      for (const p of polvo) {
        const q = proyectar(p.x, p.y, p.z, yawPolvo);
        if (q.z < -D + 50) continue;
        ctx.globalAlpha = .25 + .35 * Math.abs(Math.sin(t * 1.5 + p.tw));
        ctx.fillStyle = "#ffe4ee";
        ctx.fillRect(q.x, q.y, 1.2, 1.2);
      }

      // disco de la galaxia
      const yawDisco = yawDrag + t * .12;
      for (const p of disco) {
        const a = p.a + t * (.25 * (1 - p.r / 520));
        const q = proyectar(Math.cos(a) * p.r, p.y, Math.sin(a) * p.r, yawDisco);
        const s = p.s * q.k * 1.6;
        ctx.globalAlpha = Math.min(1, .35 + q.k * .5);
        ctx.fillStyle = COLORES[p.c];
        ctx.fillRect(q.x, q.y, s, s);
      }

      // palabras y burbujas, ordenadas por profundidad
      const objetos = [];
      for (const w of textos) {
        const a = w.a + t * .18;
        const q = proyectar(Math.cos(a) * w.r, w.y + Math.sin(t + w.a) * 8, Math.sin(a) * w.r, yawDisco);
        objetos.push({ tipo: "t", q, w });
      }
      for (const b of burbujas) {
        if (!b.ok) continue;
        const a = b.a + t * .14;
        const q = proyectar(Math.cos(a) * b.r, b.y + Math.sin(t * .8 + b.a) * 12, Math.sin(a) * b.r, yawDisco);
        objetos.push({ tipo: "b", q, b });
      }

      // corazón (late y se balancea)
      const lat = 1 + Math.pow(Math.max(0, Math.sin(t * 3.2)), 8) * .08;
      const yawCor = Math.sin(t * .6) * .45 + yawDrag;
      for (const p of corazon) {
        const q = proyectar(p.x * lat, (p.y - 150) * lat + 150 + Math.sin(t) * 6, p.z * lat, yawCor);
        const s = p.s * q.k * 1.7;
        ctx.globalAlpha = .85;
        ctx.fillStyle = COLORES[p.c];
        ctx.fillRect(q.x, q.y, s, s);
      }
      // halo del corazón
      const hc = proyectar(0, 150 + Math.sin(t) * 6, 0, 0);
      const g2 = ctx.createRadialGradient(hc.x, hc.y, 0, hc.x, hc.y, 140 * hc.k);
      g2.addColorStop(0, "rgba(255,92,154,.22)");
      g2.addColorStop(1, "rgba(255,92,154,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "source-over";
      objetos.sort((a, b) => b.q.z - a.q.z);
      for (const o of objetos) {
        const prof = Math.max(.25, Math.min(1, (o.q.k - .6) * 2.2));
        if (o.tipo === "t") {
          const tam = Math.max(10, 17 * o.q.k * (movil ? 1.25 : 1.1));
          ctx.font = `500 ${tam}px "Outfit", sans-serif`;
          ctx.textAlign = "center";
          ctx.globalAlpha = prof;
          ctx.shadowColor = "#ff5c9a";
          ctx.shadowBlur = 12;
          ctx.fillStyle = "#ffe4ee";
          ctx.fillText(o.w.txt.toUpperCase(), o.q.x, o.q.y);
          ctx.shadowBlur = 0;
        } else {
          const r = 34 * o.q.k * (movil ? .9 : 1.1);
          ctx.globalAlpha = Math.max(.4, prof);
          ctx.save();
          ctx.shadowColor = "#ff5c9a"; ctx.shadowBlur = 24;
          ctx.beginPath(); ctx.arc(o.q.x, o.q.y, r + 3, 0, Math.PI * 2);
          ctx.fillStyle = "#ffe4ee"; ctx.fill();
          ctx.shadowBlur = 0;
          ctx.beginPath(); ctx.arc(o.q.x, o.q.y, r, 0, Math.PI * 2); ctx.clip();
          const img = o.b.img;
          const m = Math.min(img.naturalWidth, img.naturalHeight);
          ctx.drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, o.q.x - r, o.q.y - r, r * 2, r * 2);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    }

    canvas.addEventListener("pointerdown", e => {
      arrastrando = true; lx = e.clientX; ly = e.clientY; velYaw = 0;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", e => {
      if (!arrastrando) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      velYaw = dx * .006;
      yawDrag += velYaw;
      pitch = Math.max(.08, Math.min(1.1, pitch + dy * .004));
    });
    const soltar = () => { arrastrando = false; };
    canvas.addEventListener("pointerup", soltar);
    canvas.addEventListener("pointercancel", soltar);
    window.addEventListener("resize", () => { if (activo) resize(); });

    return {
      iniciar() {
        if (activo) return;
        activo = true; resize();
        raf = requestAnimationFrame(frame);
      },
      detener() { activo = false; cancelAnimationFrame(raf); }
    };
  }

  window.Galaxia = Galaxia;
})();
