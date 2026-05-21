/* global React */
const { useState, useMemo } = window;

function CuratorialFilters({ data, themes }) {
  const { filters, setKey, reset } = useFilters();
  const [open, setOpen] = useState(false);

  // Curated options
  const opts = useMemo(() => {
    const counts = (key, accessor) => {
      const m = {};
      for (const a of data.authors) {
        const v = accessor(a);
        if (Array.isArray(v)) {
          for (const x of v) if (x) m[x] = (m[x]||0)+1;
        } else if (v) m[v] = (m[v]||0)+1;
      }
      return Object.entries(m).sort((a,b) => b[1]-a[1]);
    };
    const langCounts = {};
    const countryCounts = {};
    for (const a of data.authors) {
      for (const p of a.pubs) {
        langCounts[p.l] = (langCounts[p.l]||0)+1;
        countryCounts[p.p] = (countryCounts[p.p]||0)+1;
      }
    }
    return {
      region: counts("r", a => a.r),
      depto: counts("d", a => a.d).filter(([k]) => k && k !== "No aplica").slice(0, 18),
      genero: counts("g", a => a.g),
      sexo: counts("s", a => a.s),
      relevancia: [["Máxima",0],["Muy alta",0],["Alta",0],["Media-alta",0],["Media",0]].map(([k]) => [k, counts("rel", a => a.rel).find(x => x[0]===k)?.[1] || 0]),
      lengua: Object.entries(langCounts).sort((a,b) => b[1]-a[1]).slice(0, 14),
      pais: Object.entries(countryCounts).sort((a,b) => b[1]-a[1]).slice(0, 18),
      theme: themes ? themes.map(t => [t.label, data.authors.filter(a => (a.themes || []).includes(t.key)).length, t.key]) : null
    };
  }, [data, themes]);

  const activeCount = Object.values(filters).filter(v => v && v !== "").length;

  const visibleCount = useMemo(() => data.authors.filter(a => authorMatches(a, filters)).length, [data.authors, filters]);

  return (
    <div className="filter-rail" id="filtros">
      <div className="wrap filter-rail-inner">
        <span className="filter-rail-title">Filtros curatoriales</span>
        <button className="pill" onClick={() => setOpen(o => !o)} style={{ borderColor: "var(--ink)", color: "var(--ink)" }}>
          {open ? "Cerrar gabinete ✕" : "Abrir gabinete ⌐"}
        </button>

        {/* Active filter chips */}
        {Object.entries(filters).map(([k, v]) => {
          if (!v) return null;
          return (
            <span key={k} className="pill active" onClick={() => setKey(k, k === "search" ? "" : null)}>
              <span style={{ opacity: 0.65 }}>{labelFor(k)}:</span> {v} <span className="x">✕</span>
            </span>
          );
        })}

        {activeCount > 0 && (
          <button className="pill" onClick={reset} style={{ borderColor: "var(--rojo)", color: "var(--rojo)" }}>
            Limpiar todo
          </button>
        )}

        <span className="filter-rail-counts">
          <strong>{visibleCount}</strong> / {data.totals.autores} autores · <strong>{Object.keys(filters).filter(k => filters[k]).length}</strong> filtros activos
        </span>
      </div>

      {open && (
        <div className="wrap curat-panel" style={{ borderTop: "1px solid var(--rule)", marginTop: "0.75rem", paddingTop: "1.25rem", paddingBottom: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem 2.5rem" }}>
            <FilterGroup title="Búsqueda libre" k="search" type="text" filters={filters} setKey={setKey} />
            {opts.theme && <FilterGroup title="Voz temática (LIJ)" k="theme" opts={opts.theme.map(([label,c,key]) => [key,c,label])} valueLabels filters={filters} setKey={setKey} />}
            <FilterGroup title="Región" k="region" opts={opts.region} filters={filters} setKey={setKey} />
            <FilterGroup title="Departamento" k="depto" opts={opts.depto} filters={filters} setKey={setKey} />
            {opts.genero.length > 0 && <FilterGroup title="Género literario" k="genero" opts={opts.genero} filters={filters} setKey={setKey} />}
            <FilterGroup title="Sexo" k="sexo" opts={opts.sexo} filters={filters} setKey={setKey} />
            {opts.relevancia.some(r => r[1] > 0) && <FilterGroup title="Relevancia internacional" k="relevancia" opts={opts.relevancia} filters={filters} setKey={setKey} />}
            <FilterGroup title="Lengua de publicación" k="lengua" opts={opts.lengua} filters={filters} setKey={setKey} />
            <FilterGroup title="País de publicación" k="pais" opts={opts.pais} filters={filters} setKey={setKey} />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, k, opts, type, valueLabels, filters, setKey }) {
  if (type === "text") {
    return (
      <div className="curat-group">
        <h4>{title}</h4>
        <input
          type="text"
          value={filters[k] || ""}
          onChange={e => setKey(k, e.target.value)}
          placeholder="Nombre, ciudad o editorial…"
          style={{
            width: "100%", border: 0, borderBottom: "1px solid var(--ink)",
            background: "transparent", padding: "0.5rem 0", fontFamily: "var(--f-display)",
            fontStyle: "italic", fontSize: "1.1rem", color: "var(--ink)", outline: "none"
          }} />
      </div>
    );
  }
  return (
    <div className="curat-group">
      <h4>{title}</h4>
      <div className="curat-pills">
        {opts.map((entry) => {
          // entry can be [name, count] or [key, count, label] when valueLabels
          const name = entry[0], c = entry[1], label = valueLabels ? entry[2] : entry[0];
          const active = filters[k] === name;
          return (
            <button key={name}
              className={"pill " + (active ? "active" : "")}
              onClick={() => setKey(k, active ? null : name)}>
              {label} <span style={{ opacity: 0.6, marginLeft: 4 }}>{c}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function labelFor(k) {
  return {
    region: "Región", depto: "Depto.", genero: "Género",
    sexo: "Sexo", lengua: "Lengua", pais: "País",
    relevancia: "Relev.", search: "Buscar"
  }[k] || k;
}

window.CuratorialFilters = CuratorialFilters;
