/* global React, d3 */
const { useEffect, useRef, useState, useMemo } = window;

function HeroAtlas({ data }) {
  const svgRef = useRef(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });

  // Animated arcs from Bogotá to a curated set of world destinations
  const samples = useMemo(() => {
    const bogota = [4.7110, -74.0721];
    // Pick top 14 publication countries by author count
    const tops = [...data.countries].sort((a, b) => b.count - a.count).slice(0, 18);
    return { bogota, tops };
  }, [data]);

  useEffect(() => {
    const measure = () => {
      const el = svgRef.current?.parentElement;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(400, r.width), h: Math.max(400, r.height) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (svgRef.current?.parentElement) ro.observe(svgRef.current.parentElement);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = size.w;
    const h = size.h;

    const proj = d3.geoEquirectangular()
      .scale(w / (2 * Math.PI) * 1.05)
      .translate([w * 0.5, h * 0.5]);

    // background subtle grid (meridians/parallels) — engraved feel
    const grid = svg.append("g").attr("opacity", 0.18);
    const graticule = d3.geoGraticule().step([20, 20]);
    grid.append("path")
      .datum(graticule())
      .attr("d", d3.geoPath(proj))
      .attr("fill", "none")
      .attr("stroke", "rgba(20,17,13,0.6)")
      .attr("stroke-width", 0.4);

    // dotted equator + tropics
    [-23.5, 0, 23.5].forEach(lat => {
      const p1 = proj([-180, lat]);
      const p2 = proj([180, lat]);
      svg.append("line")
        .attr("x1", p1[0]).attr("y1", p1[1])
        .attr("x2", p2[0]).attr("y2", p2[1])
        .attr("stroke", "rgba(20,17,13,0.3)")
        .attr("stroke-width", lat === 0 ? 0.6 : 0.4)
        .attr("stroke-dasharray", lat === 0 ? "" : "2,3")
        .attr("opacity", 0.6);
    });

    // load world topojson
    let cancelled = false;
    const timeouts = [];
    const rafs = [];
    fetch(window.__resources?.worldAtlas || "https://unpkg.com/world-atlas@2.0.2/countries-110m.json")
      .then(r => r.json())
      .then(world => {
        if (cancelled) return;
        const path = d3.geoPath(proj);
        const countries = topojson.feature(world, world.objects.countries);
        svg.append("g")
          .selectAll("path")
          .data(countries.features)
          .join("path")
          .attr("d", path)
          .attr("fill", "rgba(20,17,13,0.08)")
          .attr("stroke", "rgba(20,17,13,0.32)")
          .attr("stroke-width", 0.5);

        drawArcs();
      })
      .catch(() => { if (!cancelled) drawArcs(); });

    function drawArcs() {
      const [bLat, bLon] = samples.bogota;
      const bp = proj([bLon, bLat]);

      // Bogotá marker
      const orig = svg.append("g");
      orig.append("circle")
        .attr("cx", bp[0]).attr("cy", bp[1])
        .attr("r", 5)
        .attr("fill", "var(--rojo)");
      orig.append("circle")
        .attr("cx", bp[0]).attr("cy", bp[1])
        .attr("r", 12)
        .attr("fill", "none")
        .attr("stroke", "var(--rojo)")
        .attr("stroke-width", 1)
        .attr("opacity", 0.4);
      // halos
      orig.append("circle")
        .attr("cx", bp[0]).attr("cy", bp[1])
        .attr("r", 4).attr("fill", "none")
        .attr("stroke", "var(--rojo)").attr("stroke-width", 1)
        .attr("opacity", 0.8)
        .append("animate").attr("attributeName", "r").attr("from", 4).attr("to", 26).attr("dur", "4s").attr("repeatCount", "indefinite");

      const arcsG = svg.append("g");
      samples.tops.forEach((c, i) => {
        const pt = proj([c.lon, c.lat]);
        if (!pt) return;

        const d = arcPath(bp[0], bp[1], pt[0], pt[1], 0.22);
        const len = c.count;
        const p = arcsG.append("path")
          .attr("d", d)
          .attr("fill", "none")
          .attr("stroke", "var(--rojo)")
          .attr("stroke-width", 0.6 + Math.min(1.4, len / 200))
          .attr("opacity", 0)
          .attr("stroke-linecap", "round");

        const totalLen = p.node().getTotalLength();
        p.attr("stroke-dasharray", `${totalLen} ${totalLen}`)
         .attr("stroke-dashoffset", totalLen)
         .transition()
         .delay(400 + i * 80)
         .duration(1800)
         .ease(d3.easeCubicOut)
         .attr("opacity", 0.55)
         .attr("stroke-dashoffset", 0);

        // destination dot
        arcsG.append("circle")
          .attr("cx", pt[0]).attr("cy", pt[1])
          .attr("r", 0)
          .attr("fill", "var(--ink)")
          .transition()
          .delay(900 + i * 80)
          .duration(600)
          .attr("r", 1.4 + Math.min(3, len / 120));

        // running spark along arc
        const spark = arcsG.append("circle")
          .attr("r", 1.8)
          .attr("fill", "var(--dorado)")
          .attr("opacity", 0);

        const animate = () => {
          if (cancelled) return;
          spark.attr("opacity", 1);
          const t0 = performance.now();
          const dur = 4500 + (i % 5) * 600;
          function frame(t) {
            if (cancelled) return;
            const k = ((t - t0) / dur) % 1;
            const pos = p.node().getPointAtLength(k * totalLen);
            spark.attr("cx", pos.x).attr("cy", pos.y).attr("opacity", k < 0.05 || k > 0.95 ? 0 : 0.95);
            const id = requestAnimationFrame(frame);
            rafs.push(id);
          }
          const id = requestAnimationFrame(frame);
          rafs.push(id);
        };
        timeouts.push(setTimeout(animate, 2400 + i * 200));
      });
    }
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
      rafs.forEach(cancelAnimationFrame);
    };
  }, [samples, size]);

  return (
    <svg
      ref={svgRef}
      className="hero-canvas"
      width="100%"
      height="100%"
      viewBox={`0 0 ${size.w} ${size.h}`}
      preserveAspectRatio="xMidYMid slice"
    />
  );
}

