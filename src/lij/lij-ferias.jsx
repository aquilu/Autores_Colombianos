/* global React */
const { useMemo } = window;

const FAIRS = [
  { name: "Bologna", full: "Bologna Children's Book Fair", country: "Italia", since: 1964, role: "Catedral del libro infantil mundial", color: "#c63f1f" },
  { name: "Guadalajara", full: "Feria Internacional del Libro de Guadalajara", country: "México", since: 1987, role: "Capital hispana de las letras", color: "#2d5a3d" },
  { name: "Frankfurt", full: "Frankfurter Buchmesse", country: "Alemania", since: 1949, role: "Mercado global de derechos", color: "#1d324a" },
  { name: "Madrid", full: "LIBER · Feria del Libro de Madrid", country: "España", since: 1933, role: "Eje hispano-iberoamericano", color: "#d4a843" },
  { name: "Buenos Aires", full: "Feria Internacional del Libro", country: "Argentina", since: 1975, role: "Sur de la lectura latina", color: "#8a2a1c" },
  { name: "Bolonia · Cómic", full: "Lucca Comics · Angoulême", country: "Francia", since: 1974, role: "Cómic y novela gráfica", color: "#466a4f" }
];

function LijFerias({ data }) {
  const { filters, setKey } = useFilters();

  // For each fair, count visible LIJ authors who publish in that country
  const fairStats = useMemo(() => {
    const visibleAuthors = data.authors.filter(a => authorMatches(a, filters));
    return FAIRS.map(f => {
      const auths = new Set();
      const eds = new Set();
      for (const a of visibleAuthors) {
        for (const p of a.pubs) {
          if (p.p === f.country) {
            auths.add(a.n);
            eds.add(p.e);
          }
        }
      }
      return { ...f, authors: auths.size, editorials: eds.size };
    });
  }, [data.authors, filters]);

  const ref = useFadeIn();

  return (
    <section className="section paper-bg" id="lij-ferias" ref={ref}>
      <div className="wrap">
        <header className="chapter">
          <div>
            <div className="chapter-no">Capítulo IV</div>
            <h2 className="chapter-title">El año <em className="italic">de las ferias</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta">
            Circuitos<br/>internacionales
          </div>
        </header>

        <p className="lede" style={{ marginTop: "1rem", maxWidth: "62ch" }}>
          Las ferias son el cuerpo visible del oficio: allí circulan derechos, premios, catálogos. La LIJ
          colombiana entra y sale por <em>Bolonia, Guadalajara, Frankfurt, Madrid, Buenos Aires</em>. Pulsa
          una feria para filtrar el archivo por su país anfitrión.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem", marginTop: "2.5rem"
        }}>
          {fairStats.map((f, i) => {
            const active = filters.pais === f.country;
            return (
              <div key={f.name}
                className="fair-card"
                onClick={() => setKey("pais", active ? null : f.country)}
                style={{
                  background: active ? f.color : "var(--ivory)",
                  color: active ? "var(--ivory)" : "var(--ink)",
                  cursor: "pointer"
                }}>
                <div className="fair-no" style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--lij-rojo)" }}>
                  № {String(i + 1).padStart(2, "0")} · desde {f.since}
                </div>
                <h3 className="fair-name">{f.name}</h3>
                <div className="fair-meta" style={{ color: active ? "rgba(255,255,255,0.7)" : "var(--ink-soft)" }}>
                  {f.full}
                </div>
                <div style={{
                  fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "0.95rem",
                  fontWeight: 300, marginTop: "0.5rem",
                  color: active ? "rgba(255,255,255,0.85)" : "var(--ink-2)"
                }}>
                  {f.role}
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginTop: "0.8rem", paddingTop: "0.75rem",
                  borderTop: `1px solid ${active ? "rgba(255,255,255,0.3)" : "var(--rule)"}`,
                  fontFamily: "var(--f-mono)", fontSize: "0.7rem",
                  letterSpacing: "0.12em", textTransform: "uppercase"
                }}>
                  <span>
                    <strong style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "1.5rem", display: "block", lineHeight: 1 }}>
                      {f.authors}
                    </strong>
                    autores en {f.country}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    <strong style={{ fontFamily: "var(--f-display)", fontWeight: 900, fontSize: "1.5rem", display: "block", lineHeight: 1 }}>
                      {f.editorials}
                    </strong>
                    sellos
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

window.LijFerias = LijFerias;
