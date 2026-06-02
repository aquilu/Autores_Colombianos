/* global React */
const { useMemo } = window;

function TdProgram({ data }) {
  const { select } = useSelection();
  const themes = data.themes;

  const themeColors = {
    raices: "var(--td-leaf)", cotidiana: "var(--td-amber)", memoria: "var(--td-teal)",
    territorio: "var(--td-leaf)", fantastico: "var(--td-coral)", poesia: "var(--td-rose)",
    album: "var(--td-amber)", comic: "var(--td-plum)"
  };

  const program = useMemo(() => {
    return themes.map(t => {
      const auths = data.authors.filter(a => (a.themes || []).includes(t.key));
      // pick up to 3 "headliners" by editions
      const headliners = [...auths]
        .sort((a, b) => b.pubs.length - a.pubs.length)
        .slice(0, 3);
      return { t, count: auths.length, headliners };
    }).filter(p => p.count > 0);
  }, [data.authors, themes]);

  return (
    <section className="td-section dark">
      <div className="td-wrap">
        <header className="td-head">
          <div className="td-head-no" style={{ color: "var(--td-amber-soft)" }}>Programa</div>
          <div>
            <h2 className="td-head-title">Ocho <em style={{ color: "var(--td-amber)" }}>actos</em></h2>
          </div>
          <p className="td-head-lede">
            El repertorio de la LIJ colombiana, ordenado por voz temática. Cada acto trae
            sus cabezas de cartel; pulsa un nombre para escucharlo de cerca.
          </p>
        </header>

        <div style={{ display: "grid", gap: "0" }}>
          {program.map((p, i) => {
            const accent = themeColors[p.t.key] || "var(--td-amber)";
            return (
              <div key={p.t.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1.1fr) minmax(0, 1.4fr) auto",
                  gap: "1.5rem",
                  alignItems: "center",
                  padding: "1.5rem 0",
                  borderTop: "1px solid rgba(246,236,216,0.14)",
                  borderBottom: i === program.length - 1 ? "1px solid rgba(246,236,216,0.14)" : "none"
                }}
                className="td-program-row">
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: "0.7rem",
                  letterSpacing: "0.2em", color: accent, minWidth: "3rem"
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div>
                  <div style={{
                    fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 700,
                    fontSize: "1.5rem", lineHeight: 1.05, color: "var(--td-cream)"
                  }}>
                    {p.t.label}
                  </div>
                  <div style={{
                    fontFamily: "var(--f-serif)", fontSize: "0.9rem",
                    color: "rgba(246,236,216,0.6)", marginTop: "0.2rem"
                  }}>
                    {p.t.subtitle}
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {p.headliners.map(a => (
                    <button key={a.n}
                      onClick={() => select(a)}
                      style={{
                        fontFamily: "var(--f-sans)", fontSize: "0.82rem",
                        padding: "0.35rem 0.7rem",
                        background: "transparent",
                        border: "1px solid rgba(246,236,216,0.25)",
                        color: "var(--td-cream)",
                        cursor: "pointer",
                        borderRadius: "999px",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = accent; e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = "var(--td-night)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(246,236,216,0.25)"; e.currentTarget.style.color = "var(--td-cream)"; }}>
                      {a.n}
                    </button>
                  ))}
                </div>

                <div style={{
                  fontFamily: "var(--f-display)", fontWeight: 900, fontStyle: "italic",
                  fontSize: "2rem", color: accent, textAlign: "right", minWidth: "3rem"
                }}>
                  {p.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

window.TdProgram = TdProgram;
