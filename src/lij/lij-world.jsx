/* global React, d3, topojson */
const { useEffect, useRef, useState, useMemo } = window;

// Re-use loadWorld from atlas-colombia.jsx (it sets _worldCache as a closure variable).
// To avoid coupling, define our own cache here.
let _lijWorldCache = null;
async function loadWorldLij() {
  if (_lijWorldCache) return _lijWorldCache;
  if (window._worldCache) { _lijWorldCache = window._worldCache; return _lijWorldCache; }
  const r = await fetch(window.__resources?.worldAtlas || "https://unpkg.com/world-atlas@2.0.2/countries-110m.json");
  _lijWorldCache = await r.json();
  return _lijWorldCache;
}

function LijWorldAtlas({ data }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { show, hide } = useTip();
  const { filters, setKey } = useFilters();
  const { select } = useSelection();
  const [size, setSize] = useState({ w: 1200, h: 700 });

  const visibleAuthors = useMemo(() => data.authors.filter(a => authorMatches(a, filters)), [data.authors, filters]);

  // Editorial city stats from filtered data
  const editorialCities = useMemo(() => {
    const map = {};
    for (const a of visibleAuthors) {
      for (const p of a.pubs) {
        if (p.plat == null || isNaN(p.plat)) continue;
        const k = `${p.plat.toFixed(3)},${p.plon.toFixed(3)}`;
        if (!map[k]) {
          map[k] = { lat: p.plat, lon: p.plon, country: p.p, editorials: new Set(), authors: new Set(), languages: new Set() };
        }
        map[k].editorials.add(p.e);
        map[k].authors.add(a.n);
        map[k].languages.add(p.l);
      }
    }
    return Object.values(map).map(c => ({
      ...c,
      editorials: [...c.editorials],
      authors: [...c.authors],
      languages: [...c.languages],
      count: c.authors.size || [...c.authors].length
    }));
  }, [visibleAuthors]);

  const bogota = [4.7110, -74.0721];

  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(600, r.width), h: Math.max(360, r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    let cancelled = false;

    const w = size.w, h = size.h;
    const proj = d3.geoNaturalEarth1()
      .scale(w / 5.6)
      .translate([w * 0.5, h * 0.55]);
    const path = d3.geoPath(proj);

    const bp = proj([bogota[1], bogota[0]]);

    // graticule
    svg.append("path")
      .datum(d3.geoGraticule().step([20, 20])())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(241,231,208,0.06)")
      .attr("stroke-width", 0.4);

    loadWorldLij().then(world => {
      if (cancelled) return;
      const countries = topojson.feature(world, world.objects.countries).features;
      // Tally country -> filtered authors
      const countryAuthorCount = {};
      for (const c of editorialCities) {
        countryAuthorCount[c.country] = (countryAuthorCount[c.country] || new Set());
      }
      for (const a of visibleAuthors) {
        for (const p of a.pubs) {
          if (!countryAuthorCount[p.p]) countryAuthorCount[p.p] = new Set();
          countryAuthorCount[p.p].add(a.n);
        }
      }
      const cMax = Math.max(...Object.values(countryAuthorCount).map(s => s.size), 1);

      const esEnMap = {
        "Estados Unidos": "United States of America", "Brasil": "Brazil", "Argentina": "Argentina",
        "Perú": "Peru", "Chile": "Chile", "México": "Mexico", "Costa Rica": "Costa Rica",
        "Uruguay": "Uruguay", "Bolivia": "Bolivia", "Venezuela": "Venezuela", "Ecuador": "Ecuador",
        "Canadá": "Canada", "Guatemala": "Guatemala", "Puerto Rico": "Puerto Rico",
        "Francia": "France", "Reino Unido": "United Kingdom", "Hungría": "Hungary",
        "España": "Spain", "Italia": "Italy", "Serbia": "Republic of Serbia", "Polonia": "Poland",
        "Grecia": "Greece", "Portugal": "Portugal", "Bélgica": "Belgium",
        "República Checa": "Czech Republic", "Países Bajos": "Netherlands",
        "Noruega": "Norway", "Alemania": "Germany", "Finlandia": "Finland",
        "Dinamarca": "Denmark", "Turquía": "Turkey", "Austria": "Austria",
        "Suecia": "Sweden", "Suiza": "Switzerland", "Rumania": "Romania", "Mónaco": "Monaco",
        "Estonia": "Estonia", "Croacia": "Croatia", "Letonia": "Latvia",
        "Eslovenia": "Slovenia", "Albania": "Albania", "Macedonia del Norte": "Macedonia",
        "Eslovaquia": "Slovakia", "Bulgaria": "Bulgaria", "China": "China",
        "Corea": "South Korea", "Israel": "Israel", "Rusia": "Russia", "Líbano": "Lebanon",
        "Arabia Saudita": "Saudi Arabia", "India": "India", "Japón": "Japan",
        "Irán": "Iran", "Pakistán": "Pakistan", "Vietnam": "Vietnam",
        "Indonesia": "Indonesia", "Egipto": "Egypt", "Australia": "Australia"
      };
      const enToEs = Object.fromEntries(Object.entries(esEnMap).map(([k,v]) => [v, k]));

      // Single layer of countries (no duplication)
      const fg = svg.append("g");
      const colScale = d3.scaleSqrt().domain([1, cMax]).range([0.12, 0.55]);
      fg.selectAll("path.country")
        .data(countries)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => {
          if (d.id === "170") return "rgba(198,63,31,0.5)";
          const esName = enToEs[d.properties.name];
          const set = esName && countryAuthorCount[esName];
          if (set && set.size) return `rgba(74,125,90,${colScale(set.size)})`;
          return "rgba(241,231,208,0.045)";
        })
        .attr("stroke", d => {
          if (d.id === "170") return "var(--lij-mostaza)";
          const esName = enToEs[d.properties.name];
          if (esName && countryAuthorCount[esName] && countryAuthorCount[esName].size) return "rgba(74,125,90,0.7)";
          return "rgba(241,231,208,0.12)";
        })
        .attr("stroke-width", 0.4);

      // Arcs from Bogotá to each editorial city
      const aGroup = svg.append("g").attr("class", "arcs");
      const maxCityAuthors = Math.max(...editorialCities.map(c => c.count), 1);
      const widthScale = d3.scaleSqrt().domain([1, maxCityAuthors]).range([0.4, 2.2]);

      editorialCities.forEach((c, i) => {
        const pt = proj([c.lon, c.lat]);
        if (!pt) return;
        const dPath = arcPath(bp[0], bp[1], pt[0], pt[1], 0.24);
        const p = aGroup.append("path")
          .attr("d", dPath)
          .attr("fill", "none")
          .attr("stroke", "var(--lij-mostaza)")
          .attr("stroke-width", widthScale(c.count))
          .attr("opacity", 0)
          .attr("stroke-linecap", "round");
        const totalLen = p.node().getTotalLength();
        p.attr("stroke-dasharray", `${totalLen} ${totalLen}`)
          .attr("stroke-dashoffset", totalLen)
          .transition()
          .delay(i * 6)
          .duration(1200)
          .ease(d3.easeCubicOut)
          .attr("opacity", 0.42)
          .attr("stroke-dashoffset", 0);
      });

      // City dots
      const cityRScale = d3.scaleSqrt().domain([1, maxCityAuthors]).range([1.5, 7]);
      const cGroup = svg.append("g").attr("class", "city-points");
      cGroup.selectAll("circle.city")
        .data(editorialCities)
        .join("circle")
        .attr("class", "city")
        .attr("cx", d => proj([d.lon, d.lat])?.[0] || 0)
        .attr("cy", d => proj([d.lon, d.lat])?.[1] || 0)
        .attr("r", d => cityRScale(d.count))
        .attr("fill", "var(--ivory)")
        .attr("stroke", "var(--lij-rojo)")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseenter", function(ev, d) {
          d3.select(this).attr("fill", "var(--lij-mostaza)");
          const html = `
            <div class="tip-sub">${escapeHtml(d.country)}</div>
            <div class="tip-title">${d.editorials.length} editorial${d.editorials.length === 1 ? "" : "es"}</div>
            <div class="tip-row">${d.count} autor${d.count !== 1 ? "es" : ""} colombiano${d.count !== 1 ? "s" : ""}</div>
            <div class="tip-row" style="opacity:0.75;margin-top:0.4rem;">${d.editorials.slice(0,4).map(e => escapeHtml(e)).join(" · ")}${d.editorials.length > 4 ? "…" : ""}</div>
          `;
          show(html, ev.clientX, ev.clientY);
        })
        .on("mousemove", function(ev) { show(null, ev.clientX, ev.clientY); })
        .on("mouseleave", function() {
          d3.select(this).attr("fill", "var(--ivory)");
          hide();
        })
        .on("click", function(ev, d) {
          setKey("pais", filters.pais === d.country ? null : d.country);
        });

      // Bogotá marker
      svg.append("circle")
        .attr("cx", bp[0]).attr("cy", bp[1])
        .attr("r", 6).attr("fill", "var(--lij-rojo)")
        .attr("stroke", "var(--ivory)").attr("stroke-width", 1);
      svg.append("circle")
        .attr("cx", bp[0]).attr("cy", bp[1])
        .attr("r", 6).attr("fill", "none")
        .attr("stroke", "var(--lij-rojo)").attr("stroke-width", 1.4)
        .attr("opacity", 0.6)
        .append("animate")
        .attr("attributeName", "r").attr("from", 6).attr("to", 24)
        .attr("dur", "3s").attr("repeatCount", "indefinite");
      svg.append("text")
        .attr("x", bp[0] + 9).attr("y", bp[1] - 8)
        .attr("class", "svg-text-mono")
        .attr("fill", "var(--lij-rojo)")
        .style("font-size", "9px")
        .text("BOGOTÁ · ORIGEN");
    });

    return () => { cancelled = true; };
  }, [size, editorialCities, visibleAuthors, filters.pais, setKey, show, hide]);

  // top countries list
  const topCountries = useMemo(() => {
    const m = {};
    for (const a of visibleAuthors) {
      for (const p of a.pubs) {
        if (!m[p.p]) m[p.p] = new Set();
        m[p.p].add(a.n);
      }
    }
    return Object.entries(m).map(([k, v]) => [k, v.size]).sort((a,b) => b[1]-a[1]).slice(0, 14);
  }, [visibleAuthors]);

  const topEditorials = useMemo(() => {
    const m = {};
    for (const a of visibleAuthors) {
      for (const p of a.pubs) {
        if (!m[p.e]) m[p.e] = new Set();
        m[p.e].add(a.n);
      }
    }
    return Object.entries(m).map(([k, v]) => [k, v.size]).sort((a,b) => b[1]-a[1]).slice(0, 14);
  }, [visibleAuthors]);

  const ref = useFadeIn();

  return (
    <section className="section ink-bg" id="lij-mundo" ref={ref}>
      <div className="wrap">
        <header className="chapter" style={{ borderBottomColor: "rgba(241,231,208,0.18)" }}>
          <div>
            <div className="chapter-no" style={{ color: "var(--lij-mostaza)" }}>Capítulo III</div>
            <h2 className="chapter-title" style={{ color: "var(--ivory)" }}>
              De Colombia <em className="italic" style={{ color: "var(--lij-mostaza)" }}>para el mundo</em>
            </h2>
          </div>
          <div></div>
          <div className="chapter-meta" style={{ color: "rgba(241,231,208,0.6)" }}>
            Cartografía<br/>editorial precisa
          </div>
        </header>

        <p className="lede" style={{ color: "rgba(241,231,208,0.78)", marginTop: "1rem", marginBottom: "2rem", maxWidth: "62ch" }}>
          A diferencia de un mapa por países, aquí cada punto es una <em>ciudad editorial</em> exacta:
          la calle de Bolonia donde se imprimen los álbumes, la cuadra de Seúl donde
          se traducen los cómics. Bogotá al centro, el mundo en arcos.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: "3rem", alignItems: "start" }}>
          <div ref={wrapRef} className="lij-world-frame" style={{ aspectRatio: "16 / 9" }}>
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="xMidYMid meet" />
            <div style={{
              position: "absolute", top: "1rem", left: "1.25rem",
              fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.18em",
              color: "rgba(241,231,208,0.55)"
            }}>Lámina III · {editorialCities.length} ciudades editoriales · proyección Natural Earth</div>
            <div style={{
              position: "absolute", bottom: "1rem", right: "1.25rem",
              fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.18em",
              color: "rgba(241,231,208,0.55)"
            }}>
              {visibleAuthors.length} autores · {topCountries.length} países
            </div>
          </div>

          <aside style={{ color: "rgba(241,231,208,0.8)" }}>
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{
                fontFamily: "var(--f-mono)", fontSize: "0.7rem", letterSpacing: "0.22em",
                textTransform: "uppercase", color: "var(--lij-mostaza)", margin: "0 0 0.8rem"
              }}>Países por autores</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontFamily: "var(--f-mono)", fontSize: "0.72rem" }}>
                {topCountries.map(([k, v]) => {
                  const active = filters.pais === k;
                  return (
                    <li key={k}
                      onClick={() => setKey("pais", active ? null : k)}
                      style={{
                        display: "flex", justifyContent: "space-between", gap: "0.5rem",
                        padding: "0.4rem 0",
                        borderBottom: "1px solid rgba(241,231,208,0.1)",
                        cursor: "pointer",
                        color: active ? "var(--lij-mostaza)" : "rgba(241,231,208,0.85)"
                      }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
                      <span style={{ color: "var(--lij-mostaza)" }}>{v}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 style={{
                fontFamily: "var(--f-mono)", fontSize: "0.7rem", letterSpacing: "0.22em",
                textTransform: "uppercase", color: "var(--lij-mostaza)", margin: "0 0 0.8rem"
              }}>Sellos editoriales</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontFamily: "var(--f-mono)", fontSize: "0.72rem" }}>
                {topEditorials.map(([k, v]) => (
                  <li key={k} style={{
                    display: "flex", justifyContent: "space-between", gap: "0.5rem",
                    padding: "0.4rem 0",
                    borderBottom: "1px solid rgba(241,231,208,0.1)",
                    color: "rgba(241,231,208,0.85)"
                  }}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
                    <span style={{ color: "var(--lij-mostaza)" }}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

window.LijWorldAtlas = LijWorldAtlas;
