/* global React */
const { useMemo } = window;

function LijVoces({ data }) {
  const { filters, setKey } = useFilters();
  const themes = data.themes;

  const counts = useMemo(() => {
    const m = {};
    for (const a of data.authors) {
      for (const t of a.themes) m[t] = (m[t] || 0) + 1;
    }
    return m;
  }, [data.authors]);

  const ref = useFadeIn();

  return (
    <section className="section paper-bg" id="lij-voces" ref={ref}>
      <div className="wrap">
        <header className="chapter">
          <div>
            <div className="chapter-no">Capítulo I</div>
            <h2 className="chapter-title">Las ocho voces <em className="italic">del oficio</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta">
            Ejes temáticos<br/>de la LIJ
          </div>
        </header>

        <p className="lede" style={{ marginTop: "1rem", maxWidth: "62ch" }}>
          La LIJ colombiana de este siglo no se entiende sin sus ocho registros: desde la <em>tradición oral</em> y
          la <em>memoria</em>, hasta el <em>libro álbum</em> y la <em>novela gráfica</em>. Cada uno es una puerta
          al archivo; pulsa para entrar.
        </p>

        <div className="voces-grid">
          {themes.map((t, i) => {
            const active = filters.theme === t.key;
            return (
              <div key={t.key}
                className={"voz-cell" + (active ? " active" : "")}
                onClick={() => setKey("theme", active ? null : t.key)}>
                <div className="voz-no">Voz {String(i + 1).padStart(2, "0")} / 08</div>
                <div>
                  <h3 className="voz-name">{t.label}</h3>
                  <div className="voz-sub">{t.subtitle}</div>
                </div>
                <div className="voz-stat">
                  <span className="voz-stat-n">{counts[t.key] || 0}</span>
                  <span className="voz-stat-l">autores / autoras</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="marginalia" style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--rule)" }}>
          <span style={{ color: "var(--lij-rojo)" }}>◇</span>  La clasificación se hace por análisis temático sobre las
          biografías, libros y reseñas de cada autor. Un mismo autor puede inscribirse en varias voces.
        </div>
      </div>
    </section>
  );
}

window.LijVoces = LijVoces;
