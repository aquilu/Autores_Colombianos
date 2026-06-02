/* global React */
const { useMemo } = window;

function TdHero({ data }) {
  return (
    <section className="td-hero">
      <div className="td-hero-photo" style={{ backgroundImage: "url(assets/tinydesk-hero.png)" }} />

      <div className="td-wrap td-hero-top">
        <div className="td-hero-badge">
          <span className="dot" />
          Tiny Desk Kids · Sesiones
        </div>
        <div className="td-onair" style={{ color: "var(--td-cream)" }}>
          <span className="led" /> En vivo · LIJ Colombia
        </div>
      </div>

      <div className="td-wrap td-hero-body">
        <div className="td-hero-kicker">
          <span className="rule" />
          Literatura infantil &amp; juvenil de Colombia
        </div>

        <h1 className="td-hero-title">
          Cuentos <em>en voz</em><br/>
          alta<span style={{ color: "var(--td-coral)" }}>.</span>
        </h1>

        <p className="td-hero-sub">
          Un escenario íntimo —al estilo de un concierto de escritorio— para escuchar de cerca
          a quienes escriben e ilustran para la niñez en Colombia. {data.totals.autores} autores,
          {" "}{fmt(data.totals.editoriales)} sellos, una misma mesa de lectura.
        </p>

        <div className="td-signs">
          <div className="td-sign">
            <div className="td-sign-n">{data.totals.autores}</div>
            <div className="td-sign-l">autores en cartel</div>
          </div>
          <div className="td-sign">
            <div className="td-sign-n">{fmt(data.totals.editoriales)}</div>
            <div className="td-sign-l">sellos editoriales</div>
          </div>
          <div className="td-sign">
            <div className="td-sign-n">{data.totals.paises}</div>
            <div className="td-sign-l">países de gira</div>
          </div>
          <div className="td-sign">
            <div className="td-sign-n">{data.totals.lenguas}</div>
            <div className="td-sign-l">lenguas en escena</div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.TdHero = TdHero;
