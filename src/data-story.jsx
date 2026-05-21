/* global React */
const { useMemo } = window;

function DataStory({ data }) {
  // Stats from full dataset
  const stats = useMemo(() => {
    const byGenero = {};
    const bySexo = {};
    const byRel = {};
    const byLang = {};
    const byEra = { "Antes de 1900": 0, "1900–1949": 0, "1950–1979": 0, "1980–1999": 0, "2000–hoy": 0 };
    for (const a of data.authors) {
      a.g.forEach(g => byGenero[g] = (byGenero[g]||0)+1);
      bySexo[a.s] = (bySexo[a.s]||0)+1;
      byRel[a.rel] = (byRel[a.rel]||0)+1;
      for (const p of a.pubs) byLang[p.l] = (byLang[p.l]||(byLang[p.l] = new Set()));
      for (const p of a.pubs) byLang[p.l].add(a.n);
      const y = a.yn;
      if (y) {
        if (y < 1900) byEra["Antes de 1900"]++;
        else if (y < 1950) byEra["1900–1949"]++;
        else if (y < 1980) byEra["1950–1979"]++;
        else if (y < 2000) byEra["1980–1999"]++;
        else byEra["2000–hoy"]++;
      }
    }
    const lang = Object.entries(byLang).map(([k,s]) => [k, s.size]).sort((a,b) => b[1]-a[1]);
    return {
      byGenero: Object.entries(byGenero).sort((a,b) => b[1]-a[1]).slice(0, 8),
      bySexo: Object.entries(bySexo),
      byRel: Object.entries(byRel).sort((a,b) => b[1]-a[1]),
      byLang: lang.slice(0, 10),
      byEra: Object.entries(byEra)
    };
  }, [data]);

  const maxOf = (arr) => Math.max(...arr.map(x => x[1]), 1);
  const ref = useFadeIn();

  // Notable facts
  const female = stats.bySexo.find(x => x[0] === "Mujer")?.[1] || 0;
  const male = stats.bySexo.find(x => x[0] === "Hombre")?.[1] || 0;
  const femalePct = Math.round(female / (female + male) * 100);

  return (
    <section className="section paper-bg" id="archivo" ref={ref}>
      <div className="wrap">
        <header className="chapter">
          <div>
            <div className="chapter-no">Capítulo V</div>
            <h2 className="chapter-title">Vista del <em className="italic">archivo</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta">
            Lectura<br/>de datos
          </div>
        </header>

        <div className="story-grid">
          <div className="story-body dropcap">
            <p>
              El archivo cuenta {data.totals.autores.toLocaleString("es-CO")} autores nacidos en Colombia, distribuidos a lo largo de
              más de un siglo de escritura. Sus libros han atravesado {data.totals.paises} países y han sido vertidos a{" "}
              {data.totals.lenguas} lenguas, desde el <em>náhuatl</em> hasta el <em>vietnamita</em>, pasando por el coreano, el árabe
              y el euskera.
            </p>
            <p>
              España y Estados Unidos sostienen la mayor parte de la circulación —cada uno con sus propias razones de mercado—
              pero las páginas más interesantes están en los márgenes: ediciones italianas, danesas, turcas, brasileras,
              egipcias. Son las geografías inesperadas las que dicen algo sobre cómo viaja una literatura.
            </p>
            <p>
              De los {data.totals.autores} autores, <em>{femalePct}% son mujeres</em> y {100 - femalePct}% son hombres. El género
              dominante no es la novela sino una constelación de oficios entrelazados: poesía con ensayo, narrativa
              con crónica, traducción como práctica viva. Y aunque <em>Bogotá</em> concentra dos tercios del corpus,
              casi todos los departamentos tienen voz en el archivo.
            </p>
            <p style={{ fontFamily: "var(--f-mono)", fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "2rem", color: "var(--ink-soft)" }}>
              <span style={{ color: "var(--rojo)" }}>—</span> Continúa explorando: usa los filtros del gabinete superior,
              o pulsa cualquier nombre del mural para abrir su ficha.
            </p>
          </div>

          <div style={{ display: "grid", gap: "2rem" }}>
            <StatBlock title="Por género literario" rows={stats.byGenero} max={maxOf(stats.byGenero)} />
            <StatBlock title="Por época de nacimiento" rows={stats.byEra} max={maxOf(stats.byEra)} accent="var(--azul)" />
            <StatBlock title="Por lengua de circulación" rows={stats.byLang} max={maxOf(stats.byLang)} accent="var(--dorado)" />
            <StatBlock title="Por relevancia internacional" rows={stats.byRel} max={maxOf(stats.byRel)} accent="var(--selva)" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBlock({ title, rows, max, accent }) {
  return (
    <div>
      <h4 style={{
        fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: "0.22em",
        textTransform: "uppercase", color: "var(--ink-soft)", margin: "0 0 0.75rem", fontWeight: 500
      }}>{title}</h4>
      <div className="bar-chart">
        {rows.map(([k, v]) => (
          <div className="bar-row" key={k}>
            <span className="bar-label" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(v / max) * 100}%`, background: accent || "var(--rojo)" }} />
            </span>
            <span className="bar-count">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.DataStory = DataStory;
