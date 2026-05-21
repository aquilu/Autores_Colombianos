<div align="center">

# 📖 Autores Colombianos

### *Palabras que cruzan fronteras.*

> *Tu propio atlas literario de Colombia: 584 voces, 1.163 sellos editoriales, 58 países, 45 lenguas — todo el mapa de un país que escribe y se deja leer en el mundo.*

**Un atlas curatorial, editorial y cartográfico de la literatura colombiana — general e infantil & juvenil — del primer cuarto del siglo XXI.**
Construido para la **Red Cultural del Banco de la República**, ilustrado con IA, tipografiado con **BLAA**.

### 🌐 **Demo en vivo → [aquilu.github.io/Autores_Colombianos](https://aquilu.github.io/Autores_Colombianos/)**

[![Live](https://img.shields.io/badge/demo-live-2e4a37?style=flat-square)](https://aquilu.github.io/Autores_Colombianos/)
[![Print](https://img.shields.io/badge/versión-impresión-8a2a1c?style=flat-square)](https://aquilu.github.io/Autores_Colombianos/index-print.html)
[![Pages](https://img.shields.io/badge/GitHub%20Pages-built-b58b3a?style=flat-square&logo=github)](https://aquilu.github.io/Autores_Colombianos/)
[![Stack](https://img.shields.io/badge/stack-React%2018%20·%20D3%20v7-1d324a?style=flat-square)](#-arquitectura)

`React 18` · `D3 v7` · `TopoJSON` · `JSX en navegador (Babel)` · `100% estático` · `0 backend`

</div>

---

## ✨ TL;DR

**¿Solo quieres verlo?** → <https://aquilu.github.io/Autores_Colombianos/>

**¿Quieres correrlo local?**

```bash
git clone https://github.com/aquilu/Autores_Colombianos.git
cd Autores_Colombianos
# servir local — cualquier servidor estático sirve, no hay build
python -m http.server 8080
# o:
npx serve .
# luego abrir:
# http://localhost:8080/index.html        → atlas interactivo (web)
# http://localhost:8080/index-print.html  → versión papel (PDF imprimible)
```

No hay `npm install`. No hay bundler. No hay backend. **Solo abres el archivo.**

---

## 🗺️ Highlights

- **Dos atlas, un mismo archivo.** Volumen I (Literatura general, 497 autores) + Volumen II (LIJ — Infantil & Juvenil, 87 autores) — navegables por pestañas o imprimibles como un libro de dos volúmenes.
- **1.588 + 425 pares autor·editorial** documentados par a par, cada uno con país, ciudad, lengua, sello y URL de la editorial. No hay agregados sin trazabilidad.
- **Cartografía hecha a mano en D3.** Proyecciones `geoEquirectangular`, `geoMercator` y `geoOrthographic`, con grátula a 2° en Colombia y 20° en el mundo. Sin Mapbox, sin tiles, sin API keys.
- **Tipografía BLAA** — la familia oficial del Banco de la República, revival de las letras metálicas de la Biblioteca Luis Ángel Arango (1958). Diez pesos en `woff2`, servidos localmente.
- **Ilustración hero de IA** generada con **OpenAI (DALL·E / ChatGPT Image)**, en clave de retablo editorial latinoamericano, paleta cinabrio + dorado + selva.
- **Curaduría sobre investigación primaria.** El Volumen II se construye sobre el ensayo *"El florecimiento de la literatura infantil y juvenil en Colombia"* de **Beatriz Helena Robledo B.** (Banco de la República, 2026).
- **100% estático.** Despliegas en GitHub Pages, Netlify, Nginx o pendrive. Mismo HTML.
- **Modo impresión.** `index-print.html` arma los dos volúmenes en una sola pieza maquetable a PDF, con carátula, divisores y colofón.
- **Sin tracking, sin cookies, sin terceros.** Las únicas peticiones salen a `unpkg.com` por las librerías UMD; eso también se puede mirrorear (ver *Security model*).
- **Toda la data en JSON plano.** Reemplazas el XLSX, regeneras `dataset.json`, recargas el navegador. Listo.

---

## 📚 ¿Qué hay aquí dentro?

Este proyecto no es una "app" en el sentido SaaS. Es un **objeto editorial digital** — un libro que se navega — que documenta:

### Volumen I · Literatura general

```
 497 autoras y autores colombianos
 858 editoriales en 58 países
  45 lenguas de circulación
1.588 pares autor · editorial registrados par a par
```

García Márquez, Mutis, Restrepo, Vásquez, Abad Faciolince, Caparrós, Cuéllar, Buitrago, Quintana, Gamboa, Bonnett, Angel, Bolaño-de-acá, Powerpaola, y 480 más — cada uno con su biografía corta, premios, obras, estilo, géneros, coordenadas y red de circulación internacional.

### Volumen II · Literatura infantil & juvenil (LIJ)

```
  87 autoras y autores LIJ del primer cuarto del s. XXI
 305 editoriales en 40 países, 264 ciudades
  30 lenguas
 425 pares autor · editorial
```

Una lectura curatorial del **florecimiento de la LIJ colombiana** entre 2000 y 2024, articulada en seis voces del oficio: editoriales independientes, libro álbum, novela gráfica, memoria del conflicto, ferias internacionales (Bolonia, Guadalajara, Frankfurt) y políticas públicas de lectura.

---

## 🧭 How it works (short)

```
                            ┌──────────────────────────────┐
   data/autores.xlsx ─────►│  raw_autores.json            │
   data/lij_Hoja1.xlsx ───►│  raw_lij_Hoja1.json          │   (data sources)
                            └──────────────┬───────────────┘
                                           │
                                ┌──────────▼───────────┐
                                │  curaduría editorial │   (humano + LLM)
                                │  bio · obras · rel.  │
                                └──────────┬───────────┘
                                           │
                            ┌──────────────▼───────────────┐
                            │  data/dataset.json           │
                            │  data/lij_dataset.json       │
                            │  data/countries-110m.json    │
                            └──────────────┬───────────────┘
                                           │ fetch()
                ┌──────────────────────────▼───────────────────────────┐
                │            index.html  (boot loader)                  │
                │   ┌──────────────────────────────────────────────┐    │
                │   │  React 18 + Babel Standalone (en navegador)  │    │
                │   ├──────────────────────────────────────────────┤    │
                │   │  src/app.jsx          ─ Root + TabBar        │    │
                │   │   ├─ AdultApp                                │    │
                │   │   │    Hero · Filters · AtlasColombia ·      │    │
                │   │   │    AtlasWorld · Network · Mural · Story  │    │
                │   │   └─ LijApp                                  │    │
                │   │        LijHero · Voces · Colombia · World ·  │    │
                │   │        Ferias · Cronología · Red · Mural ·   │    │
                │   │        DataStory · Colophon · AuthorDrawer   │    │
                │   ├──────────────────────────────────────────────┤    │
                │   │  D3 v7  →  geoEquirectangular / geoMercator  │    │
                │   │           / geoOrthographic · graticule      │    │
                │   │  TopoJSON  →  countries-110m.json            │    │
                │   ├──────────────────────────────────────────────┤    │
                │   │  src/theme.css  +  src/lij-theme.css         │    │
                │   │  src/blaa-fonts.css  →  fonts/BLAA-*.woff2   │    │
                │   └──────────────────────────────────────────────┘    │
                └───────────────────────────────────────────────────────┘
                                           │
                                           ▼
                              Navegador del lector
                              (sin servidor, sin API)
```

Todo corre en el cliente. El "build" es: abre el HTML.

---

## 🚀 Instalación

### Opción A — sólo abrir el archivo (la más sencilla)

Doble click a `index.html`. Funciona en Chrome, Edge, Firefox y Safari modernos.

> ⚠️ Algunos navegadores bloquean `fetch()` desde `file://`. Si ves un mensaje de *"No se pudo cargar el dataset"*, usa la Opción B.

### Opción B — servidor estático local

```bash
# Python (incluido en macOS/Linux y la mayoría de Windows)
python -m http.server 8080

# Node
npx serve .
npx http-server -p 8080

# PHP
php -S localhost:8080

# Caddy / Nginx — apuntar root al directorio del repo
```

Luego visita:

| Ruta | Para qué |
|---|---|
| `http://localhost:8080/index.html` | Atlas interactivo (uso normal) |
| `http://localhost:8080/index-print.html` | Versión impresa: dos volúmenes, carátula, sin tabs — para exportar PDF |
| `http://localhost:8080/standalone-source.html` | Versión "monoarchivo" para portabilidad |
| `http://localhost:8080/Atlas Autores Colombianos.html` | Build original entregado por Claude Design |

### Opción C — desplegar a GitHub Pages

Este repo ya tiene Pages activo en **<https://aquilu.github.io/Autores_Colombianos/>** — cada `git push` a `main` re-dispara el build (~30–60 s, sin Jekyll).

Para replicarlo en tu propio fork:

```bash
git clone https://github.com/<tu-usuario>/Autores_Colombianos.git
cd Autores_Colombianos
git push origin main
# Vía gh CLI:
gh api -X POST repos/<tu-usuario>/Autores_Colombianos/pages \
   -f "source[branch]=main" -f "source[path]=/"
# o por UI: Settings → Pages → Source: main / root
```

Y listo. No hay paso de build.

---

## 🧱 Arquitectura

### Árbol del repo

```
Autores_Colombianos/
├── index.html              ← entrypoint web (carga datos + componentes)
├── index-print.html        ← entrypoint impresión (dos volúmenes en una pieza)
├── standalone-source.html  ← versión monoarchivo (todo inline)
├── README.md
│
├── assets/
│   └── lij-hero.png        ← ilustración LIJ generada con OpenAI
│
├── data/
│   ├── dataset.json        ← Vol. I  · 497 autores · 1.588 publicaciones
│   ├── lij_dataset.json    ← Vol. II · 87 autores  · 425 publicaciones
│   ├── countries-110m.json ← TopoJSON Natural Earth (world atlas v2)
│   ├── raw_autores.json    ← export crudo XLSX → JSON (Vol. I)
│   ├── raw_lij_Hoja1.json  ← export crudo XLSX → JSON (Vol. II)
│   ├── lij_article.txt     ← ensayo fuente B. H. Robledo
│   └── blaa_readme.txt     ← licencia y origen de la tipografía BLAA
│
├── src/
│   ├── app.jsx             ← Root + TabBar + AdultApp + Colophon
│   ├── lij-app.jsx         ← LijApp + LijDataStory
│   ├── hero.jsx            ← Hero del Vol. I (mapa animado de arcos)
│   │
│   ├── atlas-colombia.jsx  ← Mapa interno de Colombia (deptos · ciudades)
│   ├── atlas-world.jsx     ← Mapa-mundi de circulación editorial
│   ├── network.jsx         ← Red bipartita autor ↔ editorial
│   ├── mural.jsx           ← Mural retrato de autoras y autores
│   ├── data-story.jsx      ← Capítulo narrativo con stats
│   ├── filters.jsx         ← Filtros curatoriales (región, género, sexo…)
│   ├── author-drawer.jsx   ← Ficha lateral del autor seleccionado
│   ├── utils.jsx           ← TipProvider · SelectProvider · FilterProvider · fmt()
│   │
│   ├── lij/
│   │   ├── lij-hero.jsx       ← Hero del Vol. II (ilustración IA + título)
│   │   ├── lij-voces.jsx      ← Seis voces del oficio LIJ
│   │   ├── lij-world.jsx      ← Mapa-mundi específico LIJ
│   │   ├── lij-ferias.jsx     ← Bolonia · Guadalajara · Frankfurt
│   │   └── lij-cronologia.jsx ← Cronología 2000–2024
│   │
│   ├── theme.css           ← Tema editorial (paleta cinabrio · dorado · selva)
│   ├── lij-theme.css       ← Overrides cromáticos del Vol. II
│   ├── blaa-fonts.css      ← @font-face para BLAA (10 variantes)
│   └── fonts/
│       ├── BLAA-ExtraLight.woff2     · 200
│       ├── BLAA-ExtraLightItalic.woff2
│       ├── BLAA-Light.woff2          · 300
│       ├── BLAA-LightItalic.woff2
│       ├── BLAA-Regular.woff2        · 400
│       ├── BLAA-Italic.woff2
│       ├── BLAA-Bold.woff2           · 700
│       ├── BLAA-BoldItalic.woff2
│       ├── BLAA-UltraBold.woff2      · 900
│       └── BLAA-UltraBoldItalic.woff2
│
└── uploads/                ← fuentes crudas (XLSX, PDF, PNG originales)
    ├── autores_colombianos.xlsx
    ├── autores_infantil_juvenil.xlsx
    ├── lite_infant_juv.pdf            ← ensayo B. H. Robledo (PDF)
    ├── lite_infant_juv.docx
    ├── ChatGPT Image 14 may 2026…png  ← assets generados con OpenAI
    └── tipografia_subgerencia_cultural/
        ├── otf/  ttf/  Para web/{eot,woff,woff2}
        └── Readme.txt
```

### Capas conceptuales

| Capa | Qué hace | Archivos clave |
|---|---|---|
| **Data** | Pares autor·editorial planos en JSON. Una entrada por publicación, con país, ciudad, lengua, URL del sello. | `data/dataset.json`, `data/lij_dataset.json` |
| **Cartografía** | TopoJSON Natural Earth a 1:110m. Proyecciones y grátula calculadas en cliente con D3. | `data/countries-110m.json`, `src/atlas-*.jsx`, `src/lij/lij-world.jsx` |
| **Render** | React 18 (UMD) + Babel Standalone — JSX compilado en el navegador. Cero build step. | `index.html`, `src/*.jsx` |
| **Tipografía & tema** | BLAA + Cormorant Garamond + IBM Plex (Sans · Serif · Mono). Variables CSS con paleta editorial. | `src/blaa-fonts.css`, `src/theme.css`, `src/lij-theme.css` |
| **Ilustración** | Hero del Vol. II generado con OpenAI (DALL·E / ChatGPT Image), tratamiento editorial. | `assets/lij-hero.png` |
| **Curaduría** | Biografías, premios, obras y relevancia escritas y revisadas a mano sobre el ensayo de B. H. Robledo y archivo Banco de la República. | `data/lij_article.txt`, `uploads/lite_infant_juv.pdf` |

---

## 🎨 Sistema de diseño

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--ivory` | `#f1e7d0` | papel base |
| `--ink` | `#14110d` | tinta |
| `--rojo` (cinabrio) | `#8a2a1c` | acentos editoriales |
| `--dorado` (envejecido) | `#b58b3a` | numeración, separadores |
| `--azul` (noche) | `#1d324a` | mapa mundi |
| `--selva` | `#2e4a37` | LIJ · naturaleza |

### Tipografía

- **BLAA** — Banco de la República (display, serif y sans en el mismo cuerpo). Diseño: **Juan Pablo Fajardo** + laboratorio **Piedra, Tijera, Papel (PTP)**, 2022. Revival de las letras metálicas de la Biblioteca Luis Ángel Arango (1958). **Uso libre.**
- **Cormorant Garamond** — secundaria display, fallback de BLAA.
- **IBM Plex Serif / Sans / Mono** — texto largo, metadatos y *eyebrows*.

> *"Estudiar esas formas para proponer una solución práctica a una necesidad concreta tiene que ver con hacer visible la recuperación de un patrimonio desconocido, es un guiño para invitar a mirar de nuevo."*
> — Juan Pablo Fajardo, sobre BLAA.

---

## 🖥️ Comandos rápidos (la "CLI")

Este proyecto no necesita CLI propio — pero estos son los comandos que más se repiten en el ciclo de trabajo:

```bash
# Servir local
python -m http.server 8080
npx serve .

# Imprimir a PDF (Chrome headless)
chrome --headless --disable-gpu \
       --print-to-pdf=atlas.pdf \
       --no-pdf-header-footer \
       http://localhost:8080/index-print.html

# Regenerar dataset desde XLSX (con xlsx2json o similar)
xlsx2json uploads/autores_colombianos.xlsx > data/raw_autores.json
xlsx2json uploads/autores_infantil_juvenil.xlsx > data/raw_lij_Hoja1.json
# luego pasar por el script de curaduría (no incluido en este repo)

# Validar el JSON
jq '.totals' data/dataset.json
jq '.totals' data/lij_dataset.json

# Despliegue rápido
git add . && git commit -m "atlas: snapshot MMXXVI" && git push
```

### Atajos en navegador

| Acción | Cómo |
|---|---|
| Cambiar volumen | Pestaña *Literatura general* ⇄ *Infantil & juvenil* |
| Abrir ficha de autor | Click en cualquier nombre, retrato o nodo |
| Cerrar ficha | `Esc` o click fuera |
| Saltar a sección | Click en eyebrow del capítulo |
| Modo impresión | navegar a `/index-print.html` |
| Deep link a LIJ | `index.html#lij` |

---

## 🔌 Integraciones

Este atlas se conecta — por convención editorial y por enlace directo — con la **Red Cultural del Banco de la República**:

- 🏛️ **Banrepcultural** — `banrepcultural.org`
- 📚 **Biblioteca Luis Ángel Arango** — sede física y digital
- 🔍 **Descubridor** — `descubridor.banrepcultural.org`
- 📰 **Boletín Cultural y Bibliográfico** — `publicaciones.banrepcultural.org`
- 🛍️ **Tienda Banrep** — `tiendabanrep.co`
- 🏦 **Banco de la República** — `banrep.gov.co`

### Dependencias externas (CDN)

| Recurso | Versión | Origen |
|---|---|---|
| React | `18.3.1` | `unpkg.com/react` |
| ReactDOM | `18.3.1` | `unpkg.com/react-dom` |
| Babel Standalone | `7.29.0` | `unpkg.com/@babel/standalone` |
| D3 | `7.9.0` | `unpkg.com/d3` |
| topojson-client | `3.1.0` | `unpkg.com/topojson-client` |
| Google Fonts | — | Cormorant Garamond + IBM Plex |
| BLAA | local | `src/fonts/*.woff2` |
| World atlas | local | `data/countries-110m.json` (Natural Earth) |

Todas las dependencias UMD están firmadas con `integrity=` SHA-384 (Subresource Integrity).

---

## 🛡️ Security model

Este proyecto es deliberadamente **boring** en seguridad — y eso es una virtud:

- 🔒 **Sin backend.** No hay base de datos, no hay autenticación, no hay endpoints. La superficie de ataque es la del servidor estático que lo aloje.
- 🔒 **Sin cookies, sin localStorage de PII, sin tracking.** El único estado persistido es el `#hash` del tab activo en la URL.
- 🔒 **Sin entradas de usuario.** El atlas se lee, no se escribe. No hay formularios, ni uploads, ni comentarios. **XSS no aplica.**
- 🔒 **Subresource Integrity (SRI)** en cada `<script>` UMD de `unpkg.com` — si la CDN se compromete, el navegador rechaza el bundle.
- 🔒 **Datos públicos y revisados.** Todas las biografías y obras provienen de fuentes abiertas y de la investigación de B. H. Robledo; no hay datos personales sensibles más allá de la información biográfica pública de figuras literarias.
- 🔒 **Fonts y assets locales.** BLAA se sirve desde el propio repo: no se filtra IP del lector a un proveedor de fuentes.
- 🔒 **CSP-friendly.** Puedes endurecer con una CSP estricta:

```http
Content-Security-Policy:
  default-src 'self';
  script-src  'self' https://unpkg.com 'unsafe-eval';   # Babel necesita eval
  style-src   'self' https://fonts.googleapis.com 'unsafe-inline';
  font-src    'self' https://fonts.gstatic.com;
  img-src     'self' data:;
  connect-src 'self';
```

> ℹ️ `unsafe-eval` es necesario porque **Babel Standalone compila JSX en el navegador**. Para entornos que no toleran `unsafe-eval`, pre-compila los `.jsx` a `.js` con `esbuild` o `swc` y sirve los `.js` resultantes.

### Vector mínimo a vigilar

Si reemplazas un dataset por uno con HTML inyectado en biografías, React lo escapará por defecto — **no uses `dangerouslySetInnerHTML`** en los componentes de fichas. Hoy el repo no lo hace en ningún lado.

---

## 🛠️ Development / From source

### Requisitos

- Un navegador moderno (Chrome 100+, Firefox 100+, Edge 100+, Safari 15+).
- Un servidor estático local (Python, Node, PHP, Caddy, lo que tengas).
- Opcional: `jq` para inspeccionar JSON, `xlsx2json` o un script propio para regenerar datasets.

### Flujo de trabajo

```bash
# 1 · clonar
git clone https://github.com/aquilu/Autores_Colombianos.git
cd Autores_Colombianos

# 2 · servir
python -m http.server 8080

# 3 · editar
#    src/*.jsx       → cambios al render (recarga el navegador)
#    src/*.css       → cambios al diseño
#    data/*.json     → cambios al contenido

# 4 · imprimir
#    abrir /index-print.html y "Imprimir → Guardar como PDF"
#    márgenes: 0     tamaño: A4 o Carta     fondos: activados

# 5 · publicar
git commit -am "atlas: <cambio>" && git push
```

### Generación de datos desde XLSX

Las hojas de cálculo originales viven en `uploads/`:

```
uploads/autores_colombianos.xlsx           → Vol. I
uploads/autores_infantil_juvenil.xlsx      → Vol. II
```

Cada fila es un **par autor·editorial** (no un autor único): el mismo autor aparece N veces, una por cada sello/país donde circula. La curaduría adicional (bio, obras, premios, relevancia, coordenadas, géneros) se construye con apoyo de LLMs sobre el ensayo de B. H. Robledo y catálogos de las editoriales.

### Convenciones

- **JSX en navegador** — no hay paso de bundling. Cada `.jsx` queda como `<script type="text/babel">`.
- **Sin imports ES**. Todo cuelga de `window.*` para que Babel Standalone no tenga que resolver módulos.
- **Una "ola" por sección** — cada capítulo del atlas es un `<section>` con eyebrow numérico (`I`, `II`, `III`…), título display y meta lateral.
- **Tipos visuales por volumen.** Vol. I usa `--rojo` cinabrio; Vol. II usa `--lij-rojo` y `--selva` como acento.

---

## 🗺️ Roadmap

- 🔜 **Búsqueda global** por autor / obra / editorial / ciudad — actualmente sólo hay filtros facetados.
- 🔜 **Exportación CSV/BibTeX** de la selección activa.
- 🔜 **Endurecer CSP** pre-compilando JSX con `esbuild` para retirar `unsafe-eval`.
- 🔜 **Modo accesible alto contraste** — paleta de luminosidad WCAG AAA.
- 🔜 **Traducción al inglés** del Vol. I para circulación internacional (la LIJ se queda en español por decisión editorial).
- 🔜 **Versión móvil** del atlas-mundo (hoy el mapa-mundi prioriza el escritorio).
- 🔜 **Cronología interactiva del Vol. I**, ya disponible en el Vol. II.
- 🔜 **Empaquetado offline** (`zip` autodesplegable con todos los assets, sin CDN).
- 🔜 **API de lectura** — `data/dataset.json` ya es la "API"; falta documentar el schema.

---

## 📜 Docs

| Documento | Dónde |
|---|---|
| Ensayo fuente — *El florecimiento de la LIJ en Colombia* · Beatriz Helena Robledo B. | `uploads/lite_infant_juv.pdf`, `data/lij_article.txt` |
| Licencia y origen de la tipografía BLAA | `data/blaa_readme.txt`, `uploads/tipografia_subgerencia_cultural/Readme.txt` |
| Dataset Vol. I (esquema implícito) | `data/dataset.json` |
| Dataset Vol. II (esquema implícito) | `data/lij_dataset.json` |
| Hoja de cálculo Vol. I | `uploads/autores_colombianos.xlsx` |
| Hoja de cálculo Vol. II | `uploads/autores_infantil_juvenil.xlsx` |
| Banco de la República — labor cultural | <https://www.banrep.gov.co/> · <https://www.banrepcultural.org/> |

### Esquema mínimo de un autor

```json
{
  "n":  "Nombre y apellidos",
  "c":  "Ciudad de nacimiento",
  "d":  "Departamento",
  "r":  "Región (Andina, Caribe, Pacífico, Orinoquía, Amazonía, Diáspora)",
  "yn": 1977,
  "ym": null,
  "v":  "Vive | †",
  "s":  "Mujer | Hombre | No binarie",
  "bio":     "biografía corta (1–3 frases)",
  "g":       ["Narrativa", "Cómic/Gráfica", "Memoria/Biografía"],
  "obras":   ["Título 1", "Título 2"],
  "premios": "lista en prosa",
  "estilo":  "una línea de estilo curatorial",
  "rel":     "Máxima | Muy alta | Alta | Media-alta | Media",
  "lat":     4.6097,
  "lon":     -74.0817,
  "pubs": [
    { "p":"México", "e":"Sexto Piso", "l":"Español", "u":"https://sextopiso.mx/" },
    { "p":"Francia", "e":"Métailié",  "l":"Francés", "u":"https://editions-metailie.com/" }
  ]
}
```

---

## 🙏 Special thanks

Este atlas no existiría sin:

- 🏛️ **Banco de la República — Subgerencia Cultural** — por encomendar el proyecto y por mantener viva la Red Cultural más grande del país.
- ✍️ **Beatriz Helena Robledo B.** — cuya investigación *El florecimiento de la literatura infantil y juvenil en Colombia* es la columna vertebral del Volumen II. Sin su mirada, no hay capítulo LIJ.
- 🔤 **Juan Pablo Fajardo** y el laboratorio **Piedra, Tijera, Papel (PTP)** — por la tipografía **BLAA**, regalo de patrimonio puesto al alcance de todos.
- 🏛️ **Biblioteca Luis Ángel Arango** — porque sus letras metálicas de 1958 siguen escribiendo, ahora en pantallas.
- 🤖 **OpenAI** — por las herramientas de generación de imagen (DALL·E / ChatGPT Image) que dieron forma a la ilustración hero del Volumen II.
- 🧠 **Anthropic · Claude (Design / Code)** — por co-escribir, refactorizar y maquetar este atlas junto al equipo humano.
- 🗺️ **Natural Earth** — por el mundo a 1:110.000.000 en dominio público.
- 📦 **D3, React, TopoJSON, IBM Plex, Google Fonts** — por hacer que un libro digital pese kilobytes y no megabytes.
- 📚 **497 + 87 autoras y autores colombianos** — por escribir el país que este atlas se limita a cartografiar.

Y a quien sea que llegó hasta acá leyendo: gracias por mirar de nuevo. 🌎

---

<div align="center">

**Atlas de Autores Colombianos · MMXXVI**
*Red Cultural del Banco de la República · Bogotá D.C. · 04°35′N 74°04′O*

🌐 <https://aquilu.github.io/Autores_Colombianos/>

`584 voces · 1.163 sellos editoriales · 58 países · 45 lenguas · 1 país que se deja leer en el mundo`

</div>
