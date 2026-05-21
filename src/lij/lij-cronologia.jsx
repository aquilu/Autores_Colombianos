/* global React */
const { useMemo } = window;

// Cronología extraída del artículo "El florecimiento de la literatura infantil
// y juvenil en Colombia" — Beatriz Helena Robledo B.
const TIMELINE = [
  {
    year: 2000,
    cat: "Obras",
    title: "Dos libros que abren el siglo",
    body: "El cuento Los agujeros negros, de Yolanda Reyes con ilustraciones de Daniel Rabanal, y la novela Cuchilla, de Evelio José Rosero —Premio Norma de Literatura Infantil— inauguran un cuarto de siglo de búsquedas literarias.",
    refs: ["Los agujeros negros (Reyes / Rabanal)", "Cuchilla (Rosero / Castellanos)"]
  },
  {
    year: 2003,
    cat: "Política pública",
    title: "Leer libera",
    body: "El Ministerio de Cultura, a través de la Biblioteca Nacional, lanza el Plan Nacional de Lectura y Bibliotecas “Leer libera”, enmarcado en el Conpes 3222. Por primera vez se dota a las bibliotecas públicas con colecciones que incluyen un porcentaje de literatura infantil y juvenil.",
    refs: []
  },
  {
    year: 2006,
    cat: "Premio internacional",
    title: "Gloria Cecilia Díaz · Iberoamericano SM",
    body: "Gloria Cecilia Díaz se convierte en la primera colombiana en recibir el Premio Iberoamericano SM de Literatura Infantil y Juvenil, el reconocimiento más importante en lengua española.",
    refs: []
  },
  {
    year: 2007,
    cat: "Institucionalidad",
    title: "Bogotá, capital mundial del libro",
    body: "Bajo la celebración de Bogotá Capital Mundial del Libro nace el Comité de Libros para Niños y Jóvenes (Cámara Colombiana del Libro) y el Festival de Libros para Niños y Jóvenes, hoy con apoyo permanente de Idartes. El ICBF lanza el programa Fiesta de la Lectura.",
    refs: []
  },
  {
    year: 2008,
    cat: "Premio · Obras",
    title: "El Barco de Vapor zarpa",
    body: "SM y la Biblioteca Luis Ángel Arango inician el Premio El Barco de Vapor, que durante 13 años consecutivos formará el catálogo de autores e ilustradores colombianos. Ese mismo año, Camino a casa, de Jairo Buitrago y Rafael Yockteng, gana el Concurso A la Orilla del Viento (FCE).",
    refs: ["Camino a casa (Buitrago / Yockteng)"]
  },
  {
    year: 2010,
    cat: "Política pública",
    title: "Leer es mi cuento + Ley de bibliotecas",
    body: "El Plan Nacional de Lectura y Escritura “Leer es mi cuento” une a los ministerios de Cultura y Educación. Se aprueba la Ley 1379 (ley de bibliotecas públicas), que garantiza presupuestos y continuidad. Penguin Random House publica el catálogo La Biblioteca con 12 autores colombianos.",
    refs: []
  },
  {
    year: 2012,
    cat: "Avance legal · Obras",
    title: "El cómic deja de pagar IVA",
    body: "Una sentencia de la Corte Constitucional libera al cómic y la novela gráfica del IVA del 16% que les imponía la Ley del Libro de 1993. Comienza el desarrollo formal del género en el país. Mismo año: La Madremonte, de Powerpaola.",
    refs: ["La Madremonte (Powerpaola)", "Mambrú perdió la guerra (Vasco / Rabanal)"]
  },
  {
    year: 2013,
    cat: "Política pública",
    title: "Colección Semilla",
    body: "El Ministerio de Educación entrega más de 5.5 millones de libros de literatura infantil e informativos a instituciones educativas, beneficiando al 90% de los estudiantes del sector oficial. La semilla de la biblioteca escolar como espacio pedagógico.",
    refs: []
  },
  {
    year: 2014,
    cat: "Premio · Internacional",
    title: "Ivar Da Coll y Rey Naranjo en Bolonia",
    body: "Ivar Da Coll recibe el Premio Iberoamericano SM. Rey Naranjo Editores gana el Premio New Horizons en la Feria del Libro Infantil de Bolonia con La chica de polvo, de Jung Yumi. Colombia entra al circuito global de los premios editoriales para niños.",
    refs: ["La chica de polvo (Jung Yumi)"]
  },
  {
    year: 2015,
    cat: "Premio internacional",
    title: "Gabo en cómic gana en Roma",
    body: "Gabo. Memorias de una vida mágica —guion de Óscar Pantoja, ilustración a cuatro manos— gana el Premio Romic al mejor cómic latinoamericano en el Salón del Cómic de Roma. Tragaluz Editores recibe mención especial en Bolonia por Mil orejas.",
    refs: ["Gabo. Memorias de una vida mágica (Pantoja et al.)"]
  },
  {
    year: 2017,
    cat: "Institucionalidad · BOP",
    title: "Nace ACLIJ · Babel gana en Bolonia",
    body: "Autores, ilustradores y editores fundan la Asociación Colombiana de Literatura Infantil y Juvenil (ACLIJ). Babel Libros gana el Premio BOP —mejor editorial de libros para niños en Centroamérica, Sudamérica y el Caribe— en la Feria del Libro Infantil de Bolonia.",
    refs: ["La mujer de la guarda (Bertrand / Acosta)"]
  },
  {
    year: 2020,
    cat: "Premio · BOP",
    title: "Yolanda Reyes y Tragaluz, en lo más alto",
    body: "Yolanda Reyes recibe el Premio Iberoamericano SM. Tragaluz Editores gana el Premio BOP en Bolonia. El sector editorial independiente alcanza su pico histórico de publicaciones para niños y jóvenes en Colombia.",
    refs: []
  },
  {
    year: 2022,
    cat: "Política pública",
    title: "Leer es Mi Cuento, ahora 100% colombiano",
    body: "La colección estatal de seis títulos anuales que llega a los lugares más apartados del país pasa a publicar exclusivamente autores e ilustradores colombianos. Una decisión silenciosa que cambia el horizonte editorial de la LIJ.",
    refs: []
  },
  {
    year: 2023,
    cat: "Institucionalidad",
    title: "Cámara de la Edición Independiente",
    body: "Nace la Cámara Colombiana de la Edición Independiente, que reúne en su catálogo Leo Independiente a más de 60 editoriales con cerca de 3,500 títulos disponibles. La descentralización editorial se consolida como política gremial.",
    refs: []
  },
  {
    year: 2024,
    cat: "Premios · Cosecha",
    title: "Un año de cosecha global",
    body: "Irene Vasco recibe el Premio Iberoamericano SM. Cataplum Libros gana el Premio BOP en Bolonia. MakeMake gana el Bologna Ragazzi Crossmedia Award por su biblioteca digital. ¡Ugh! Un relato del Pleistoceno (Buitrago / Yockteng) recibe el Premio Nacional del Libro Infantil. Nido, de Laura Guarisco, gana el Premio Nacional de Novela Gráfica. Caminos condenados se cuelga la medalla de oro del Japan International Manga Award.",
    refs: ["¡Ugh! Un relato del Pleistoceno", "Nido (Guarisco)", "Caminos condenados"]
  },
  {
    year: 2025,
    cat: "Hacia adelante",
    title: "La tierra sigue dando frutos",
    body: "“Quizás en la actualidad no estemos pasando por el mejor momento, pero, con lo que se ha sembrado hasta ahora, la tierra seguirá dando sus frutos, siempre y cuando se siga regando y abonando.” — Beatriz Helena Robledo B.",
    refs: [],
    quote: true
  }
];

