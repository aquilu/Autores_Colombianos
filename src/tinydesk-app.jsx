/* global React */
const { useMemo } = window;

function TdApp({ data }) {
  return (
    <div className="td-root">
      <TipProvider>
        <SelectProvider>
          <FilterProvider>
            <TdHero data={data} />
            <TdMarquee data={data} />
            <TdSessions data={data} />
            <TdProgram data={data} />
            <TdShelf data={data} />
            <TdColophon data={data} />
            <AuthorDrawer />
          </FilterProvider>
        </SelectProvider>
      </TipProvider>
    </div>
  );
}

function TdColophon({ data }) {
  return (
    <footer className="td-section dark" style={{ paddingBottom: "3rem" }}>
      <div className="td-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div className="td-hero-kicker" style={{ marginBottom: "1rem" }}>
              <span className="rule" /> Telón
            </div>
            <h2 style={{
              fontFamily: "var(--f-display)", fontStyle: "italic", fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1, color: "var(--td-cream)",
              margin: 0, maxWidth: "18ch"
            }}>
              Gracias por <em style={{ color: "var(--td-amber)" }}>escuchar</em>.
            </h2>
            <p style={{
              fontFamily: "var(--f-serif)", fontSize: "1.05rem", lineHeight: 1.6,
              color: "rgba(246,236,216,0.7)", maxWidth: "54ch", marginTop: "1rem"
            }}>
              Esta sala íntima reúne a los mismos {data.totals.autores} autores y autoras del
              atlas de literatura infantil y juvenil, en un escenario distinto: el de la
              lectura en voz alta.
            </p>
          </div>

          <div style={{ textAlign: "right", display: "grid", gap: "0.4rem" }}>
            <div className="td-onair" style={{ color: "var(--td-amber-soft)", justifyContent: "flex-end" }}>
              <span className="led" /> Tiny Desk Kids
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,236,216,0.5)" }}>
              {fmt(data.totals.publicaciones)} ediciones documentadas
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "0.66rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(246,236,216,0.5)" }}>
              Red Cultural · Banco de la República
            </div>
          </div>
        </div>

        <div style={{
          marginTop: "3rem", paddingTop: "1.5rem",
          borderTop: "1px solid rgba(246,236,216,0.14)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
          fontFamily: "var(--f-mono)", fontSize: "0.62rem",
          letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(246,236,216,0.45)"
        }}>
          <div>© 2024 Banco de la República, Colombia.</div>
          <div>Escena inspirada en el formato Tiny Desk · uso editorial no comercial</div>
        </div>
      </div>
    </footer>
  );
}

window.TdApp = TdApp;
