/* global React */
const { useMemo } = window;

const TD_ACCENTS = ["var(--td-coral)", "var(--td-teal)", "var(--td-rose)", "var(--td-leaf)", "var(--td-plum)", "var(--td-amber)"];

function TdSessions({ data }) {
  const { select } = useSelection();

  // Featured "sessions": authors with the widest international circulation
  // (most distinct countries), then most editions. Cap to 6 for a clean lineup.
  const featured = useMemo(() => {
    return [...data.authors]
      .map(a => ({
        a,
        countries: new Set(a.pubs.map(p => p.p)).size,
        editions: a.pubs.length
      }))
      .sort((x, y) => (y.countries - x.countries) || (y.editions - x.editions))
      .slice(0, 6);
  }, [data.authors]);

  // helper: derive a short setlist (libros) from the author
  const setlistOf = (a) => {
    const raw = a.libros || "";
    if (!raw) return [];
    return raw
      .split(/[;]|,\s+(?=[A-ZÁÉÍÓÚÑ¡¿])/)
      .map(s => s.trim().replace(/\s*\(\d{4}\)\s*$/, ""))
      .filter(s => s && s.length < 52)
      .slice(0, 3);
  };

  return (
    <section className="td-section paper">
      <div className="td-wrap">
        <header className="td-head">
          <div className="td-head-no">Set 01</div>
          <div>
            <h2 className="td-head-title">Sesiones <em>destacadas</em></h2>
          </div>
          <p className="td-head-lede">
            Las voces colombianas que más lejos han viajado. Cada ficha es una sesión:
            su nombre, su origen, y un breve <em>setlist</em> de obras. Pulsa para abrir la ficha completa.
          </p>
        </header>

        <div className="td-sessions">
          {featured.map(({ a, countries, editions }, i) => {
            const accent = TD_ACCENTS[i % TD_ACCENTS.length];
            const setlist = setlistOf(a);
            return (
              <article key={a.n}
                className="td-session"
                style={{ "--accent": accent }}
                onClick={() => select(a)}>
                <div className="td-session-no">Sesión № {String(i + 1).padStart(2, "0")}</div>
                <h3 className="td-session-name">{a.n}</h3>
                <div className="td-session-meta">
                  {a.c}{a.d && a.d !== "No aplica" ? ` · ${a.d}` : ""}{a.yn ? ` · ${a.yn}` : ""}
                </div>

                {setlist.length > 0 && (
                  <ul className="td-session-setlist">
                    {setlist.map((s, j) => <li key={j}>{s}</li>)}
                  </ul>
                )}

                <div className="td-session-foot">
                  <span>{countries} paí{countries === 1 ? "s" : "ses"} · {editions} edicion{editions === 1 ? "" : "es"}</span>
                  <span className="td-session-cta">Abrir ficha →</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

window.TdSessions = TdSessions;
