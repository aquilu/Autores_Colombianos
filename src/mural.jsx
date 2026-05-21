/* global React */
const { useMemo, useState } = window;

function AuthorMural({ data }) {
  const { filters } = useFilters();
  const { select } = useSelection();
  const { show, hide } = useTip();
  const [mode, setMode] = useState("autores"); // autores | obras | editoriales

  const visibleAuthors = useMemo(() => data.authors.filter(a => authorMatches(a, filters)), [data.authors, filters]);

  // Build items with weights
  const items = useMemo(() => {
    if (mode === "autores") {
      // weight by publications + relevancia
      const relW = { "Máxima": 8, "Muy alta": 5, "Alta": 3, "Media-alta": 2, "Media": 1.2, "Baja": 1, "Sin determinar": 1 };
      return visibleAuthors.map(a => ({
        id: a.n,
        label: a.n,
        w: a.pubs.length * 0.5 + (a.rel ? (relW[a.rel] || 1) * 1.4 : Math.min(8, a.pubs.length * 0.6)),
        a,
      })).sort((a, b) => b.w - a.w).slice(0, 120);
    }
    if (mode === "obras") {
      // each author -> primary obras
      const out = [];
      for (const a of visibleAuthors) {
        let arr = a.obras;
        if (!arr || arr.length === 0) {
          // LIJ uses 'libros' as a string
          const raw = a.libros || "";
          arr = raw.split(/[,;]/).map(s => s.trim().replace(/\s*\(\d{4}\)\s*$/, "")).filter(s => s && s.length < 60);
        }
        for (const o of arr.slice(0, 1)) {
          if (!o) continue;
          out.push({
            id: a.n + "::" + o,
            label: o,
            w: 2 + (a.pubs.length * 0.3),
            a,
          });
        }
      }
      return out.sort((a,b) => b.w - a.w).slice(0, 90);
    }
    // editoriales
    const map = {};
    for (const a of visibleAuthors) {
      for (const p of a.pubs) {
        if (!map[p.e]) map[p.e] = { id: p.e, label: p.e, w: 0, a: null, count: 0, country: p.p };
        map[p.e].w++;
        map[p.e].count++;
        if (!map[p.e].a) map[p.e].a = a;
      }
    }
    return Object.values(map).sort((a,b) => b.w - a.w).slice(0, 90);
  }, [visibleAuthors, mode]);

  // Pack items into a rectangle using a spiral-ish algorithm
  const placed = useMemo(() => {
    const W = 1200, H = 700, padX = 40, padY = 30;
    const maxW = Math.max(...items.map(i => i.w), 1);
    const placedItems = [];

    // Build with random angles, scaled sizes
    const ordered = [...items];
    for (const item of ordered) {
      const size = 14 + (item.w / maxW) * 56; // 14..70px
      const angle = Math.random() < 0.7 ? 0 : (Math.random() < 0.5 ? -8 : 8);
      const widthEst = item.label.length * size * 0.42;
      const heightEst = size * 1.1;
      // try to place: start near center, spiral outward
      let placed = false;
      let r = 0;
      let theta = Math.random() * Math.PI * 2;
      let attempts = 0;
      while (!placed && attempts < 360) {
        const cx = W/2 + Math.cos(theta) * r;
        const cy = H/2 + Math.sin(theta) * r * 0.7;
        const x = cx - widthEst/2;
        const y = cy - heightEst/2;
        // bounds
        if (x > padX && x + widthEst < W - padX && y > padY && y + heightEst < H - padY) {
          // collision check
          let collide = false;
          for (const p of placedItems) {
            if (!(x + widthEst < p.x - 4 || x > p.x + p.w + 4 || y + heightEst < p.y - 4 || y > p.y + p.h + 4)) {
              collide = true; break;
            }
          }
          if (!collide) {
            placedItems.push({ ...item, x, y, w: widthEst, h: heightEst, size, angle });
            placed = true;
          }
        }
        attempts++;
        theta += 0.4;
        r += 1.6;
      }
    }
    return { items: placedItems, W, H };
  }, [items]);

  const ref = useFadeIn();

  return (
    <section className="section paper-bg" id="mural" ref={ref}>
      <div className="wrap">
        <header className="chapter">
          <div>
            <div className="chapter-no">Capítulo IV</div>
            <h2 className="chapter-title">Mural <em className="italic">del archivo</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta">
            Tipografía<br/>como territorio
          </div>
        </header>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
          <p className="lede" style={{ maxWidth: "60ch" }}>
            Una composición tipográfica donde cada nombre crece con su volumen de circulación.
            <span style={{ color: "var(--rojo)" }}> Pasa el cursor</span> para leer la ficha; haz clic para abrirla.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[["autores", "Autores"], ["obras", "Obras"], ["editoriales", "Editoriales"]].map(([k, l]) => (
              <button key={k} onClick={() => setMode(k)} className={"pill " + (mode === k ? "active" : "")}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: "2rem",
          position: "relative",
          border: "1px solid var(--ink)",
          background: "linear-gradient(180deg, var(--paper) 0%, var(--ivory) 100%)",
          aspectRatio: `${placed.W} / ${placed.H}`,
          overflow: "hidden"
        }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${placed.W} ${placed.H}`} style={{ display: "block" }}>
            <defs>
              <pattern id="mural-hatch" patternUnits="userSpaceOnUse" width="3" height="3">
                <circle cx="1.5" cy="1.5" r="0.4" fill="rgba(20,17,13,0.16)" />
              </pattern>
            </defs>
            <rect width={placed.W} height={placed.H} fill="url(#mural-hatch)" opacity="0.4" />

            {placed.items.map((it, i) => {
              const fontStyle = (i % 3 === 0) ? "italic" : "normal";
              const fontWeight = (i % 4 === 0 || it.size > 36) ? 500 : 400;
              const color = (i % 7 === 0) ? "var(--rojo)" : (i % 5 === 0 ? "var(--dorado)" : "var(--ink)");
              return (
                <g key={it.id} transform={`translate(${it.x + it.w/2},${it.y + it.h/2}) rotate(${it.angle})`}
                   style={{ cursor: "pointer" }}
                   onMouseEnter={(e) => {
                     const a = it.a;
                     const html = mode === "editoriales"
                       ? `<div class="tip-sub">Editorial · ${escapeHtml(it.country || '')}</div><div class="tip-title">${escapeHtml(it.label)}</div><div class="tip-row">${it.count} autor${it.count===1?'':'es'}</div>`
                       : `<div class="tip-sub">${escapeHtml(a.d)} · ${a.yn || '—'}</div><div class="tip-title">${escapeHtml(a.n)}</div><div class="tip-row">${a.obras[0] ? '«' + escapeHtml(a.obras[0]) + '»' : ''}</div>`;
                     show(html, e.clientX, e.clientY);
                   }}
                   onMouseMove={(e) => show(null, e.clientX, e.clientY)}
                   onMouseLeave={hide}
                   onClick={() => it.a && select(it.a)}>
                  <text
                    fontFamily="var(--f-display)"
                    fontStyle={fontStyle}
                    fontWeight={fontWeight}
                    fontSize={it.size}
                    fill={color}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ transition: "fill 0.2s" }}
                    onMouseEnter={(e) => e.currentTarget.style.fill = "var(--rojo)"}
                    onMouseLeave={(e) => e.currentTarget.style.fill = color}
                  >{it.label}</text>
                </g>
              );
            })}
          </svg>

          <div style={{
            position: "absolute", top: "1rem", left: "1.25rem",
            fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.18em",
            color: "var(--ink-soft)"
          }}>Lámina IV · mural tipográfico</div>
          <div style={{
            position: "absolute", bottom: "1rem", right: "1.25rem",
            fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.18em",
            color: "var(--ink-soft)"
          }}>
            {placed.items.length} entradas
          </div>
        </div>
      </div>
    </section>
  );
}

window.AuthorMural = AuthorMural;
