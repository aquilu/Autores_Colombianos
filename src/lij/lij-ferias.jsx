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

  // Totales ABSOLUTOS por feria — NO dependen de los filtros activos,
  // para que el número nunca cambie al hacer clic y no genere confusión.
  const fairStats = useMemo(() => {
    return FAIRS.map(f => {
      const auths = new Set();
      const eds = new Set();
      for (const a of data.authors) {
        for (const p of a.pubs) {
          if (p.p === f.country) {
            auths.add(a.n);
            eds.add(p.e);
          }
        }
      }
      return { ...f, authors: auths.size, editorials: eds.size };
    });
  }, [data.authors]);

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
          colombiana entra y sale por <em>Bolonia, Guadalajara, Frankfurt, Madrid, Buenos Aires</em>. Cada
          tarjeta muestra cuántos autores y sellos colombianos publican en el país anfitrión.
        </p>
        <p className="marginalia" style={{ marginTop: "0.75rem" }}>
          <span style={{ color: "var(--lij-rojo)" }}>◇</span>  Pulsa una tarjeta para resaltar ese país
          en los mapas y la red. Las cifras de cada tarjeta no cambian: son siempre el total del país.
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
                <div style={{
                  marginTop: "0.85rem",
                  fontFamily: "var(--f-mono)", fontSize: "0.6rem",
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: active ? "var(--ivory)" : "var(--ink-soft)",
                  opacity: active ? 1 : 0.7,
                  display: "flex", alignItems: "center", gap: "0.4rem"
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: active ? "var(--ivory)" : "transparent",
                    border: `1px solid ${active ? "var(--ivory)" : "var(--ink-soft)"}`,
                    display: "inline-block", flexShrink: 0
                  }} />
                  {active ? "Resaltando en el atlas — pulsa para quitar" : "Pulsa para resaltar en el atlas"}
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
