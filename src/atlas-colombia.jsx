/* global React, d3, topojson */
const { useEffect, useRef, useState, useMemo } = window;

let _worldCache = null;
async function loadWorld() {
  if (_worldCache) return _worldCache;
  const r = await fetch(window.__resources?.worldAtlas || "https://unpkg.com/world-atlas@2.0.2/countries-110m.json");
  _worldCache = await r.json();
  return _worldCache;
}

function AtlasColombia({ data }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { show, hide } = useTip();
  const { setHovered, select } = useSelection();
  const { filters, setKey } = useFilters();

  // Filter authors -> filter cities
  const visibleAuthors = useMemo(() => data.authors.filter(a => authorMatches(a, filters)), [data.authors, filters]);

  const cityData = useMemo(() => {
    // Re-aggregate cities from filtered authors
    const map = {};
    for (const a of visibleAuthors) {
      if (a.lat == null) continue;
      if (!map[a.c]) map[a.c] = { name: a.c, depto: a.d, region: a.r, lat: a.lat, lon: a.lon, count: 0, authors: [] };
      map[a.c].count++;
      map[a.c].authors.push(a);
    }
    return Object.values(map);
  }, [visibleAuthors]);

  const [size, setSize] = useState({ w: 600, h: 720 });

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
    svg.selectAll("g.world,g.deptos,g.cities,g.labels").remove();
    let cancelled = false;
    let pendingFrames = [];

    loadWorld().then(world => {
      if (cancelled) return;
      const features = topojson.feature(world, world.objects.countries).features;
      const colombia = features.find(f => f.id === "170");
      if (!colombia) return;
      const proj = d3.geoMercator().fitExtent(
        [[24, 28], [size.w - 24, size.h - 28]],
        colombia
      );
      const path = d3.geoPath(proj);

      // Sea/background ink dots inside frame (subtle topographic crosshatch)
      const def = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
      if (def.select("#hatch-col").empty()) {
        def.append("pattern")
          .attr("id", "hatch-col")
          .attr("patternUnits", "userSpaceOnUse")
          .attr("width", 6).attr("height", 6)
          .append("path")
          .attr("d", "M0,6 L6,0")
          .attr("stroke", "rgba(20,17,13,0.08)")
          .attr("stroke-width", 0.6);
      }

      const g = svg.append("g").attr("class", "world");

      // neighbors (faint)
      g.selectAll("path.neighbor")
        .data(features.filter(f => f.id !== "170"))
        .join("path")
        .attr("class", "neighbor")
        .attr("d", path)
        .attr("fill", "rgba(20,17,13,0.03)")
        .attr("stroke", "rgba(20,17,13,0.15)")
        .attr("stroke-width", 0.4);

      // Colombia body — SINGLE consolidated path (no double-stacking)
      g.append("path")
        .datum(colombia)
        .attr("d", path)
        .attr("fill", "url(#hatch-col)")
        .attr("stroke", "var(--ink)")
        .attr("stroke-width", 1.2)
        .attr("pointer-events", "none");

      // Coordinate grid clipped to Colombia (subtle overlay, NOT another full country layer)
      const grat = d3.geoGraticule().step([2, 2]);
      g.append("path")
        .datum(grat())
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "rgba(20,17,13,0.08)")
        .attr("stroke-width", 0.3)
        .attr("pointer-events", "none");

      // Save projection for points
      svg.node()._proj = proj;
      drawDots();
    });

    function drawDots() {
      const proj = svg.node()._proj;
      if (!proj) return;
      svg.selectAll("g.cities,g.labels").remove();

      const maxCount = d3.max(cityData, d => d.count) || 1;
      const rScale = d3.scaleSqrt().domain([1, maxCount]).range([2.5, 22]);

      const g = svg.append("g").attr("class", "cities");

      const sel = g.selectAll("g.city").data(cityData, d => d.name);

      const enter = sel.enter().append("g").attr("class", "city");

      enter.attr("transform", d => {
        const p = proj([d.lon, d.lat]);
        return p ? `translate(${p[0]},${p[1]})` : "";
      });

      // outer ring
      enter.append("circle")
        .attr("class", "city-ring")
        .attr("r", d => rScale(d.count) + 5)
        .attr("fill", "none")
        .attr("stroke", "var(--rojo)")
        .attr("stroke-width", 0.4)
        .attr("opacity", 0.35);

      // main dot
      enter.append("circle")
        .attr("class", "city-dot")
        .attr("r", 0)
        .attr("fill", "var(--rojo)")
        .attr("stroke", "var(--ink)")
        .attr("stroke-width", 0.6)
        .attr("opacity", 0.85)
        .transition().duration(700)
        .attr("r", d => rScale(d.count));

      // crosshair tick
      enter.each(function(d) {
        if (d.count < 12) return;
        const r = rScale(d.count);
        const node = d3.select(this);
        node.append("line").attr("x1", -r-3).attr("x2", -r-7).attr("stroke", "var(--ink)").attr("stroke-width", 0.5);
        node.append("line").attr("x1", r+3).attr("x2", r+7).attr("stroke", "var(--ink)").attr("stroke-width", 0.5);
        node.append("line").attr("y1", -r-3).attr("y2", -r-7).attr("stroke", "var(--ink)").attr("stroke-width", 0.5);
        node.append("line").attr("y1", r+3).attr("y2", r+7).attr("stroke", "var(--ink)").attr("stroke-width", 0.5);
      });

      enter.style("cursor", "pointer");

      // tooltips + selection
      enter.on("mouseenter", function(ev, d) {
        d3.select(this).select(".city-dot").attr("fill", "var(--dorado)");
        const html = `
          <div class="tip-sub">${escapeHtml(d.depto)} · ${escapeHtml(d.region)}</div>
          <div class="tip-title">${escapeHtml(d.name)}</div>
          <div class="tip-row">${d.count} autor${d.count !== 1 ? "es" : ""}</div>
          <div class="tip-row" style="opacity:0.6;margin-top:0.4rem;font-family:var(--f-mono);font-size:0.65rem;">${fmtCoord(d.lat, d.lon)}</div>
        `;
        show(html, ev.clientX, ev.clientY);
      })
      .on("mousemove", function(ev) {
        show(null, ev.clientX, ev.clientY);
      })
      .on("mouseleave", function() {
        d3.select(this).select(".city-dot").attr("fill", "var(--rojo)");
        hide();
      })
      .on("click", function(ev, d) {
        // Filter: pick author if only one, else just spotlight city by depto filter
        if (d.authors.length === 1) {
          select(d.authors[0]);
        } else {
          setKey("depto", filters.depto === d.depto ? null : d.depto);
        }
      });

      // Update for cities already there
      sel.transition().duration(500)
        .attr("transform", d => { const p = proj([d.lon, d.lat]); return p ? `translate(${p[0]},${p[1]})` : ""; });

      // Remove gone
      sel.exit().transition().duration(300).attr("opacity", 0).remove();

      // Labels for top 8
      const top = [...cityData].sort((a,b) => b.count - a.count).slice(0, 8);
      const labels = svg.append("g").attr("class", "labels");
      labels.selectAll("text").data(top).join("text")
        .each(function(d) {
          const p = proj([d.lon, d.lat]);
          if (!p) return;
          const r = rScale(d.count);
          d3.select(this)
            .attr("x", p[0] + r + 6)
            .attr("y", p[1] + 3)
            .attr("class", "svg-text-serif")
            .style("font-size", "13px")
            .style("font-style", "italic")
            .text(d.name);
        });
    }

    return () => { cancelled = true; };
  }, [size, cityData]);

  // Department filter pills
  const deptos = useMemo(() => {
    const counts = {};
    for (const a of data.authors) counts[a.d] = (counts[a.d] || 0) + 1;
    return Object.entries(counts).filter(([k]) => k && k !== "No aplica").sort((a,b) => b[1]-a[1]).slice(0, 14);
  }, [data]);

  const regions = useMemo(() => {
    const counts = {};
    for (const a of visibleAuthors) counts[a.r] = (counts[a.r] || 0) + 1;
    return Object.entries(counts).sort((a,b) => b[1]-a[1]);
  }, [visibleAuthors]);

  const ref = useFadeIn();

  return (
    <section className="section paper-bg" id="colombia" ref={ref}>
      <div className="wrap">
        <header className="chapter">
          <div>
            <div className="chapter-no">Capítulo I</div>
            <h2 className="chapter-title">Donde nacen <em className="italic">las palabras</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta">
            Cartografía<br/>de origen
          </div>
        </header>

        <p className="lede" style={{ marginTop: "1rem", marginBottom: "2rem" }}>
          Cada punto es una ciudad o municipio en el que nació un autor del archivo.
          El tamaño del círculo refleja la densidad. <span style={{ color: "var(--rojo)" }}>Bogotá, Medellín y Cali</span> concentran
          más de la mitad de las plumas registradas — pero el mapa se abre hasta el Caribe, el Pacífico, el Eje Cafetero y la diáspora.
        </p>

        <div className="atlas-grid">
          <div className="atlas-frame" ref={wrapRef}>
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="xMidYMid meet" />
            <div className="atlas-coord tl">N · 13° 30′</div>
            <div className="atlas-coord tr">Lámina I</div>
            <div className="atlas-coord bl">S · 04° 12′</div>
            <div className="atlas-coord br">Esc. 1 : 8.000.000</div>
          </div>

          <aside style={{ display: "grid", gap: "2rem" }}>
            <div className="legend">
              <h4>Departamentos</h4>
              <ul>
                {deptos.map(([name, c]) => {
                  const active = filters.depto === name;
                  return (
                    <li key={name} className={active ? "active" : ""}
                        onClick={() => setKey("depto", active ? null : name)}>
                      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                      <span className="legend-bar" />
                      <span className="legend-count">{c}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="legend">
              <h4>Regiones (filtradas)</h4>
              <ul>
                {regions.map(([name, c]) => {
                  const active = filters.region === name;
                  return (
                    <li key={name} className={active ? "active" : ""}
                        onClick={() => setKey("region", active ? null : name)}>
                      <span style={{
                        display: "inline-block", width: 8, height: 8,
                        background: regionColor(name), marginRight: "0.5rem",
                        verticalAlign: "middle"
                      }} />
                      <span>{name}</span>
                      <span className="legend-bar" />
                      <span className="legend-count">{c}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="marginalia" style={{ paddingTop: "1rem", borderTop: "1px solid var(--rule)" }}>
              <span style={{ color: "var(--rojo)" }}>◇</span> Clic en una ciudad o departamento
              para filtrar todo el atlas.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function regionColor(r) {
  return {
    "Andina": "var(--rojo)",
    "Caribe": "var(--dorado)",
    "Pacífica": "var(--azul)",
    "Insular": "var(--selva)",
    "Orinoquía": "#a85b2c",
    "Amazonía": "var(--selva-2)",
    "Diáspora": "var(--ink-soft)"
  }[r] || "var(--ink-soft)";
}

window.AtlasColombia = AtlasColombia;
window.regionColor = regionColor;
