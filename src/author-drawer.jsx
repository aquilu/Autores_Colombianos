/* global React */
const { useEffect, useMemo } = window;

function AuthorDrawer() {
  const { selected, select } = useSelection();

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") select(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [select]);

  useEffect(() => {
    if (selected) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [selected]);

  const a = selected;

  // Aggregate pubs by country
  const byCountry = useMemo(() => {
    if (!a) return [];
    const map = {};
    for (const p of a.pubs) {
      if (!map[p.p]) map[p.p] = { p: p.p, items: [], langs: new Set() };
      map[p.p].items.push(p);
      map[p.p].langs.add(p.l);
    }
    return Object.values(map);
  }, [a]);

  // Normalize obras list across data shapes
  const obras = useMemo(() => {
    if (!a) return [];
    if (a.obras && a.obras.length) return a.obras;
    const raw = a.libros || "";
    if (!raw) return [];
    return raw.split(/[;]|,\s+(?=[A-ZÁÉÍÓÚÑ])/).map(s => s.trim()).filter(Boolean).slice(0, 12);
  }, [a]);

  // Theme labels (LIJ)
  const themeLabels = useMemo(() => {
    if (!a || !a.themes || !a.themes.length) return [];
    const ds = window.DATASET_LIJ;
    if (!ds || !ds.themes) return a.themes;
    return a.themes.map(k => ds.themes.find(t => t.key === k)).filter(Boolean);
  }, [a]);

  return (
    <>
      <div className={"drawer-overlay" + (selected ? " open" : "")} onClick={() => select(null)} />
      <aside className={"drawer" + (selected ? " open" : "")} aria-hidden={!selected}>
        {a && (
          <div className="drawer-inner">
            <button className="drawer-close" onClick={() => select(null)} aria-label="Cerrar">✕</button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--rojo)" }}>
                Ficha curatorial · {a.r}
              </div>
              <div className="sello" style={{ flexShrink: 0 }}>
                <div>
                  <div style={{ fontWeight: 500 }}>Archivo</div>
                  <div style={{ marginTop: 2 }}>A · C</div>
                </div>
              </div>
            </div>

            <header className="drawer-head">
              <h2 className="drawer-name">{a.n}</h2>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: "0.72rem", letterSpacing: "0.16em", color: "var(--ink-soft)" }}>
                {a.c} · {a.d}
                {a.yn ? <> &nbsp;·&nbsp; {a.yn}{a.ym ? `–${a.ym}` : ""}</> : null}
                {a.s ? <> &nbsp;·&nbsp; {a.s}</> : null}
              </div>
            </header>

            <p style={{ fontFamily: "var(--f-serif)", fontSize: "0.95rem", lineHeight: 1.65, color: "var(--ink-2)", marginTop: 0 }}>
              {a.bio || "Sin biografía registrada."}
            </p>

            <dl style={{ margin: "1.5rem 0 0", padding: 0 }}>
              {themeLabels.length > 0 && (
                <div className="drawer-row">
                  <dt>Voces (LIJ)</dt>
                  <dd>
                    {themeLabels.map((t, i) => (
                      <span key={t.key} style={{ marginRight: "0.4rem" }}>
                        <em style={{ color: t.color }}>{t.label}</em>{i < themeLabels.length - 1 ? "  ·  " : ""}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {a.g && a.g.length > 0 && (
                <div className="drawer-row">
                  <dt>Género literario</dt>
                  <dd>
                    {a.g.map((g, i) => (
                      <span key={g} style={{ marginRight: "0.4rem" }}>
                        <em>{g}</em>{i < a.g.length - 1 ? "  ·  " : ""}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {a.estilo && (
                <div className="drawer-row">
                  <dt>Estilo / Movimiento</dt>
                  <dd>{a.estilo}</dd>
                </div>
              )}

              {obras.length > 0 && (
                <div className="drawer-row">
                  <dt>{a.libros ? "Libros" : "Obras destacadas"}</dt>
                  <dd>
                    <ul className="drawer-list">
                      {obras.map((o, i) => <li key={i}>{o}</li>)}
                    </ul>
                  </dd>
                </div>
              )}

              {(a.premios || a.reseña) && (
                <div className="drawer-row">
                  <dt>{a.premios ? "Premios" : "Reseña curatorial"}</dt>
                  <dd>{a.premios || a.reseña}</dd>
                </div>
              )}

              {a.rel && (
                <div className="drawer-row">
                  <dt>Relevancia internacional</dt>
                  <dd><em style={{ color: "var(--rojo)" }}>{a.rel}</em>{a.relRaw && a.relRaw !== a.rel ? <span style={{ display: "block", marginTop: 4, fontSize: "0.85rem", color: "var(--ink-soft)" }}>{a.relRaw}</span> : null}</dd>
                </div>
              )}

              <div className="drawer-row">
                <dt>Circulación</dt>
                <dd>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: "0.72rem", letterSpacing: "0.12em", color: "var(--ink-soft)", marginBottom: "0.5rem" }}>
                    {byCountry.length} paí{byCountry.length === 1 ? "s" : "ses"} · {a.pubs.length} edicione{a.pubs.length === 1 ? "" : "s"} · {new Set(a.pubs.map(p => p.l)).size} lengua{new Set(a.pubs.map(p => p.l)).size === 1 ? "" : "s"}
                  </div>
                  <ul className="drawer-list" style={{ display: "grid", gap: "0.4rem" }}>
                    {byCountry.map(c => (
                      <li key={c.p}>
                        <strong style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: "1.05rem" }}>{c.p}</strong>
                        <div style={{ marginLeft: "1rem", fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                          {c.items.map((p, i) => (
                            <span key={i}>
                              {p.u ? <a href={p.u} target="_blank" rel="noreferrer" style={{ color: "var(--ink-2)", textDecoration: "underline" }}>{p.e}</a> : p.e}
                              <span style={{ fontFamily: "var(--f-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--dorado)" }}> · {p.l}</span>
                              {i < c.items.length - 1 ? " · " : ""}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>

              {a.lat != null && (
                <div className="drawer-row">
                  <dt>Coordenadas</dt>
                  <dd style={{ fontFamily: "var(--f-mono)", fontSize: "0.75rem", color: "var(--ink-soft)" }}>
                    {fmtCoord(a.lat, a.lon)}
                  </dd>
                </div>
              )}
            </dl>

            <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="serial">№ {(a.n.length + (a.yn || 0)).toString().padStart(4, "0")} — {a.v === "Vive" ? "in vivere" : "in memoriam"}</div>
              <button className="btn btn-ghost" onClick={() => select(null)}>Cerrar ficha</button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

window.AuthorDrawer = AuthorDrawer;
