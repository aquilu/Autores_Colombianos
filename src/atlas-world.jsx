/* global React, d3, topojson */
const { useEffect, useRef, useState, useMemo } = window;

function AtlasWorld({ data }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const { show, hide } = useTip();
  const { setKey, filters } = useFilters();
  const [size, setSize] = useState({ w: 1000, h: 540 });
  const [highlight, setHighlight] = useState(null); // country code

  // filter authors
  const visibleAuthors = useMemo(() => data.authors.filter(a => authorMatches(a, filters)), [data.authors, filters]);

  // re-aggregate countries from filtered authors
  const countryData = useMemo(() => {
    const map = {};
    for (const a of visibleAuthors) {
      for (const p of a.pubs) {
        if (!map[p.p]) {
          const c = data.countries.find(x => x.name === p.p);
          map[p.p] = { name: p.p, lat: c?.lat || 0, lon: c?.lon || 0, authors: new Set(), editorials: new Set(), languages: new Set() };
        }
        map[p.p].authors.add(a.n);
        map[p.p].editorials.add(p.e);
        map[p.p].languages.add(p.l);
      }
    }
    return Object.values(map).map(d => ({ ...d, authors: [...d.authors], editorials: [...d.editorials], languages: [...d.languages], count: d.authors.size || [...d.authors].length }));
  }, [visibleAuthors, data.countries]);

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
    let cancelled = false;

    const w = size.w, h = size.h;
    const proj = d3.geoEquirectangular()
      .scale(w / (2 * Math.PI) * 1.05)
      .translate([w * 0.5, h * 0.52]);
    const path = d3.geoPath(proj);

    const bogota = proj([-74.0721, 4.7110]);

    // graticule
    const grat = d3.geoGraticule().step([20, 20]);
    svg.append("path")
      .datum(grat())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(241,231,208,0.08)")
      .attr("stroke-width", 0.4);

    // equator and tropic lines
    [-23.5, 0, 23.5].forEach(lat => {
      const p1 = proj([-180, lat]);
      const p2 = proj([180, lat]);
      svg.append("line")
        .attr("x1", p1[0]).attr("y1", p1[1])
        .attr("x2", p2[0]).attr("y2", p2[1])
        .attr("stroke", "rgba(241,231,208,0.18)")
        .attr("stroke-width", lat === 0 ? 0.7 : 0.4)
        .attr("stroke-dasharray", lat === 0 ? "" : "2,3");
    });

    loadWorld().then(world => {
      if (cancelled) return;
      const countries = topojson.feature(world, world.objects.countries).features;
      const cMap = {};
      for (const c of countries) cMap[c.properties.name] = c;

      // ES name -> EN name
      const esEnMap = {
        "Estados Unidos": "United States of America",
        "Brasil": "Brazil", "Argentina": "Argentina", "Perú": "Peru", "Chile": "Chile",
        "México": "Mexico", "Costa Rica": "Costa Rica", "Uruguay": "Uruguay", "Bolivia": "Bolivia",
        "Venezuela": "Venezuela", "Ecuador": "Ecuador", "Canadá": "Canada",
        "Guatemala": "Guatemala", "Puerto Rico": "Puerto Rico", "Francia": "France",
        "Reino Unido": "United Kingdom", "Hungría": "Hungary", "España": "Spain",
        "Italia": "Italy", "Serbia": "Republic of Serbia", "Polonia": "Poland",
        "Grecia": "Greece", "Portugal": "Portugal", "Bélgica": "Belgium",
        "República Checa": "Czech Republic", "Países Bajos": "Netherlands",
        "Noruega": "Norway", "Alemania": "Germany", "Finlandia": "Finland",
        "Dinamarca": "Denmark", "Turquía": "Turkey", "Austria": "Austria",
        "Suecia": "Sweden", "Suiza": "Switzerland", "Rumania": "Romania",
        "Mónaco": "Monaco", "Estonia": "Estonia", "Croacia": "Croatia",
        "Letonia": "Latvia", "Eslovenia": "Slovenia", "Albania": "Albania",
        "Macedonia del Norte": "Macedonia", "Eslovaquia": "Slovakia", "Bulgaria": "Bulgaria",
        "China": "China", "Corea": "South Korea", "Israel": "Israel",
        "Rusia": "Russia", "Líbano": "Lebanon", "Arabia Saudita": "Saudi Arabia",
        "India": "India", "Japón": "Japan", "Irán": "Iran",
        "Pakistán": "Pakistan", "Vietnam": "Vietnam", "Indonesia": "Indonesia",
        "Egipto": "Egypt", "Australia": "Australia"
      };

      // Reverse: EN name -> publication country data
      const cdataByEn = {};
      const maxC = d3.max(countryData, d => d.count) || 1;
      const colScale = d3.scaleSqrt().domain([1, maxC]).range([0.12, 0.62]);
      for (const c of countryData) {
        const en = esEnMap[c.name];
        if (en) cdataByEn[en] = c;
      }

      // SINGLE pass: color every country by its role
      const fg = svg.append("g");
      fg.selectAll("path.country")
        .data(countries)
        .join("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("fill", d => {
          if (d.id === "170") return "rgba(138,42,28,0.7)";
          const c = cdataByEn[d.properties.name];
          if (c) return `rgba(181,139,58,${colScale(c.count)})`;
          return "rgba(241,231,208,0.05)";
        })
        .attr("stroke", d => {
          if (d.id === "170") return "var(--dorado)";
          if (cdataByEn[d.properties.name]) return "rgba(181,139,58,0.7)";
          return "rgba(241,231,208,0.15)";
        })
        .attr("stroke-width", d => (d.id === "170" || cdataByEn[d.properties.name]) ? 0.6 : 0.3);

      // Bogotá origin
      svg.append("circle")
        .attr("cx", bogota[0]).attr("cy", bogota[1])
        .attr("r", 4).attr("fill", "var(--rojo)").attr("stroke", "var(--ivory)").attr("stroke-width", 0.5);
      svg.append("text")
        .attr("x", bogota[0] - 8).attr("y", bogota[1] + 16)
        .attr("class", "svg-text-mono")
        .attr("fill", "var(--ivory)")
        .style("font-size", "9px")
        .attr("text-anchor", "end")
        .text("BOGOTÁ");

      // Arcs to each country
      const rScale = d3.scaleSqrt().domain([1, maxC]).range([0.6, 3]);

      countryData.forEach((c, i) => {
        const pt = proj([c.lon, c.lat]);
        if (!pt) return;

        const d = arcPath(bogota[0], bogota[1], pt[0], pt[1], 0.28);
        const stroke = c.count > 30 ? "var(--dorado)" : "var(--rojo)";

        const p = svg.append("path")
          .attr("d", d)
          .attr("fill", "none")
          .attr("stroke", stroke)
          .attr("stroke-width", rScale(c.count))
          .attr("opacity", 0)
          .attr("data-country", c.name)
          .attr("stroke-linecap", "round");

        const totalLen = p.node().getTotalLength();
        p.attr("stroke-dasharray", `${totalLen} ${totalLen}`)
         .attr("stroke-dashoffset", totalLen)
         .transition()
         .delay(i * 30)
         .duration(1500)
         .ease(d3.easeCubicOut)
         .attr("opacity", 0.5)
         .attr("stroke-dashoffset", 0);

        // dest dot
        const dot = svg.append("circle")
          .attr("cx", pt[0]).attr("cy", pt[1])
          .attr("r", 0)
          .attr("fill", "var(--dorado)")
          .attr("stroke", "var(--ivory)").attr("stroke-width", 0.5)
          .style("cursor", "pointer");

        dot.transition().delay(700 + i * 30).duration(500)
          .attr("r", 1.8 + rScale(c.count) * 1.4);

        const hot = svg.append("circle")
          .attr("cx", pt[0]).attr("cy", pt[1])
          .attr("r", 16).attr("fill", "transparent")
          .style("cursor", "pointer")
          .on("mouseenter", function(ev) {
            const html = `
              <div class="tip-sub">${c.editorials.length} editorial${c.editorials.length !== 1 ? "es" : ""} · ${c.languages.length} lengua${c.languages.length !== 1 ? "s" : ""}</div>
              <div class="tip-title">${escapeHtml(c.name)}</div>
              <div class="tip-row">${c.count} autor${c.count !== 1 ? "es" : ""} colombiano${c.count !== 1 ? "s" : ""} publicado${c.count !== 1 ? "s" : ""}</div>
              <div class="tip-row" style="opacity:0.7;margin-top:0.4rem;">${c.editorials.slice(0,4).map(e => escapeHtml(e)).join(" · ")}${c.editorials.length > 4 ? "…" : ""}</div>
            `;
            show(html, ev.clientX, ev.clientY);
            // highlight arc
            svg.selectAll("[data-country]")
              .attr("opacity", function() {
                return d3.select(this).attr("data-country") === c.name ? 1 : 0.08;
              })
              .attr("stroke", function() {
                return d3.select(this).attr("data-country") === c.name ? "var(--dorado)" : stroke;
              });
          })
          .on("mousemove", function(ev) { show(null, ev.clientX, ev.clientY); })
          .on("mouseleave", function() {
            hide();
            svg.selectAll("[data-country]").attr("opacity", 0.5).attr("stroke", function() {
              const cc = d3.select(this).attr("data-country");
              const cd = countryData.find(x => x.name === cc);
              return cd && cd.count > 30 ? "var(--dorado)" : "var(--rojo)";
            });
          })
          .on("click", () => setKey("pais", filters.pais === c.name ? null : c.name));
      });
    });

    return () => { cancelled = true; };
  }, [size, countryData, filters.pais, setKey]);

  const topCountries = useMemo(() => [...countryData].sort((a,b) => b.count - a.count).slice(0, 14), [countryData]);
  const topLangs = useMemo(() => {
    const counts = {};
    for (const a of visibleAuthors) {
      for (const p of a.pubs) counts[p.l] = (counts[p.l] || new Set());
      for (const p of a.pubs) counts[p.l].add(a.n);
    }
    return Object.entries(counts).map(([k,v]) => [k, v.size]).sort((a,b) => b[1]-a[1]).slice(0, 12);
  }, [visibleAuthors]);

  const ref = useFadeIn();

  return (
    <section className="section ink-bg" id="mundo" ref={ref}>
      <div className="wrap">
        <header className="chapter" style={{ borderBottomColor: "rgba(241,231,208,0.18)" }}>
          <div>
            <div className="chapter-no" style={{ color: "var(--dorado-soft)" }}>Capítulo II</div>
            <h2 className="chapter-title" style={{ color: "var(--ivory)" }}>El viaje de <em className="italic" style={{ color: "var(--dorado)" }}>la página</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta" style={{ color: "rgba(241,231,208,0.6)" }}>
            Circulación<br/>editorial
          </div>
        </header>

        <p className="lede" style={{ color: "rgba(241,231,208,0.75)", marginTop: "1rem", marginBottom: "2rem" }}>
          Líneas tendidas desde Bogotá hacia los países donde la obra de los autores colombianos
          se imprime, se traduce y se lee. La intensidad del trazo crece con el volumen.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 280px", gap: "3rem", alignItems: "start" }}>
          <div ref={wrapRef} style={{
            position: "relative",
            border: "1px solid rgba(241,231,208,0.2)",
            background: "linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.0))",
            aspectRatio: "16 / 10",
            overflow: "hidden"
          }}>
            <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="xMidYMid meet" />
            <div style={{
              position: "absolute", top: "1rem", left: "1.25rem",
              fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.18em",
              color: "rgba(241,231,208,0.55)"
            }}>Lámina II · proyección equidistante cilíndrica</div>
            <div style={{
              position: "absolute", bottom: "1rem", right: "1.25rem",
              fontFamily: "var(--f-mono)", fontSize: "0.6rem", letterSpacing: "0.18em",
              color: "rgba(241,231,208,0.55)"
            }}>{countryData.length} países · {visibleAuthors.length} autores</div>
          </div>

          <aside style={{ color: "rgba(241,231,208,0.8)" }}>
            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{
                fontFamily: "var(--f-mono)", fontSize: "0.7rem", letterSpacing: "0.22em",
                textTransform: "uppercase", color: "var(--dorado-soft)", margin: "0 0 0.8rem"
              }}>Países por volumen</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontFamily: "var(--f-mono)", fontSize: "0.72rem" }}>
                {topCountries.map(c => {
                  const active = filters.pais === c.name;
                  return (
                    <li key={c.name}
                        onClick={() => setKey("pais", active ? null : c.name)}
                        style={{
                          display: "flex", justifyContent: "space-between", gap: "0.5rem",
                          padding: "0.45rem 0",
                          borderBottom: "1px solid rgba(241,231,208,0.1)",
                          cursor: "pointer",
                          color: active ? "var(--dorado)" : "rgba(241,231,208,0.85)"
                        }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      <span style={{ color: "var(--dorado)" }}>{c.count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h4 style={{
                fontFamily: "var(--f-mono)", fontSize: "0.7rem", letterSpacing: "0.22em",
                textTransform: "uppercase", color: "var(--dorado-soft)", margin: "0 0 0.8rem"
              }}>Lenguas de circulación</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontFamily: "var(--f-mono)", fontSize: "0.72rem" }}>
                {topLangs.map(([k, v]) => {
                  const active = filters.lengua === k;
                  return (
                    <li key={k}
                        onClick={() => setKey("lengua", active ? null : k)}
                        style={{
                          display: "flex", justifyContent: "space-between", gap: "0.5rem",
                          padding: "0.45rem 0",
                          borderBottom: "1px solid rgba(241,231,208,0.1)",
                          cursor: "pointer",
                          color: active ? "var(--dorado)" : "rgba(241,231,208,0.85)"
                        }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
                      <span style={{ color: "var(--dorado)" }}>{v}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

window.AtlasWorld = AtlasWorld;
