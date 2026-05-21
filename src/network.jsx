/* global React, d3 */
const { useEffect, useRef, useState, useMemo } = window;

function ConnectionNetwork({ data }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { show, hide } = useTip();
  const { select } = useSelection();
  const { filters } = useFilters();
  const [size, setSize] = useState({ w: 1100, h: 720 });
  const [view, setView] = useState("country"); // country | editorial | language

  const visibleAuthors = useMemo(() => data.authors.filter(a => authorMatches(a, filters)), [data.authors, filters]);

  // Build graph by mode
  const graph = useMemo(() => {
    const nodes = [];
    const links = [];
    const seen = {};
    const ensureNode = (id, type, label, extra) => {
      if (seen[id]) return seen[id];
      const n = { id, type, label, ...extra };
      nodes.push(n); seen[id] = n; return n;
    };

    // Limit authors shown to avoid 500+ node overload — pick by relevancia ranking + random sample
    const relRank = { "Máxima": 5, "Muy alta": 4, "Alta": 3, "Media-alta": 2, "Media": 1, "Baja": 0, "Sin determinar": 0 };
    const authors = [...visibleAuthors]
      .sort((a, b) => {
        const ar = relRank[a.rel] !== undefined ? relRank[a.rel] : Math.min(5, (a.pubs?.length || 0) / 3);
        const br = relRank[b.rel] !== undefined ? relRank[b.rel] : Math.min(5, (b.pubs?.length || 0) / 3);
        return br - ar;
      })
      .slice(0, 110);

    for (const a of authors) {
      const an = ensureNode("a:" + a.n, "author", a.n, { a });
      if (view === "country") {
        const seenCountries = new Set();
        for (const p of a.pubs) {
          if (seenCountries.has(p.p)) continue; seenCountries.add(p.p);
          const cn = ensureNode("c:" + p.p, "country", p.p, {});
          links.push({ source: an.id, target: cn.id });
        }
        // also depto
        const dn = ensureNode("d:" + a.d, "depto", a.d, {});
        links.push({ source: an.id, target: dn.id, kind: "origin" });
      } else if (view === "editorial") {
        for (const p of a.pubs) {
          const en = ensureNode("e:" + p.e, "editorial", p.e, { country: p.p });
          links.push({ source: an.id, target: en.id });
        }
      } else if (view === "language") {
        const langs = new Set(a.pubs.map(p => p.l));
        for (const l of langs) {
          const ln = ensureNode("l:" + l, "language", l, {});
          links.push({ source: an.id, target: ln.id });
        }
      }
    }

    return { nodes, links };
  }, [visibleAuthors, view]);

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (!wrapRef.current) return;
      const r = wrapRef.current.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const { w, h } = size;

    const linkSel = svg.append("g")
      .attr("stroke", "rgba(241,231,208,0.18)")
      .attr("stroke-width", 0.5)
      .selectAll("line")
      .data(graph.links)
      .join("line");

    const nodeSel = svg.append("g")
      .selectAll("g")
      .data(graph.nodes)
      .join("g")
      .style("cursor", d => d.type === "author" ? "pointer" : "default");

    nodeSel.append("circle")
      .attr("r", d => nodeRadius(d, graph.links))
      .attr("fill", d => nodeColor(d.type))
      .attr("stroke", "var(--ink)")
      .attr("stroke-width", 0.6)
      .attr("opacity", 0.95);

    nodeSel.append("text")
      .attr("dy", d => -nodeRadius(d, graph.links) - 4)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--ivory)")
      .attr("opacity", d => d.type === "author" ? 0.4 : 0.85)
      .style("font-family", d => d.type === "author" ? "var(--f-display)" : "var(--f-mono)")
      .style("font-style", d => d.type === "author" ? "italic" : "normal")
      .style("font-size", d => d.type === "author" ? "10px" : "9px")
      .style("letter-spacing", d => d.type === "author" ? "0" : "0.15em")
      .style("text-transform", d => d.type === "author" ? "none" : "uppercase")
      .style("pointer-events", "none")
      .text(d => d.type === "author" ? d.label : (d.label || "").slice(0, 18));

    nodeSel.on("mouseenter", function(ev, d) {
      // highlight neighbors
      const neighborIds = new Set([d.id]);
      graph.links.forEach(l => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        if (s === d.id) neighborIds.add(t);
        if (t === d.id) neighborIds.add(s);
      });
      nodeSel.attr("opacity", n => neighborIds.has(n.id) ? 1 : 0.12);
      linkSel.attr("stroke", l => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        return (s === d.id || t === d.id) ? "var(--dorado)" : "rgba(241,231,208,0.06)";
      }).attr("stroke-width", l => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        return (s === d.id || t === d.id) ? 0.9 : 0.4;
      });

      const html = d.type === "author"
        ? `<div class="tip-sub">${escapeHtml(d.a.d)}</div><div class="tip-title">${escapeHtml(d.label)}</div><div class="tip-row">${d.a.pubs.length} edicione${d.a.pubs.length===1?'':'s'} · ${new Set(d.a.pubs.map(p=>p.p)).size} países</div>`
        : `<div class="tip-sub">${typeLabel(d.type)}</div><div class="tip-title">${escapeHtml(d.label)}</div>`;
      show(html, ev.clientX, ev.clientY);
    })
    .on("mousemove", function(ev) { show(null, ev.clientX, ev.clientY); })
    .on("mouseleave", function() {
      nodeSel.attr("opacity", 0.95);
      linkSel.attr("stroke", "rgba(241,231,208,0.18)").attr("stroke-width", 0.5);
      hide();
    })
    .on("click", (ev, d) => { if (d.type === "author") select(d.a); });

    // simulation
    const sim = d3.forceSimulation(graph.nodes)
      .force("link", d3.forceLink(graph.links).id(d => d.id).distance(d => {
        return 60;
      }).strength(0.4))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide().radius(d => nodeRadius(d, graph.links) + 4))
      .on("tick", () => {
        linkSel
          .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        nodeSel.attr("transform", d => `translate(${d.x},${d.y})`);
      });

    // damp
    setTimeout(() => sim.alphaTarget(0).restart(), 0);
    setTimeout(() => sim.stop(), 6000);

    return () => sim.stop();
  }, [graph, size, select, show, hide]);

  const ref = useFadeIn();

  return (
    <section className="section ink-bg" id="red" ref={ref}>
      <div className="wrap">
        <header className="chapter" style={{ borderBottomColor: "rgba(241,231,208,0.18)" }}>
          <div>
            <div className="chapter-no" style={{ color: "var(--dorado-soft)" }}>Capítulo III</div>
            <h2 className="chapter-title" style={{ color: "var(--ivory)" }}>Constelaciones <em className="italic" style={{ color: "var(--dorado)" }}>del oficio</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta" style={{ color: "rgba(241,231,208,0.6)" }}>
            Grafo de<br/>conexiones
          </div>
        </header>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
          <p className="lede" style={{ color: "rgba(241,231,208,0.7)", maxWidth: "60ch" }}>
            Los autores no escriben solos: orbitan editoriales, lenguas y geografías. Cambia la vista
            para revelar tres lecturas distintas del mismo archivo.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              ["country", "Por país"],
              ["editorial", "Por editorial"],
              ["language", "Por lengua"]
            ].map(([k, l]) => (
              <button key={k}
                onClick={() => setView(k)}
                className="pill"
                style={{
                  background: view === k ? "var(--dorado)" : "transparent",
                  color: view === k ? "var(--ink)" : "rgba(241,231,208,0.7)",
                  borderColor: view === k ? "var(--dorado)" : "rgba(241,231,208,0.3)"
                }}>{l}</button>
            ))}
          </div>
        </div>

        <div ref={wrapRef} style={{
          position: "relative",
          marginTop: "2rem",
          border: "1px solid rgba(241,231,208,0.2)",
          aspectRatio: "16 / 10",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 50%, rgba(181,139,58,0.06) 0%, transparent 60%)"
        }}>
          <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="xMidYMid meet" />
          <div style={{
            position: "absolute", top: "1rem", left: "1.25rem",
            fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.18em",
            color: "rgba(241,231,208,0.55)"
          }}>Lámina III · grafo dirigido — fuerzas en equilibrio</div>
          <div style={{
            position: "absolute", bottom: "1rem", left: "1.25rem", display: "flex", gap: "1.25rem",
            fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: "0.14em",
            color: "rgba(241,231,208,0.7)"
          }}>
            <LegendDot c="var(--rojo)" l="autor" />
            {view === "country" && <>
              <LegendDot c="var(--dorado)" l="país" />
              <LegendDot c="var(--azul-2)" l="depto. de origen" />
            </>}
            {view === "editorial" && <LegendDot c="var(--dorado)" l="editorial" />}
            {view === "language" && <LegendDot c="var(--selva-2)" l="lengua" />}
          </div>
          <div style={{
            position: "absolute", bottom: "1rem", right: "1.25rem",
            fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.14em",
            color: "rgba(241,231,208,0.55)"
          }}>
            Top 110 autores · clic para ficha
          </div>
        </div>
      </div>
    </section>
  );
}

function LegendDot({ c, l }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: c, display: "inline-block" }} />
      <span style={{ textTransform: "uppercase" }}>{l}</span>
    </span>
  );
}

function nodeColor(t) {
  return {
    author: "var(--rojo)",
    country: "var(--dorado)",
    editorial: "var(--dorado)",
    language: "var(--selva-2)",
    depto: "var(--azul-2)"
  }[t] || "var(--ivory)";
}

function nodeRadius(d, links) {
  if (d.type === "author") return 4;
  // count degree
  let deg = 0;
  for (const l of links) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    if (s === d.id || t === d.id) deg++;
  }
  return Math.min(18, 3 + Math.sqrt(deg) * 2.4);
}

function typeLabel(t) {
  return { country: "País", editorial: "Editorial", language: "Lengua", depto: "Departamento" }[t] || "";
}

window.ConnectionNetwork = ConnectionNetwork;
