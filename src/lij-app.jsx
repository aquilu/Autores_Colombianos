/* global React */
const { useEffect, useState } = window;

function LijApp({ data }) {
  return (
    <TipProvider>
      <SelectProvider>
        <FilterProvider>
          <LijHero data={data} onExplore={() => {
            const el = document.getElementById("lij-voces");
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: "smooth" });
          }} />
          <LijVoces data={data} />
          <CuratorialFilters data={data} themes={data.themes} />
          <AtlasColombia data={data} />
          <LijWorldAtlas data={data} />
          <LijFerias data={data} />
          <LijCronologia />
          <ConnectionNetwork data={data} />
          <AuthorMural data={data} />
          <LijDataStory data={data} />
          <Colophon data={data} />
          <AuthorDrawer />
        </FilterProvider>
      </SelectProvider>
    </TipProvider>
  );
}

function LijDataStory({ data }) {
  // Re-use most of DataStory but with LIJ framing
  const ref = useFadeIn();

  // gender + theme stats
  const female = data.authors.filter(a => a.s === "Mujer").length;
  const male = data.authors.filter(a => a.s === "Hombre").length;
  const femalePct = Math.round(female / (female + male) * 100);

  return (
    <section className="section paper-bg" id="lij-archivo" ref={ref}>
      <div className="wrap">
        <header className="chapter">
          <div>
            <div className="chapter-no">Capítulo VI</div>
            <h2 className="chapter-title">El archivo <em className="italic">en pocas líneas</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta">
            Vista<br/>de conjunto
          </div>
        </header>        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "start", marginTop: "2rem" }}>
          <div className="story-body dropcap">
            <p>
              La literatura infantil y juvenil colombiana del primer cuarto del siglo XXI es un campo en
              florecimiento. Editoriales independientes que crecieron a partir de 2010, una fuerte presencia
              en ferias internacionales — Bolonia, Guadalajara, Frankfurt — y un giro decidido hacia el libro
              álbum, la novela gráfica y la memoria del conflicto.
            </p>
            <p>
              De los {data.totals.autores} autores y autoras que documenta este atlas, <em>{femalePct}% son mujeres</em>:
              una composición de género muy distinta a la del corpus de literatura general. Las obras circulan
              por {data.totals.paises} países en {data.totals.lenguas} lenguas, desde el coreano y el chino mandarín
              hasta el zapoteco, el náhuatl y el mixteco.
            </p>
            <p>
              <em>Ivar Da Coll, Yolanda Reyes, Irene Vasco, Claudia Rueda</em> — y muchas otras voces — han abierto
              esta literatura a circuitos globales del libro infantil. El componente visual creció con fuerza:
              {" "}<em>el libro álbum y la ilustración</em> hoy ocupan el centro del oficio. Y junto a la tradición
              oral y la mitología, se escriben nuevas raíces.
            </p>
          </div>

          <div style={{ display: "grid", gap: "2rem" }}>
            <ThemeBar data={data} />
            <LangBar data={data} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ThemeBar({ data }) {
  const themes = data.themes;
  const counts = themes.map(t => [t.label, data.authors.filter(a => a.themes.includes(t.key)).length, t.color]);
  const max = Math.max(...counts.map(c => c[1]), 1);
  return (
    <div>
      <h4 style={{
        fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: "0.22em",
        textTransform: "uppercase", color: "var(--ink-soft)", margin: "0 0 0.75rem", fontWeight: 500
      }}>Voces representadas</h4>
      <div className="bar-chart">
        {counts.map(([k, v, color]) => (
          <div className="bar-row" key={k}>
            <span className="bar-label" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(v / max) * 100}%`, background: color }} />
            </span>
            <span className="bar-count">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LangBar({ data }) {
  const counts = {};
  for (const a of data.authors) {
    for (const p of a.pubs) {
      if (!counts[p.l]) counts[p.l] = new Set();
      counts[p.l].add(a.n);
    }
  }
  const rows = Object.entries(counts).map(([k, v]) => [k, v.size]).sort((a,b) => b[1]-a[1]).slice(0, 12);
  const max = Math.max(...rows.map(r => r[1]), 1);
  return (
    <div>
      <h4 style={{
        fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: "0.22em",
        textTransform: "uppercase", color: "var(--ink-soft)", margin: "0 0 0.75rem", fontWeight: 500
      }}>Lenguas en circulación</h4>
      <div className="bar-chart">
        {rows.map(([k, v]) => (
          <div className="bar-row" key={k}>
            <span className="bar-label" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(v / max) * 100}%`, background: "var(--lij-mostaza)" }} />
            </span>
            <span className="bar-count">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.LijApp = LijApp;
