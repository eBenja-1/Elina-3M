/* =========================================================
   Texto con partículas que se va transformando
   (frase -> frase -> corazón)
   ========================================================= */
(function () {
  const PALETA = ["#ff5c9a", "#ff8fb8", "#ffb3cf", "#ffffff", "#ff3d86", "#ffd1e1"];

  function TextoParticulas(canvas) {
    const ctx = canvas.getContext("2d");
    const off = document.createElement("canvas");
    const octx = off.getContext("2d", { willReadFrequently: true });
    let W, H, dpr, paso;
    let parts = [];
    let puntero = { x: -9999, y: -9999 };
    let raf = 0, activo = false;
    let ultimoObjetivo = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paso = W < 500 ? 3.4 : W < 1000 ? 4.5 : 5.5;
      if (ultimoObjetivo) objetivo(ultimoObjetivo);
    }

    function partirLineas(texto, maxAncho, fuente) {
      octx.font = fuente;
      const palabras = texto.split(" ");
      const lineas = [];
      let linea = "";
      for (const p of palabras) {
        const prueba = linea ? linea + " " + p : p;
        if (octx.measureText(prueba).width > maxAncho && linea) { lineas.push(linea); linea = p; }
        else linea = prueba;
      }
      lineas.push(linea);
      return lineas;
    }

    function muestrear() {
      const img = octx.getImageData(0, 0, W, H).data;
      const pts = [];
      for (let y = 0; y < H; y += paso) {
        for (let x = 0; x < W; x += paso) {
          if (img[((y | 0) * W + (x | 0)) * 4 + 3] > 140) pts.push({ x, y });
        }
      }
      return pts;
    }

    function puntosTexto(texto) {
      off.width = W; off.height = H;
      octx.clearRect(0, 0, W, H);
      const maxAncho = W * .86;
      let tam = Math.min(W * (W < 600 ? .16 : .11), H * .2, 150);
      let fuente, lineas;
      // reducir hasta que entre en máximo 2 líneas
      for (let i = 0; i < 20; i++) {
        fuente = `700 ${tam}px "Outfit", sans-serif`;
        lineas = partirLineas(texto, maxAncho, fuente);
        const anchoMax = Math.max(...lineas.map(l => octx.measureText(l).width));
        if (lineas.length <= 2 && anchoMax <= maxAncho) break;
        tam *= .9;
      }
      octx.font = fuente;
      octx.fillStyle = "#fff";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      const alto = tam * 1.15;
      const y0 = H * .46 - (alto * (lineas.length - 1)) / 2;
      lineas.forEach((l, i) => octx.fillText(l, W / 2, y0 + i * alto));
      return muestrear();
    }

    function puntosCorazon() {
      off.width = W; off.height = H;
      octx.clearRect(0, 0, W, H);
      const s = Math.min(W * .026, H * .019);
      octx.save();
      octx.translate(W / 2, H * .46);
      octx.beginPath();
      for (let t = 0; t <= Math.PI * 2 + .01; t += .02) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        t === 0 ? octx.moveTo(x * s, y * s) : octx.lineTo(x * s, y * s);
      }
      octx.fillStyle = "#fff";
      octx.fill();
      octx.restore();
      return muestrear();
    }

    function objetivo(texto) {
      ultimoObjetivo = texto;
      const pts = texto === "{corazon}" ? puntosCorazon() : puntosTexto(texto);
      // mezclar para que la transición sea orgánica
      for (let i = pts.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }
      while (parts.length < pts.length) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: 0, vy: 0, tx: 0, ty: 0,
          c: PALETA[(Math.random() * PALETA.length) | 0],
          r: Math.random() < .15 ? 1.6 : 1,
          libre: false, fase: Math.random() * 6.28
        });
      }
      parts.forEach((p, i) => {
        if (i < pts.length) {
          p.tx = pts[i].x + (Math.random() - .5) * paso * .5; p.ty = pts[i].y + (Math.random() - .5) * paso * .5; p.libre = false;
        } else {
          p.tx = Math.random() * W; p.ty = Math.random() * H; p.libre = true;
        }
      });
    }

    function explotar() {
      for (const p of parts) {
        const a = Math.random() * Math.PI * 2;
        const v = 4 + Math.random() * 14;
        p.vx += Math.cos(a) * v; p.vy += Math.sin(a) * v;
      }
    }

    function frame(t) {
      raf = requestAnimationFrame(frame);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(20, 6, 28, .28)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const tam = paso * .6;
      const latido = ultimoObjetivo === "{corazon}" ? 1 + Math.max(0, Math.sin(t * .006)) * .04 : 1;
      for (const p of parts) {
        let tx = p.tx, ty = p.ty;
        if (latido !== 1 && !p.libre) { tx = W / 2 + (tx - W / 2) * latido; ty = H * .46 + (ty - H * .46) * latido; }
        if (p.libre) { tx += Math.sin(t * .0005 + p.fase) * 30; ty += Math.cos(t * .0004 + p.fase) * 30; }
        p.vx += (tx - p.x) * (p.libre ? .002 : .045);
        p.vy += (ty - p.y) * (p.libre ? .002 : .045);
        const dx = p.x - puntero.x, dy = p.y - puntero.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 6400) {
          const f = (6400 - d2) / 6400 * 3;
          const d = Math.sqrt(d2) || 1;
          p.vx += dx / d * f; p.vy += dy / d * f;
        }
        p.vx *= .84; p.vy *= .84;
        p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.libre ? .25 : .95;
        const s = tam * p.r;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }

    function mover(e) {
      const r = canvas.getBoundingClientRect();
      puntero.x = e.clientX - r.left; puntero.y = e.clientY - r.top;
    }
    canvas.addEventListener("pointermove", mover);
    canvas.addEventListener("pointerdown", mover);
    canvas.addEventListener("pointerleave", () => { puntero.x = puntero.y = -9999; });
    canvas.addEventListener("pointerup", e => { if (e.pointerType !== "mouse") puntero.x = puntero.y = -9999; });
    window.addEventListener("resize", () => { if (activo) resize(); });

    return {
      iniciar() {
        if (activo) return;
        activo = true;
        resize();
        ctx.fillStyle = "#14061c"; ctx.fillRect(0, 0, W, H);
        raf = requestAnimationFrame(frame);
      },
      detener() { activo = false; cancelAnimationFrame(raf); },
      objetivo,
      explotar
    };
  }

  window.TextoParticulas = TextoParticulas;
})();