function Hero({ data, onExplore }) {
  return (
    <section className="hero paper-bg">
      <HeroAtlas data={data} />

      <div className="wrap hero-top" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-mark">
          <span style={{ color: "var(--rojo)" }}>—</span> A/C <em>·</em> <span style={{ fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-soft)" }}>Atlas literario</span>
        </div>
        <nav className="hero-nav">
          <a href="#colombia">Colombia</a>
          <a href="#mundo">El mundo</a>
          <a href="#red">Red</a>
          <a href="#mural">Mural</a>
          <a href="#archivo">Archivo</a>
        </nav>
      </div>

      <div className="wrap hero-body" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero-title">
          <div className="eyebrow" style={{ marginBottom: "1.5rem" }}>Edición curatorial · MMXXVI</div>
          <h1>
            <span className="italic">Palabras</span><br/>
            que <em className="italic">cruzan</em><br/>
            fronteras<span style={{ color: "var(--rojo)" }}>.</span>
          </h1>
          <p className="hero-sub" style={{ marginTop: "2rem" }}>
            Un atlas vivo de <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{fmt(data.totals.autores)}</strong> autores nacidos en Colombia
            y de las <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{fmt(data.totals.editoriales)}</strong> editoriales que llevan
            su obra a <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{data.totals.paises}</strong> países y <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{data.totals.lenguas}</strong> lenguas.
          </p>
        </div>

        <div className="hero-meta">
          <div>
            <div className="hero-stat-n">{fmt(data.totals.autores)}</div>
            <div className="hero-stat-l">autores cartografiados</div>
          </div>
          <div>
            <div className="hero-stat-n">{fmt(data.totals.editoriales)}</div>
            <div className="hero-stat-l">editoriales registradas</div>
          </div>
          <div>
            <div className="hero-stat-n">{data.totals.paises}</div>
            <div className="hero-stat-l">países de circulación</div>
          </div>
          <div>
            <div className="hero-stat-n">{data.totals.lenguas}</div>
            <div className="hero-stat-l">lenguas de traducción</div>
          </div>
        </div>
      </div>

      <div className="wrap hero-bottom" style={{ position: "relative", zIndex: 2 }}>
        <div className="coord-line">
          <span>04°35′N · 74°04′O</span>
          <span style={{ color: "var(--rojo)" }}>◇</span>
          <span>Bogotá D.C. — punto cero del atlas</span>
        </div>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={onExplore}>
            Explorar el atlas <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>→</span>
          </button>
          <a className="btn btn-ghost" href="#archivo">Leer el archivo</a>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