const CAT_COLORS = {
  "Obras": "var(--lij-rojo)",
  "Política pública": "var(--lij-verde)",
  "Premio internacional": "var(--lij-mostaza)",
  "Institucionalidad": "var(--lij-azul)",
  "Premio · Obras": "var(--lij-rojo)",
  "Avance legal · Obras": "var(--lij-petalo)",
  "Premio · Internacional": "var(--lij-mostaza)",
  "Institucionalidad · BOP": "var(--lij-azul)",
  "Premio · BOP": "var(--lij-mostaza)",
  "Premios · Cosecha": "var(--lij-rojo-vivo)",
  "Hacia adelante": "var(--lij-verde-2)"
};

function LijCronologia() {
  const ref = useFadeIn();

  return (
    <section className="section paper-bg" id="lij-cronologia" ref={ref}>
      <div className="wrap-narrow">
        <header className="chapter" style={{ borderBottom: "1px solid var(--rule)", paddingBottom: "1.5rem", marginBottom: "0" }}>
          <div>
            <div className="chapter-no">Capítulo V</div>
            <h2 className="chapter-title">25 años <em className="italic">en flor</em></h2>
          </div>
          <div></div>
          <div className="chapter-meta">
            Cronología · 2000–2025<br/>
            por Beatriz Helena Robledo&nbsp;B.
          </div>
        </header>

        <div style={{
          marginTop: "2.5rem",
          padding: "2rem",
          border: "1px solid var(--ink)",
          background: "var(--ivory-2)",
          position: "relative"
        }}>
          <div style={{
            position: "absolute", top: "-0.7rem", left: "1.5rem",
            background: "var(--ivory-2)", padding: "0 0.7rem",
            fontFamily: "var(--f-mono)", fontSize: "0.6rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--lij-rojo)"
          }}>Epígrafe</div>
          <p style={{
            margin: 0,
            fontFamily: "var(--f-display)",
            fontStyle: "italic",
            fontSize: "clamp(1.1rem, 1.5vw, 1.4rem)",
            lineHeight: 1.45,
            color: "var(--ink-2)",
            maxWidth: "62ch"
          }}>
            “La ficción responde a una necesidad muy profunda del niño: no contentarse con su propia vida.”
          </p>
          <div style={{
            marginTop: "0.6rem",
            fontFamily: "var(--f-mono)", fontSize: "0.65rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--ink-soft)"
          }}>— Jacqueline Held (1987)</div>
        </div>

        <p className="lede" style={{ marginTop: "2.5rem", maxWidth: "62ch" }}>
          Esta cronología narra el primer cuarto de siglo de la literatura infantil y juvenil colombiana
          como una sola historia: la del florecimiento de un campo gracias al trabajo conjunto
          de <em>creadores, editoriales, ferias, premios y políticas públicas</em>. Cada año dejó
          una semilla.
        </p>

        <ol className="cronologia">
          {TIMELINE.map((it, i) => (
            <li key={it.year} className="crono-item" style={{
              "--accent": CAT_COLORS[it.cat] || "var(--lij-rojo)"
            }}>
              <div className="crono-year-wrap">
                <span className="crono-year">{it.year}</span>
                {i < TIMELINE.length - 1 && <span className="crono-rail" aria-hidden="true" />}
              </div>

              <div className="crono-card">
                <div className="crono-cat">{it.cat}</div>
                <h3 className="crono-title">{it.title}</h3>
                <p className={"crono-body" + (it.quote ? " crono-quote" : "")}>{it.body}</p>
                {it.refs.length > 0 && (
                  <ul className="crono-refs">
                    {it.refs.map(r => <li key={r}>{r}</li>)}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div style={{
          marginTop: "3rem", paddingTop: "1.5rem",
          borderTop: "1px solid var(--rule)",
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          flexWrap: "wrap", gap: "1rem"
        }}>
          <div style={{
            fontFamily: "var(--f-display)", fontStyle: "italic",
            fontSize: "1.15rem", color: "var(--ink-soft)", maxWidth: "62ch"
          }}>
            Adaptado del ensayo «El florecimiento de la literatura infantil y juvenil en Colombia»,
            de Beatriz Helena Robledo&nbsp;B.
          </div>
          <div className="serial">
            № V · cronología&nbsp;·&nbsp;25 años&nbsp;·&nbsp;{TIMELINE.length} hitos
          </div>
        </div>
      </div>
    </section>
  );
}

window.LijCronologia = LijCronologia;
