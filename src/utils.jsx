/* global React */

const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// =============== Tooltip singleton ===============
const TipCtx = createContext({ show: () => {}, hide: () => {} });

function TipProvider({ children }) {
  const tipRef = useRef(null);

  const show = useCallback((html, x, y) => {
    const el = tipRef.current;
    if (!el) return;
    el.innerHTML = html;
    const pad = 16;
    const w = el.offsetWidth, h = el.offsetHeight;
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = x + pad;
    let top = y + pad;
    if (left + w > vw - 8) left = x - w - pad;
    if (top + h > vh - 8) top = y - h - pad;
    el.style.left = left + "px";
    el.style.top = top + "px";
    el.classList.add("visible");
  }, []);

  const hide = useCallback(() => {
    if (tipRef.current) tipRef.current.classList.remove("visible");
  }, []);

  return (
    <TipCtx.Provider value={{ show, hide }}>
      {children}
      <div ref={tipRef} className="tip" />
    </TipCtx.Provider>
  );
}

function useTip() { return useContext(TipCtx); }

// =============== Author selection context ===============
const SelectCtx = createContext({ selected: null, select: () => {}, hovered: null, setHovered: () => {} });

function SelectProvider({ children }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  return (
    <SelectCtx.Provider value={{ selected, select: setSelected, hovered, setHovered }}>
      {children}
    </SelectCtx.Provider>
  );
}

function useSelection() { return useContext(SelectCtx); }

// =============== Filter context ===============
const defaultFilters = {
  region: null,
  depto: null,
  genero: null,
  sexo: null,
  lengua: null,
  pais: null,
  relevancia: null,
  theme: null,
  search: ""
};

const FilterCtx = createContext(null);

function FilterProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);
  const setKey = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const reset = () => setFilters(defaultFilters);
  return (
    <FilterCtx.Provider value={{ filters, setKey, reset }}>
      {children}
    </FilterCtx.Provider>
  );
}
function useFilters() { return useContext(FilterCtx); }

// =============== Filtering logic ===============
function authorMatches(a, f) {
  if (f.region && a.r !== f.region) return false;
  if (f.depto && a.d !== f.depto) return false;
  if (f.sexo && a.s !== f.sexo) return false;
  if (f.relevancia && a.rel !== f.relevancia) return false;
  if (f.genero && !(a.g || []).includes(f.genero)) return false;
  if (f.lengua && !a.pubs.some(p => p.l === f.lengua)) return false;
  if (f.pais && !a.pubs.some(p => p.p === f.pais)) return false;
  if (f.theme && !(a.themes || []).includes(f.theme)) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    if (!a.n.toLowerCase().includes(q) &&
        !(a.c || "").toLowerCase().includes(q) &&
        !a.pubs.some(p => (p.e || "").toLowerCase().includes(q))) return false;
  }
  return true;
}

// =============== Fade-in observer ===============
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// =============== Tiny helpers ===============
function fmt(n) { return n.toLocaleString("es-CO"); }
function fmtCoord(lat, lon) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(4)}° ${ns}  ·  ${Math.abs(lon).toFixed(4)}° ${ew}`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"})[c]);
}

// Curved arc generator: cubic bezier between two SVG points with rise toward "perpendicular"
function arcPath(x1, y1, x2, y2, rise = 0.22) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  // perpendicular vector
  const nx = -dy / (dist || 1);
  const ny = dx / (dist || 1);
  const cx = mx + nx * dist * rise;
  const cy = my + ny * dist * rise;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

// Place to expose globals between babel scripts
Object.assign(window, {
  TipProvider, useTip,
  SelectProvider, useSelection,
  FilterProvider, useFilters, authorMatches, defaultFilters,
  useFadeIn,
  fmt, fmtCoord, escapeHtml, arcPath,
  R: React, useState, useEffect, useRef, useMemo, useCallback
});
