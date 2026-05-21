/* global React */
const { useEffect, useRef } = window;

function LijHero({ data, onExplore }) {
  return (
    <section className="lij-hero">
      <div className="lij-hero-illustration" style={{ backgroundImage: "url(assets/lij-hero.png)" }} />
      <div className="lij-hero-mat" />

      <div className="lij-hero-coord">
        Atlas Vol. II<br/>
        <span style={{ color: "var(--lij-rojo)" }}>◇</span> MMXXVI
      </div>

      <div className="wrap lij-hero-body">
        <div className="lij-hero-card">
          <div className="lij-hero-kicker">
            <span className="rule" />
            <span>Literatura infantil &amp; juvenil de Colombia</span>
          </div>

          <h1 className="lij-hero-title">
            Historias <span className="thin">que nos</span> <em>conectan</em>,<br/>
            <span className="thin">imaginación</span> <span className="thin">que nos</span> <em>transforma</em>.
          </h1>

          <p className="lij-hero-sub">
            Un atlas curatorial del <em>florecimiento de la LIJ colombiana</em> en el primer cuarto
            del siglo&nbsp;XXI: ocho voces del oficio, {data.totals.autores} autores y autoras,
            y {fmt(data.totals.editoriales)} sellos editoriales que han abierto el libro infantil
            y juvenil colombiano al mundo.
          </p>

          <div className="lij-hero-meta">
            <div>
              <div className="lij-hero-stat-n">{data.totals.autores}</div>
              <div className="lij-hero-stat-l">autores cartografiados</div>
            </div>
            <div>
              <div className="lij-hero-stat-n">{fmt(data.totals.editoriales)}</div>
              <div className="lij-hero-stat-l">sellos editoriales</div>
            </div>
            <div>
              <div className="lij-hero-stat-n">{data.totals.paises}</div>
              <div className="lij-hero-stat-l">países de circulación</div>
            </div>
            <div>
              <div className="lij-hero-stat-n">{data.totals.lenguas}</div>
              <div className="lij-hero-stat-l">lenguas de traducción</div>
            </div>
          </div>

          <div className="lij-hero-cta">
            <button className="btn btn-primary" onClick={onExplore}>
              Las ocho voces del oficio <span style={{ fontSize: "1.1rem" }}>↓</span>
            </button>
            <a className="btn btn-ghost" href="#lij-mundo">
              De Colombia para el mundo
            </a>
          </div>
        </div>

        {/* Right column is intentionally empty —
            it's the "viewport" where the illustration breathes */}
        <div aria-hidden="true" />
      </div>
    </section>
  );
}

window.LijHero = LijHero;
