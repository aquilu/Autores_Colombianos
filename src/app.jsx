/* global React, ReactDOM */
const { useState, useEffect } = window;

function Colophon({ data }) {
  return (
    <footer className="colophon">
      <div className="wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--dorado)" }}>Colofón</div>
            <h2 style={{ fontStyle: "italic", maxWidth: "18ch", marginTop: "1.5rem", color: "var(--ivory)" }}>
              Un atlas se hace para ser <span style={{ color: "var(--dorado)" }}>leído.</span>
            </h2>
            <p className="lede" style={{ marginTop: "1rem" }}>
              Toda la información de este atlas proviene de archivos en formato XLSX que registran cada par
              autor–editorial junto a su lengua, país, ciudad y obra.
            </p>
          </div>

          <div style={{ display: "grid", gap: "0.5rem", textAlign: "right", fontFamily: "var(--f-mono)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(241,231,208,0.55)" }}>
            <div>Edición A · C · MMXXVI</div>
            <div style={{ color: "var(--dorado)" }}>{fmt(data.totals.publicaciones)} pares registrados</div>
            <div>Bogotá D.C. · 04°35′N 74°04′O</div>
          </div>
        </div>

        <div className="colophon-grid">
          <div>
            <h5>Dataset</h5>
            <p>{fmt(data.totals.autores)} autores, {fmt(data.totals.editoriales)} editoriales,
              {" "}{data.totals.paises} países, {data.totals.lenguas} lenguas,
              {" "}{fmt(data.totals.publicaciones)} pares de circulación documentados.</p>
          </div>
          <div>
            <h5>Cartografía</h5>
            <p>Proyecciones realizadas en d3-geo. Cuadrículas de paralelos y meridianos
              a paso de 2° (Colombia) y 20° (mundo).</p>
          </div>
          <div>
            <h5>Tipografía</h5>
            <p>Tipografía Blaa, inspirada en las letras metálicas de la Biblioteca Luis Ángel Arango (1958).
              Diseño: Juan Pablo Fajardo · PTP, 2022.</p>
          </div>
          <div>
            <h5>Lectura</h5>
            <p>Atlas de adultos en cinco láminas; Atlas LIJ en seis voces. Pulsa cualquier autor para abrir su ficha.</p>
          </div>
        </div>

        <div style={{ marginTop: "5rem", paddingTop: "3rem", borderTop: "1px solid rgba(241,231,208,0.18)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 1.2fr", gap: "3rem" }} className="inst-footer-grid">
            <div>
              <div style={{
                fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 700,
                fontSize: "1.8rem", lineHeight: 1, color: "var(--ivory)", marginBottom: "0.4rem"
              }}>
                Red Cultural<br/>
                <span style={{ color: "var(--dorado)" }}>del Banco</span><br/>
                <span style={{ color: "var(--dorado)" }}>de la República.</span>
              </div>
              <p style={{ fontFamily: "var(--f-serif)", fontSize: "0.82rem", color: "rgba(241,231,208,0.6)", lineHeight: 1.5, marginTop: "1rem" }}>
                Este atlas se inscribe en la labor cultural del Banco de la República:
                bibliotecas, museos, archivos y publicaciones al servicio del país.
              </p>
            </div>

            <FooterColumn title="Acerca de" links={[
              ["Banrepcultural", "/acerca-de"],
              ["Banco de la República", "https://www.banrep.gov.co/"],
              ["Accesibilidad", "/accesibilidad"],
              ["Noticias", "/noticias"],
              ["Tienda de publicaciones", "https://tiendabanrep.co/"]
            ]} />
            <FooterColumn title="Información y ayuda" links={[
              ["Preguntas frecuentes", "/servicios/preguntas-frecuentes"],
              ["Mapa del sitio", "/mapa-del-sitio"],
              ["Descubridor", "https://descubridor.banrepcultural.org/"],
              ["Hazte socio", "/asociacion"],
              ["Boletín Cultural y Bibliográfico", "https://publicaciones.banrepcultural.org/index.php/boletin_cultural"]
            ]} />
            <FooterColumn title="Contacto y avisos" links={[
              ["Localización y horarios", "https://www.banrep.gov.co/donde-estamos"],
              ["Atención al ciudadano", "https://www.banrep.gov.co/atencion-ciudadano"],
              ["Aviso legal", "https://www.banrep.gov.co/aviso-legal"],
              ["Protección de datos", "https://www.banrep.gov.co/proteccion-datos-personales"]
            ]} />
          </div>

          <div style={{
            marginTop: "3rem", paddingTop: "1.5rem",
            borderTop: "1px solid rgba(241,231,208,0.12)",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem",
            fontFamily: "var(--f-mono)", fontSize: "0.65rem",
            letterSpacing: "0.18em", color: "rgba(241,231,208,0.55)"
          }}>
            <div>© 2024 Banco de la República, Colombia.</div>
            <div style={{ color: "var(--dorado)" }}>Atlas literario · Red Cultural del Banco de la República</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h5 style={{
        fontFamily: "var(--f-mono)", fontSize: "0.65rem", letterSpacing: "0.22em",
        textTransform: "uppercase", color: "var(--dorado-soft)", margin: "0 0 1rem",
        fontWeight: 500, paddingBottom: "0.6rem", borderBottom: "1px solid rgba(241,231,208,0.18)"
      }}>{title}</h5>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.55rem" }}>
        {links.map(([label, url]) => {
          const external = url.startsWith("http");
          return (
            <li key={label}>
              <a href={url}
                target={external ? "_blank" : "_self"}
                rel={external ? "noopener noreferrer" : undefined}
                style={{
                  fontFamily: "var(--f-serif)", fontSize: "0.84rem",
                  color: "rgba(241,231,208,0.78)", textDecoration: "none"
                }}>
                {label}{external ? <span style={{ marginLeft: 4, fontSize: "0.7em", color: "var(--dorado-soft)" }}>↗</span> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

window.Colophon = Colophon;

// ======= ADULT (general literature) atlas =======
function AdultApp({ data }) {
  return (
    <TipProvider>
      <SelectProvider>
        <FilterProvider>
          <Hero data={data} onExplore={() => {
            const el = document.getElementById("colombia");
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: "smooth" });
          }} />
          <CuratorialFilters data={data} />
          <AtlasColombia data={data} />
          <AtlasWorld data={data} />
          <ConnectionNetwork data={data} />
          <AuthorMural data={data} />
          <DataStory data={data} />
          <Colophon data={data} />
          <AuthorDrawer />
        </FilterProvider>
      </SelectProvider>
    </TipProvider>
  );
}

// ======= Tab nav =======
function TabBar({ active, setActive, dataAdult, dataLij }) {
  return (
    <div className="tabnav">
      <div className="wrap tabnav-inner">
        <div className="tabnav-brand">
          <span className="tabnav-mark">A · C</span>
          <span className="tabnav-label">Atlas de autores colombianos · MMXXVI</span>
        </div>
        <div className="tabnav-tabs">
          <button className={"tab-btn" + (active === "adulto" ? " active" : "")}
            onClick={() => setActive("adulto")}>
            <span className="tab-no">I · {dataAdult ? fmt(dataAdult.totals.autores) : "…"} autores</span>
            <span className="tab-name">Literatura general</span>
          </button>
          <button className={"tab-btn" + (active === "lij" ? " active" : "")}
            onClick={() => setActive("lij")}>
            <span className="tab-no">II · {dataLij ? fmt(dataLij.totals.autores) : "…"} autores</span>
            <span className="tab-name">Infantil &amp; juvenil</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ======= Root =======
function Root() {
  const [active, setActive] = useState(() => {
    const h = location.hash.replace("#", "");
    if (h === "lij" || h.startsWith("lij-")) return "lij";
    return "adulto";
  });

  // Lazy load LIJ dataset
  const [lijData, setLijData] = useState(null);
  useEffect(() => {
    if (!lijData) {
      fetch(window.__resources?.datasetLij || 'data/lij_dataset.json')
        .then(r => r.json())
        .then(d => { setLijData(d); window.DATASET_LIJ = d; })
        .catch(e => console.error("LIJ dataset error:", e));
    }
  }, []);

  // Persist active tab in hash
  useEffect(() => {
    if (window.__PRINT_MODE) return;
    if (active === "lij") {
      if (!location.hash.startsWith("#lij")) location.hash = "lij";
    } else {
      if (location.hash.startsWith("#lij") || location.hash === "#adulto") history.replaceState(null, "", location.pathname);
    }
    // scroll top on tab change
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [active]);

  const data = window.DATASET;
  if (!data) {
    return <div className="boot"><div className="boot-mark">A · C</div><div className="boot-label">cargando el atlas…</div></div>;
  }

  // PRINT MODE: render both atlases stacked, no tabs
  if (window.__PRINT_MODE) {
    if (!lijData) {
      return <div className="boot"><div className="boot-mark">A · C</div><div className="boot-label">preparando ambos atlas para impresión…</div></div>;
    }
    return (
      <>
        <div className="print-cover">
          <div className="print-cover-eyebrow">Atlas de autores colombianos · MMXXVI</div>
          <h1 className="print-cover-title">
            Palabras<br/>que cruzan<br/><em>fronteras.</em>
          </h1>
          <div className="print-cover-sub">
            Volumen I · Literatura general &nbsp;·&nbsp; Volumen II · Literatura infantil &amp; juvenil
          </div>
          <div className="print-cover-meta">
            {fmt(data.totals.autores)} + {fmt(lijData.totals.autores)} autores ·{" "}
            {fmt(data.totals.editoriales + lijData.totals.editoriales)} editoriales registradas
          </div>
        </div>

        <div className="print-volume-divider">
          <div className="print-volume-no">Vol. I</div>
          <div className="print-volume-name">Literatura general</div>
        </div>
        <AdultApp data={data} />

        <div className="print-volume-divider">
          <div className="print-volume-no">Vol. II</div>
          <div className="print-volume-name">Literatura infantil &amp; juvenil</div>
        </div>
        <LijApp data={lijData} />
      </>
    );
  }

  return (
    <>
      <TabBar active={active} setActive={setActive} dataAdult={data} dataLij={lijData} />
      {active === "adulto"
        ? <AdultApp data={data} />
        : (lijData
            ? <LijApp data={lijData} />
            : <div style={{ padding: "5rem 2rem", textAlign: "center", fontFamily: "var(--f-mono)", color: "var(--ink-soft)" }}>cargando atlas LIJ…</div>)
      }
    </>
  );
}

function boot() {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<Root />);
}

if (window.DATASET) boot();
else window.addEventListener("dataset-ready", boot);
