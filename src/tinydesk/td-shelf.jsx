/* global React */
const { useMemo, useState } = window;

function TdMarquee({ data }) {
  // Build a marquee of author names
  const names = useMemo(() => {
    const arr = data.authors.map(a => a.n);
    return arr;
  }, [data.authors]);

  const line = names.join("  ✦  ");
  return (
    <div className="td-marquee" aria-hidden="true">
      <div className="td-marquee-track">
        <span>{line}</span>
        <span className="star">✦</span>
        <span>{line}</span>
      </div>
    </div>
  );
}

function TdShelf({ data }) {
  const { select } = useSelection();
  const themes = data.themes;
  const [activeTheme, setActiveTheme] = useState(null);
  const [query, setQuery] = useState("");

  const themeColors = {
    raices: "var(--td-leaf)", cotidiana: "var(--td-amber)", memoria: "var(--td-teal)",
    territorio: "var(--td-leaf)", fantastico: "var(--td-coral)", poesia: "var(--td-rose)",
    album: "var(--td-amber)", comic: "var(--td-plum)"
  };

  const visible = useMemo(() => {
    let arr = data.authors;
    if (activeTheme) arr = arr.filter(a => (a.themes || []).includes(activeTheme));
    if (query) {
      const q = query.toLowerCase();
      arr = arr.filter(a => a.n.toLowerCase().includes(q) || (a.c || "").toLowerCase().includes(q));
    }
    return [...arr].sort((a, b) => a.n.localeCompare(b.n, "es"));
  }, [data.authors, activeTheme, query]);

  return (
    <section className="td-section cream">
      <div className="td-wrap">
        <header className="td-head">
          <div className="td-head-no">Set 02</div>
          <div>
            <h2 className="td-head-title">El <em>estante</em></h2>
          </div>
          <p className="td-head-lede">
            Todo el cartel, en orden alfabético. Filtra por voz temática o busca un nombre.
            Cada lomo abre la ficha del autor o autora.
          </p>
        </header>

        <div className="td-shelf-controls">
          <button
            className={"td-chip" + (activeTheme === null ? " active" : "")}
            onClick={() => setActiveTheme(null)}>
            Todas · {data.authors.length}
          </button>
          {themes.map(t => {
            const count = data.authors.filter(a => (a.themes || []).includes(t.key)).length;
            if (!count) return null;
            return (
              <button key={t.key}
                className={"td-chip" + (activeTheme === t.key ? " active" : "")}
                onClick={() => setActiveTheme(activeTheme === t.key ? null : t.key)}>
                {t.label} · {count}
              </button>
            );
          })}
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar nombre o ciudad…"
            style={{
              marginLeft: "auto",
              border: 0,
              borderBottom: "1px solid var(--td-rule)",
              background: "transparent",
              padding: "0.5rem 0.25rem",
              fontFamily: "var(--f-display)",
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "var(--td-ink)",
              outline: "none",
              minWidth: "200px"
            }} />
        </div>

        <div className="td-shelf">
          {visible.map(a => {
            const accent = a.themes && a.themes.length ? (themeColors[a.themes[0]] || "var(--td-amber)") : "var(--td-amber)";
            const nCountries = new Set(a.pubs.map(p => p.p)).size;
            return (
              <article key={a.n}
                className="td-book"
                style={{ "--accent": accent }}
                onClick={() => select(a)}>
                <div className="td-book-name">{a.n}</div>
                <div className="td-book-meta">
                  {a.c}{a.yn ? ` · ${a.yn}` : ""}
                </div>
                <div className="td-book-tags">
                  <span className="td-book-tag">{nCountries} paí{nCountries === 1 ? "s" : "ses"}</span>
                  <span className="td-book-tag">{a.pubs.length} edic.</span>
                </div>
              </article>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div style={{
            padding: "3rem", textAlign: "center",
            fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "1.3rem",
            color: "var(--td-coffee)", opacity: 0.7
          }}>
            No hay autores en esta combinación. Prueba otra voz o limpia la búsqueda.
          </div>
        )}

        <div style={{
          marginTop: "2rem",
          fontFamily: "var(--f-mono)", fontSize: "0.66rem",
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--td-coffee)", opacity: 0.7
        }}>
          {visible.length} de {data.authors.length} autores en cartel
        </div>
      </div>
    </section>
  );
}

window.TdShelf = TdShelf;
window.TdMarquee = TdMarquee;
