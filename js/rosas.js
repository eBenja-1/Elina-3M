/* =========================================================
   Ramo de rosas en SVG que florece
   ========================================================= */
(function () {
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, padre) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(e);
    return e;
  }

  function petalo(l, w) {
    return `M0 0 C${w * .9} ${-l * .15} ${w * 1.12} ${-l * .78} ${w * .38} ${-l * .98} Q0 ${-l * 1.06} ${-w * .38} ${-l * .98} C${-w * 1.12} ${-l * .78} ${-w * .9} ${-l * .15} 0 0Z`;
  }

  function rosa(svg, x, y, R, variante, del) {
    const pos = el("g", { transform: `translate(${x} ${y})` }, svg);
    const g = el("g", { class: "rosa", style: `--del:${del}s` }, pos);
    // sombra suave
    el("circle", { cx: 0, cy: 4, r: R * .95, fill: "rgba(120,10,60,.18)", filter: "url(#desenfoque)" }, g);

    const anillos = [
      { n: 6, l: 1, off: 0, grad: `g-${variante}-1` },
      { n: 5, l: .8, off: 30, grad: `g-${variante}-2` },
      { n: 5, l: .62, off: 66, grad: `g-${variante}-2` },
      { n: 4, l: .44, off: 12, grad: `g-${variante}-3` },
      { n: 3, l: .3, off: 50, grad: `g-${variante}-3` }
    ];
    anillos.forEach((a, k) => {
      const ring = el("g", { class: "petalo-anillo", style: `--del:${(del + .25 + (anillos.length - k) * .12).toFixed(2)}s` }, g);
      const largo = R * a.l, ancho = largo * .72;
      for (let i = 0; i < a.n; i++) {
        const ang = a.off + (360 / a.n) * i + (Math.random() - .5) * 10;
        el("path", {
          d: petalo(largo, ancho),
          transform: `rotate(${ang.toFixed(1)})`,
          fill: `url(#${a.grad})`,
          stroke: "rgba(140,10,60,.28)",
          "stroke-width": .8
        }, ring);
      }
    });
    // centro en espiral
    const c = el("g", { class: "petalo-anillo", style: `--del:${(del + .2).toFixed(2)}s` }, g);
    el("circle", { r: R * .16, fill: `url(#g-${variante}-3)` }, c);
    const s = R * .14;
    el("path", {
      d: `M0 0 C${s * .5} ${-s * .4} ${s * .9} ${s * .2} ${s * .3} ${s * .7} C${-s * .4} ${s * 1.1} ${-s * 1.1} ${s * .2} ${-s * .7} ${-s * .5} C${-s * .3} ${-s * 1.1} ${s * .8} ${-s * 1.2} ${s * 1.1} ${-s * .3}`,
      fill: "none", stroke: "rgba(110,0,45,.45)", "stroke-width": 1.2, "stroke-linecap": "round"
    }, c);
  }

  function construirRamo(svg) {
    if (svg.childElementCount) return;

    const defs = el("defs", {}, svg);
    const grads = {
      rosa: [["#ffc4da", "#ff7fae"], ["#ff9cc2", "#f0397d"], ["#ff5c9a", "#c2185b"]],
      fuerte: [["#ff8fb8", "#e0306f"], ["#ff5c9a", "#c2185b"], ["#e0306f", "#8a0f3f"]],
      claro: [["#fff0f5", "#ffb3cf"], ["#ffd6e6", "#ff8fb8"], ["#ff9cc2", "#f0397d"]]
    };
    for (const v in grads) {
      grads[v].forEach((cols, i) => {
        const rg = el("radialGradient", { id: `g-${v}-${i + 1}`, cx: "50%", cy: "100%", r: "110%" }, defs);
        el("stop", { offset: "0%", "stop-color": cols[1] }, rg);
        el("stop", { offset: "100%", "stop-color": cols[0] }, rg);
      });
    }
    const f = el("filter", { id: "desenfoque", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
    el("feGaussianBlur", { stdDeviation: 4 }, f);
    const papel = el("linearGradient", { id: "papel", x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
    el("stop", { offset: "0%", "stop-color": "#fff3f7" }, papel);
    el("stop", { offset: "100%", "stop-color": "#ffd0e0" }, papel);
    const papel2 = el("linearGradient", { id: "papel2", x1: "0", y1: "0", x2: "1", y2: "1" }, defs);
    el("stop", { offset: "0%", "stop-color": "#ffe1ec" }, papel2);
    el("stop", { offset: "100%", "stop-color": "#ffb8d0" }, papel2);

    // papel de atrás
    el("path", {
      class: "envoltorio", style: "--del:.1s",
      d: "M30 205 Q200 150 370 205 L222 452 L178 452 Z",
      fill: "url(#papel2)", stroke: "rgba(200,60,110,.18)", "stroke-width": 1.2
    }, svg);

    const rosas = [
      [150, 92, 34, "claro"], [252, 90, 34, "rosa"],
      [86, 232, 34, "rosa"], [314, 232, 34, "claro"],
      [126, 168, 42, "fuerte"], [274, 168, 42, "fuerte"],
      [200, 128, 50, "rosa"], [200, 222, 42, "fuerte"]
    ];

    // tallos
    rosas.forEach(([x, y], i) => {
      const bx = 196 + (i % 3) * 4, by = 440;
      el("path", {
        class: "tallo", style: `--del:${(.2 + i * .08).toFixed(2)}s`,
        d: `M${bx} ${by} Q${(x + bx) / 2 + (x < 200 ? -10 : 10)} ${(y + by) / 2} ${x} ${y}`
      }, svg);
    });

    // hojas
    const hojas = [[150, 250, -150], [250, 250, -30], [118, 210, -165], [282, 212, -15], [175, 290, -120], [228, 292, -60]];
    hojas.forEach(([x, y, rot], i) => {
      const g = el("g", { transform: `translate(${x} ${y}) rotate(${rot})` }, svg);
      el("path", {
        class: "hoja", style: `--del:${(.9 + i * .1).toFixed(2)}s`,
        d: "M0 0 C12 -12 34 -12 46 0 C34 12 12 12 0 0Z"
      }, g);
    });

    // rosas
    rosas.forEach(([x, y, r, v], i) => rosa(svg, x, y, r, v, .7 + i * .16));

    // papel de adelante
    const frente = el("g", { class: "envoltorio", style: "--del:.2s" }, svg);
    el("path", {
      d: "M62 262 Q130 300 200 292 Q270 300 338 262 L222 456 L178 456 Z",
      fill: "url(#papel)", stroke: "rgba(200,60,110,.22)", "stroke-width": 1.2
    }, frente);
    el("path", { d: "M200 294 L200 456", stroke: "rgba(200,60,110,.18)", "stroke-width": 1.2, fill: "none" }, frente);
    el("path", { d: "M62 262 L190 456 M338 262 L210 456", stroke: "rgba(200,60,110,.12)", "stroke-width": 1, fill: "none" }, frente);

    // moño
    const lazo = el("g", { class: "lazo", style: "--del:2.2s" }, el("g", { transform: "translate(200 392)" }, svg));
    el("path", { d: "M0 0 C-20 -26 -58 -18 -44 4 C-36 16 -14 8 0 0Z", fill: "#f0397d" }, lazo);
    el("path", { d: "M0 0 C20 -26 58 -18 44 4 C36 16 14 8 0 0Z", fill: "#f0397d" }, lazo);
    el("path", { d: "M-4 4 L-26 52 L-16 48 L-10 58 L2 8Z", fill: "#e0306f" }, lazo);
    el("path", { d: "M4 4 L26 52 L16 48 L10 58 L-2 8Z", fill: "#e0306f" }, lazo);
    el("circle", { r: 8, fill: "#ff5c9a" }, lazo);
  }

  window.construirRamo = construirRamo;
})();
