/* =========================================================
   Cielo estrellado + océano con reflejo de la luna
   ========================================================= */
(function () {
  function Oceano(canvas, lunaEl) {
    const ctx = canvas.getContext("2d");
    let W, H, dpr, horizonte;
    let raf = 0, activo = false;
    let estrellas = [], fugaces = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      horizonte = H * .7;
      const n = Math.round(W * H / 2600);
      estrellas = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * horizonte * .95,
        r: Math.random() < .9 ? Math.random() * 1.1 + .3 : Math.random() * 1.2 + 1.2,
        f: Math.random() * 6.28, v: .5 + Math.random() * 2,
        rosa: Math.random() < .25
      }));
    }

    function luna() {
      const r = lunaEl.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      return { x: r.left - c.left + r.width / 2, r: r.width / 2 };
    }

    function frame(tms) {
      raf = requestAnimationFrame(frame);
      const t = tms * .001;
      ctx.clearRect(0, 0, W, H);

      // estrellas
      for (const s of estrellas) {
        const a = .35 + .65 * Math.abs(Math.sin(t * s.v + s.f));
        ctx.globalAlpha = a;
        ctx.fillStyle = s.rosa ? "#ffc2d9" : "#ffffff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }

      // estrellas fugaces
      if (Math.random() < .006 && fugaces.length < 2) {
        fugaces.push({ x: Math.random() * W * .8 + W * .2, y: Math.random() * horizonte * .4, v: 9 + Math.random() * 6, vida: 1 });
      }
      fugaces = fugaces.filter(f => f.vida > 0);
      for (const f of fugaces) {
        f.x -= f.v; f.y += f.v * .45; f.vida -= .018;
        const g = ctx.createLinearGradient(f.x, f.y, f.x + 120, f.y - 54);
        g.addColorStop(0, `rgba(255,240,246,${f.vida})`);
        g.addColorStop(1, "rgba(255,240,246,0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = g; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + 120, f.y - 54); ctx.stroke();
      }

      // resplandor en el horizonte
      ctx.globalAlpha = 1;
      const gh = ctx.createLinearGradient(0, horizonte - 80, 0, horizonte + 10);
      gh.addColorStop(0, "rgba(255,92,154,0)");
      gh.addColorStop(1, "rgba(255,120,170,.28)");
      ctx.fillStyle = gh;
      ctx.fillRect(0, horizonte - 80, W, 90);

      // océano: capas de olas
      const capas = [
        { y: 0, amp: 4, len: .012, vel: .6, col: ["#3a1240", "#1f0a26"] },
        { y: .18, amp: 6, len: .009, vel: -.5, col: ["#2c0d33", "#180620"] },
        { y: .42, amp: 9, len: .007, vel: .4, col: ["#220a2b", "#12041a"] },
        { y: .7, amp: 12, len: .005, vel: -.35, col: ["#1a0722", "#0c0312"] }
      ];
      const alto = H - horizonte;
      for (const c of capas) {
        const base = horizonte + c.y * alto;
        const g = ctx.createLinearGradient(0, base - c.amp, 0, H);
        g.addColorStop(0, c.col[0]); g.addColorStop(1, c.col[1]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W + 10; x += 10) {
          const y = base + Math.sin(x * c.len + t * c.vel * 2) * c.amp + Math.sin(x * c.len * 2.3 - t * c.vel * 1.3) * c.amp * .4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
        // cresta brillante
        ctx.strokeStyle = "rgba(255,170,205,.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // reflejo de la luna
      const l = luna();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 26; i++) {
        const prog = i / 26;
        const y = horizonte + 6 + prog * alto * .92;
        const ancho = l.r * (.5 + prog * 1.1) * (.6 + .4 * Math.sin(t * 2 + i * 1.7));
        const dx = Math.sin(t * 1.3 + i * .9) * 10 * prog;
        ctx.globalAlpha = (1 - prog) * .5 * (.6 + .4 * Math.sin(t * 3 + i * 2.1));
        const g = ctx.createLinearGradient(l.x - ancho + dx, 0, l.x + ancho + dx, 0);
        g.addColorStop(0, "rgba(255,200,222,0)");
        g.addColorStop(.5, "rgba(255,225,236,1)");
        g.addColorStop(1, "rgba(255,200,222,0)");
        ctx.fillStyle = g;
        ctx.fillRect(l.x - ancho + dx, y, ancho * 2, 2 + prog * 3);
      }
      // destellos sueltos
      for (let i = 0; i < 40; i++) {
        const x = (Math.sin(i * 91.7) * .5 + .5) * W;
        const y = horizonte + (Math.cos(i * 37.3) * .5 + .5) * alto;
        const a = Math.max(0, Math.sin(t * 2 + i * 3.3));
        ctx.globalAlpha = a * .5;
        ctx.fillStyle = "#ffd6e6";
        ctx.fillRect(x, y, 6 + (i % 3) * 4, 1.2);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }

    window.addEventListener("resize", () => { if (activo) resize(); });

    return {
      iniciar() { if (activo) return; activo = true; resize(); raf = requestAnimationFrame(frame); },
      detener() { activo = false; cancelAnimationFrame(raf); }
    };
  }

  window.Oceano = Oceano;
})();
