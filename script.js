"use strict";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s, el = document) => el.querySelector(s);
const hex = (n) => "#" + n.toString(16).padStart(6, "0");
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ART = {"Tame Impala|Currents": "album-tame-impala-currents", "Tame Impala|The Slow Rush": "album-tame-impala-the-slow-rush", "Daft Punk|Discovery": "album-daft-punk-discovery", "Kendrick Lamar|good kid, m.A.A.d city": "album-kendrick-lamar-good-kid-m-a-a-d-city", "Kendrick Lamar|DAMN.": "album-kendrick-lamar-damn", "Fleetwood Mac|Rumours": "album-fleetwood-mac-rumours", "Fleetwood Mac|Tango In the Night (Deluxe Edition)": "album-fleetwood-mac-tango-in-the-night-deluxe-edition", "Amy Winehouse|Back To Black (Deluxe Edition)": "album-amy-winehouse-back-to-black-deluxe-edition", "Khruangbin|Texas Moon": "album-khruangbin-texas-moon", "Khruangbin|A LA SALA": "album-khruangbin-a-la-sala", "Massive Attack|Mezzanine": "album-massive-attack-mezzanine", "Disclosure|Settle (Deluxe Version)": "album-disclosure-settle-deluxe-version", "Gorillaz|Demon Days": "album-gorillaz-demon-days", "Bon Iver|Bon Iver, Bon Iver": "album-bon-iver-bon-iver-bon-iver", "Phoebe Bridgers|Stranger in the Alps (Deluxe Edition)": "album-phoebe-bridgers-stranger-in-the-alps-deluxe-edit", "Radiohead|Karma Police": "album-radiohead-karma-police", "MGMT|Oracular Spectacular": "album-mgmt-oracular-spectacular", "KAYTRANADA|AIN'T NO DAMN WAY!": "album-kaytranada-aint-no-damn-way", "Outkast|Speakerboxxx/The Love Below": "album-outkast-speakerboxxx-the-love-below", "Kanye West|Late Registration": "album-kanye-west-late-registration", "Tyler, The Creator|Flower Boy": "album-tyler-the-creator-flower-boy", "photo|Tame Impala": "artist-tame-impala", "photo|Kendrick Lamar": "artist-kendrick-lamar", "photo|Fleetwood Mac": "artist-fleetwood-mac", "photo|Bad Bunny": "artist-bad-bunny", "photo|Amy Winehouse": "artist-amy-winehouse", "photo|Stevie Wonder": "artist-stevie-wonder", "photo|Nina Simone": "artist-nina-simone", "photo|Massive Attack": "artist-massive-attack", "backdrop|Tame Impala": "backdrop-tame-impala", "SZA|SOS": "album-sza-sos", "Frank Ocean|channel ORANGE": "album-frank-ocean-channel-orange", "The Weeknd|House Of Balloons (Original)": "album-the-weeknd-house-of-balloons-original", "Kali Uchis|Red Moon In Venus": "album-kali-uchis-red-moon-in-venus", "photo|Zara Larsson": "artist-zara-larsson", "photo|The Weeknd": "artist-the-weeknd", "photo|SZA": "artist-sza", "made|feel-good": "made-feel-good", "made|late-night": "made-late-night", "made|rainy-day": "made-rainy-day", "made|road-trip": "made-road-trip", "made|workout": "made-workout"};
const art = (key) => `assets/art/${ART[key]}.jpg`;
const WAVE = '<svg class="mwave" viewBox="0 0 512 226" aria-hidden="true"><use href="#wave"/></svg>';

// Seeded random, so the same name always draws the same cover.
function rng(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (const c of String(seed)) { h = Math.imul(h ^ c.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function luminance(rgb) {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * lin(rgb >> 16 & 255) + 0.7152 * lin(rgb >> 8 & 255) + 0.0722 * lin(rgb & 255);
}

function mixRgb(a, b, t) {
  const ch = (s) => Math.round((a >> s & 255) * (1 - t) + (b >> s & 255) * t);
  return ch(16) << 16 | ch(8) << 8 | ch(0);
}

/* ---------- The Meloday sun, from MelodaySun.cs ---------- */

const BREATHS = [[1, .96, 1.04, 8.8, 1.4], [.75, .972, 1.034, 7.6, 3.1], [.5, .982, 1.03, 9.5, 5.2], [.25, .99, 1.024, 7.9, 2.6]];
const OPACITY = [.3, .4, .65, 1];
const sun = (bg, colour, x, y) => ({ bg, x, y, rings: BREATHS.map(() => colour), opacity: OPACITY });

const PERIODS = [
  { name: "Dawn", hours: [3, 4, 5], range: "3–6 am", mix: "Hazy Downtempo", ...sun(0x2D2350, 0xFF6E4B, .5, 1.15) },
  { name: "Early Morning", hours: [6, 7, 8], range: "6–9 am", mix: "Breezy Indie Pop", bg: 0xA77ECD, x: .5, y: .9, rings: [0xBC85B2, 0xD39193, 0xE29A6F, 0xEDA158], opacity: [1, 1, 1, 1] },
  { name: "Morning", hours: [9, 10, 11, 12], range: "9 am–1 pm", mix: "Modern Dance Pop", ...sun(0x3CA5E1, 0xFFC800, .5, .5) },
  { name: "Afternoon", hours: [13, 14, 15, 16], range: "1–5 pm", mix: "Bright Pop", ...sun(0x1E5ADC, 0xFFC800, .5, .1) },
  { name: "Evening", hours: [17, 18, 19], range: "5–8 pm", mix: "Fitted Pop", ...sun(0x873769, 0xFF6E4B, .5, .9) },
  { name: "Night", hours: [20, 21, 22], range: "8–11 pm", mix: "Smart Melodic House", ...sun(0x4B4178, 0xA0E1FF, .5, .236) },
  { name: "Late Night", hours: [23, 0, 1, 2], range: "11 pm–3 am", mix: "Moody Alternative R&B", ...sun(0x0A3228, 0x739BF5, .799, .212) },
];
const periodAt = (hour) => PERIODS.find((p) => p.hours.includes(hour));

function sunCover(el, period, name) {
  const rings = BREATHS.map(([size, from, to, d, delay], i) =>
    `<circle class="ring" r="${size * 400}" style="fill:${hex(period.rings[i])};opacity:${period.opacity[i]};--from:${from};--to:${to};--d:${d}s;--delay:-${delay}s"/>`).join("");
  el.innerHTML =
    `<svg viewBox="0 0 1000 1000" aria-hidden="true"><rect class="sky" width="1000" height="1000" style="fill:${hex(period.bg)}"/>` +
    `<g class="sun" style="transform:translate(${period.x * 1000}px,${period.y * 1000}px)">${rings}</g></svg>` +
    WAVE + `<div class="name"></div><div class="label">Meloday</div>`;
  setName(el, name);
}

function paintSun(el, period) {
  $(".sky", el).style.fill = hex(period.bg);
  $(".sun", el).style.transform = `translate(${period.x * 1000}px,${period.y * 1000}px)`;
  el.querySelectorAll(".ring").forEach((ring, i) => { ring.style.fill = hex(period.rings[i]); ring.style.opacity = period.opacity[i]; });
}

// Shrink the name until it fits three lines, as the app's CoverFit does.
function setName(el, text) {
  const name = $(".name", el);
  name.textContent = text;
  fitText(name, 8.5, 1, 3);
}

const measure = document.createElement("canvas").getContext("2d");

// Like CoverFit: the largest size up to the usual one where every word fits the width
// and the text fits its lines inside the 405-unit box.
function fitText(node, usual, lineRatio, maxLines) {
  const words = node.textContent.split(/\s+/);
  const weight = getComputedStyle(node).fontWeight;
  const box = node.parentElement.clientWidth * 0.405;
  node.style.maxHeight = "none";
  const fits = () => {
    const px = parseFloat(getComputedStyle(node).fontSize);
    measure.font = `${weight} ${px}px "DM Sans"`;
    if (words.some((w) => measure.measureText(w).width > node.clientWidth + 0.5)) return false;
    const height = node.offsetHeight;
    return height <= box + 1 && Math.round(height / (px * lineRatio)) <= maxLines;
  };
  let size = usual;
  node.style.fontSize = size + "cqw";
  while (size > 4 && !fits()) {
    size -= 0.1;
    node.style.fontSize = size + "cqw";
  }
  node.style.maxHeight = "";
}

/* ---------- Hero ---------- */

const now = new Date();
const today = DAYS[now.getDay()];
const hourInput = $("#hour");
const heroCover = $("#hero-cover");
const fmtHour = (h) => `${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;
const melodayName = (p) => `${p.mix} ${today} ${p.name}`;
let heroPeriod = null;

function setHour(hour, first) {
  const period = periodAt(hour);
  const out = $("#hour-out");
  out.textContent = `${today} ${fmtHour(hour)} · ${period.name}`;
  document.documentElement.style.setProperty("--sky", hex(period.bg));
  document.documentElement.style.setProperty("--sun", hex(period.rings[3]));
  heroCover.setAttribute("aria-label", `Meloday cover for ${period.name}: ${melodayName(period)}`);
  if (onHeroPeriod && period !== heroPeriod) onHeroPeriod(period);
  if (first) { sunCover(heroCover, period, melodayName(period)); heroPeriod = period; return; }
  if (period === heroPeriod) return;
  heroPeriod = period;
  paintSun(heroCover, period);
  const name = $(".name", heroCover);
  name.classList.add("fade");
  setTimeout(() => { setName(heroCover, melodayName(period)); name.classList.remove("fade"); }, 300);
}

hourInput.value = now.getHours();
hourInput.setAttribute("aria-valuetext", `${fmtHour(now.getHours())}, ${periodAt(now.getHours()).name}`);
hourInput.addEventListener("input", () => {
  const h = +hourInput.value;
  hourInput.setAttribute("aria-valuetext", `${fmtHour(h)}, ${periodAt(h).name}`);
  setHour(h);
});

/* ---------- The Home glow, from MelodayHalo.cs ----------
 * The corona of an eclipse whose disc sits out of sight past the edge of the page, so all that shows is light falling
 * in slow rays: the sun's core, the cover's middle ring band and its sky. Drawn small and scaled up, at the top of the
 * page and mirrored at the bottom, in the colours of the hour picked in the hero. */

const HALO = { columns: 160, ramp: 128, angular: 28, radial: 1.1, flares: .6, still: 40 };

const toLinear = (c) => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
const toSrgb = (c) => Math.min(1, Math.max(0, c <= .0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - .055));
const channels = (rgb) => [(rgb >> 16 & 255) / 255, (rgb >> 8 & 255) / 255, (rgb & 255) / 255];

function okLab(rgb) {
  const [r, g, b] = channels(rgb).map(toLinear);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  return [.2104542553 * l + .793617785 * m - .0040720468 * s, 1.9779984951 * l - 2.428592205 * m + .4505937099 * s, .0259040371 * l + .7827717662 * m - .808675766 * s];
}

function fromLab([L, A, B]) {
  const l = (L + .3963377774 * A + .2158037573 * B) ** 3, m = (L - .1055613458 * A - .0638541728 * B) ** 3, s = (L - .0894841775 * A - 1.291485548 * B) ** 3;
  return [toSrgb(4.0767416621 * l - 3.3077115913 * m + .2309699292 * s), toSrgb(-1.2684380046 * l + 2.6097574011 * m - .3413193965 * s), toSrgb(-.0004196086 * l - .2034181869 * m + 1.2076147365 * s)];
}

// The cover's rings are see-through and stacked, so a zone's colour is every ring over it laid on the sky in turn.
function haloColours(period) {
  const zone = (through) => period.rings.slice(0, through + 1).reduce((under, ring, i) => mixRgb(under, ring, period.opacity[i]), period.bg);
  return [zone(3), zone(1), period.bg];
}

function haloRamp(period) {
  const stops = haloColours(period).map(okLab), ramp = new Float32Array(HALO.ramp * 3);
  for (let i = 0; i < HALO.ramp; i++) {
    const at = i / (HALO.ramp - 1) * 2, k = Math.min(at | 0, 1), f = at - k;
    ramp.set(fromLab(stops[k].map((v, j) => v + (stops[k + 1][j] - v) * f)), i * 3);
  }
  return { ramp, sky: channels(period.bg) };
}

function haloHash(x, y, salt) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(salt, 1442695041)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h ^= h >>> 16;
  return (h & 0xFFFFFF) / 0x1000000;
}

function haloNoise(x, y, period) {
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const ix = ((x0 % period) + period) % period, ix1 = (ix + 1) % period;
  const u = fx * fx * (3 - 2 * fx), w = fy * fy * (3 - 2 * fy);
  const top = haloHash(ix, y0, period) + (haloHash(ix1, y0, period) - haloHash(ix, y0, period)) * u;
  const bottom = haloHash(ix, y0 + 1, period) + (haloHash(ix1, y0 + 1, period) - haloHash(ix, y0 + 1, period)) * u;
  return (top + (bottom - top) * w) * 2 - 1;
}

const smoothstep = (a, b, x) => { const f = Math.min(1, Math.max(0, (x - a) / (b - a))); return f * f * (3 - 2 * f); };

// Fills straight-alpha RGBA bytes. `mix` blends towards a second palette while the hour changes.
function renderHalo(pixels, columns, rows, aspect, seconds, from, to, mix) {
  const radius = Math.max(.8 * aspect, 1.2), cx = aspect / 2, cy = -radius - .06;
  const t = seconds % 100000, flow = t * .028, spin = t * Math.PI * 2 / 95;
  const sway = .35 * Math.sin(t * Math.PI * 2 / 71), lightX = Math.sin(sway), lightY = Math.cos(sway);
  const reach = .24 * (1 + .08 * Math.sin(t * Math.PI * 2 / 11.5));
  const { angular, radial, flares } = HALO;
  const ramp = mix <= 0 ? from.ramp : mix >= 1 ? to.ramp : from.ramp.map((v, j) => v + (to.ramp[j] - v) * mix);
  const sky = from.sky.map((v, j) => v + (to.sky[j] - v) * mix);
  for (let row = 0; row < rows; row++) {
    const py = (row + .5) / rows, fade = 1 - smoothstep(.2, .95, py), wash = .45 * (1 - py) ** 1.6;
    for (let col = 0; col < columns; col++) {
      const i = (row * columns + col) * 4;
      if (fade <= 0) { pixels[i + 3] = 0; continue; }
      const dx = (col + .5) / columns * aspect - cx, dy = py - cy;
      const r = Math.hypot(dx, dy), theta = Math.atan2(dy, dx), outside = Math.max(r - radius, 0);
      const u = (theta / (Math.PI * 2) + .5) * angular, v = Math.log(r / radius) * radial - flow;
      const fl = haloNoise(u, v, angular) + .5 * haloNoise(u * 2, v * 2 + 7.3, angular * 2);
      const len = reach * Math.max(1 + 1.5 * flares * fl, .15);
      const radiance = Math.exp(-outside / len) + .2 * Math.exp(-outside / (3.5 * len));
      const facing = .5 + .5 * (dx * lightX + dy * lightY) / r, arc = .65 + .35 * facing ** 3;
      const turn = .5 + .5 * Math.cos(theta - Math.PI / 2 - spin + .5 * flares * fl);
      const s = Math.min(1, Math.max(0, .4 * (1 - turn) + .6 * (1 - Math.exp(-outside * 2.5))));
      const k = ((s * (HALO.ramp - 1)) | 0) * 3;
      const cr = ramp[k], cg = ramp[k + 1], cb = ramp[k + 2];
      const lum = .2126 * cr + .7152 * cg + .0722 * cb, dark = 1 - lum;
      const light = radiance * arc / (1 + .5 * lum * lum) * (1 + 2 * dark ** 3) * 1.5;
      const wet = wash * (1 - Math.min(light, 1));
      const rr = cr * light + sky[0] * wet, gg = cg * light + sky[1] * wet, bb = cb * light + sky[2] * wet;
      const peak = Math.max(rr, gg, bb, 1e-6);
      // Past full brightness the colour scales down as a whole rather than clipping, so a yellow sun stays yellow.
      pixels[i] = rr / peak * 255; pixels[i + 1] = gg / peak * 255; pixels[i + 2] = bb / peak * 255;
      pixels[i + 3] = Math.min(peak, 1) * fade * 255;
    }
  }
}

let onHeroPeriod = null;

function buildHalo(start) {
  const layers = [...document.querySelectorAll(".halo")].map((canvas, n) => ({ canvas, ctx: canvas.getContext("2d"), offset: n * 37, seen: false, image: null }));
  let from = haloRamp(start), to = from, changedAt = -10;
  const clock = performance.now();
  const seconds = () => (performance.now() - clock) / 1000;
  const draw = (layer) => {
    const { canvas, ctx } = layer;
    const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    const rows = Math.max(16, Math.min(160, Math.round(HALO.columns / aspect)));
    if (canvas.width !== HALO.columns || canvas.height !== rows) { canvas.width = HALO.columns; canvas.height = rows; layer.image = null; }
    layer.image ??= ctx.createImageData(HALO.columns, rows);
    const now = seconds(), mix = smoothstep(0, 1.2, now - changedAt);
    renderHalo(layer.image.data, HALO.columns, rows, aspect, HALO.still + layer.offset + (reduceMotion.matches ? 0 : now), from, to, mix);
    ctx.putImageData(layer.image, 0, 0);
  };
  onHeroPeriod = (period) => {
    from = to;
    to = haloRamp(period);
    changedAt = seconds();
    if (reduceMotion.matches) layers.forEach(draw);
  };

  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const layer = layers.find((l) => l.canvas === e.target);
    layer.seen = e.isIntersecting;
    if (layer.seen) draw(layer);
  }));
  layers.forEach((l) => io.observe(l.canvas));
  let last = 0;
  const tick = (now) => {
    requestAnimationFrame(tick);
    if (now - last < 1000 / 30) return;
    if (reduceMotion.matches && seconds() - changedAt > 1.3) return;
    last = now;
    layers.forEach((l) => { if (l.seen) draw(l); });
  };
  requestAnimationFrame(tick);
  addEventListener("resize", () => layers.forEach((l) => { if (l.seen) draw(l); }));

  // Like the app's Home glow, the top one drifts up a little slower than the page.
  const top = layers[0]?.canvas;
  if (top) {
    let queued = false;
    addEventListener("scroll", () => {
      if (queued || reduceMotion.matches) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; top.style.transform = `translateY(${Math.min(scrollY, innerHeight * 1.2) * .3}px)`; });
    }, { passive: true });
  }
}

/* ---------- Day strip ---------- */

function buildStrip() {
  const current = periodAt(now.getHours());
  $("#day-strip").innerHTML = PERIODS.map((p, i) => `
    <li>
      <div class="cover" data-i="${i}" role="img" aria-label="${p.name} cover"></div>
      <p class="when">${p.name}${p === current ? ' <span class="badge">Now</span>' : ""}</p>
      <p class="hours-label">${p.range}</p>
    </li>`).join("");
  document.querySelectorAll("#day-strip .cover").forEach((el) => sunCover(el, PERIODS[el.dataset.i], PERIODS[el.dataset.i].mix));
  sunCover($("#closing-cover"), current, current.mix);
}

/* ---------- Mix covers, after MixCover.cs ---------- */

const FAMILIES = [
  [0xF57387, 0xDC143C, 0x960A28], [0xF05F7D, 0xBE0A37, 0x780523], [0xFDA58C, 0xEE5005, 0xA52D19],
  [0xEB966E, 0xC8502D, 0x872D14], [0xFFAF91, 0xFF6E4B, 0xB93C23], [0xFFE169, 0xFFB400, 0xB47800],
  [0xAAEB91, 0x5AD746, 0x379128], [0x7DCDCD, 0x009191, 0x005F5F], [0xB4F5E1, 0x2DC8AA, 0x198770],
  [0xB4E1F5, 0x3CA5E1, 0x2873A5], [0x82AFFF, 0x1E5ADC, 0x0F3796], [0xC3D7FF, 0x739BF5, 0x4B69B9],
  [0xD2AFFF, 0x8732FF, 0x5514B4], [0xE6CDFA, 0xB987E6, 0x7850A5], [0xCDA0B9, 0x873769, 0x551941],
  [0xFFA5DC, 0xE11487, 0x960A55], [0xFFC3E1, 0xFF80B9, 0xB43C73],
];

// MixCircles.OrbitSlots: the main picture, then two smaller ones ringed in the ground colour.
const ORBIT = [[0.5, 0.42, 0.54], [0.2, 0.29, 0.25], [0.82, 0.61, 0.27]];
const RING = 16;
let clipId = 0;
// Names are fitted once the cover has a size, and again whenever it changes.
const nameFit = new ResizeObserver((entries) => entries.forEach((e) => {
  const name = $(".name", e.target);
  if (name && e.contentRect.width) fitText(name, 8.5, 1, 3);
}));

function mixCover(el, mix, seed) {
  const r = rng(mix.name + seed);
  const [, edge, ground] = FAMILIES[mix.family];
  const [main, ...rest] = mix.pictures;
  const orbit = rest.map((p) => [r(), p]).sort((a, b) => a[0] - b[0]).slice(0, 2).map(([, p]) => p);
  const circle = ([x, y, d], picture, i) => {
    const cx = x * 1000, cy = y * 1000, outer = d * 500, inner = i ? outer - RING : outer, id = "mc" + clipId++;
    const motion = i ? ` class="orbit" style="--d:${(7 + r() * 4).toFixed(1)}s;--dx:${(r() * 16 - 8).toFixed(0)}px;--dy:${(r() * 16 - 8).toFixed(0)}px"` : "";
    return `<g${motion}>${i ? `<circle cx="${cx}" cy="${cy}" r="${outer}" fill="${hex(ground)}"/>` : ""}` +
      `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${inner}"/></clipPath>` +
      `<image href="${art(picture)}" x="${cx - inner}" y="${cy - inner}" width="${inner * 2}" height="${inner * 2}" clip-path="url(#${id})" preserveAspectRatio="xMidYMid slice"/></g>`;
  };
  el.innerHTML =
    `<svg viewBox="0 0 1000 1000" aria-hidden="true"><rect width="1000" height="1000" fill="${hex(ground)}"/>` +
    [main, ...orbit].map((p, i) => circle(ORBIT[i], p, i)).join("") +
    `<rect y="964" width="1000" height="36" fill="${hex(edge)}"/><rect y="760" width="18" height="120" fill="${hex(edge)}"/></svg>` +
    WAVE + `<div class="label">${mix.radio ? "Radio" : "Mix"}</div><div class="name"></div>`;
  const name = $(".name", el);
  name.textContent = mix.name.replace(/ Mix$/, "");
  if (el.clientWidth) fitText(name, 8.5, 1, 3);
  nameFit.observe(el);
}

const MIXES = [
  { made: "late-night", name: "Late Night", sub: "Nicki Minaj, Frank Ocean, Massive Attack and more" },
  { made: "road-trip", name: "Road Trip", sub: "MARINA, Fleetwood Mac, Bad Bunny and more" },
  { made: "rainy-day", name: "Rainy Day", sub: "Laufey, Bon Iver, Phoebe Bridgers and more" },
  { made: "feel-good", name: "Feel Good", sub: "Davido, Ozuna, Stevie Wonder and more" },
  { name: "R&B Deep Cuts", sub: "Niche mix", family: 12, pictures: ["SZA|SOS", "Frank Ocean|channel ORANGE", "Kali Uchis|Red Moon In Venus", "The Weeknd|House Of Balloons (Original)"] },
  { name: "Hazy Psych", sub: "Your Sounds", family: 15, pictures: ["Tame Impala|Currents", "MGMT|Oracular Spectacular", "Khruangbin|Texas Moon", "Gorillaz|Demon Days"] },
  { name: "Hip Hop Classics", sub: "Niche mix", family: 10, pictures: ["Outkast|Speakerboxxx/The Love Below", "Kendrick Lamar|good kid, m.A.A.d city", "Kanye West|Late Registration", "Tyler, The Creator|Flower Boy"] },
  { name: "Amy Winehouse Mix", sub: "Artist mix", family: 0, pictures: ["photo|Amy Winehouse", "photo|Nina Simone", "photo|Stevie Wonder", "photo|Massive Attack"] },
];
let mixSeed = 0;

function buildMixes() {
  const grid = $("#mix-grid");
  if (!grid.children.length) {
    grid.innerHTML = MIXES.map((m) => `
      <li><div class="cover${m.made ? " photo" : ""}" role="img" aria-label="${m.name} cover">${m.made ? `<img src="${art("made|" + m.made)}" alt="" loading="lazy">` : ""}</div>
      <p class="title">${m.name}</p><p class="sub">${m.made ? "Made by Meloday · " + m.sub : m.sub}</p></li>`).join("");
  }
  [...grid.children].forEach((li, i) => { if (!MIXES[i].made) mixCover($(".cover", li), MIXES[i], mixSeed); });
}

/* ---------- Live station cover, from StationWave.cs ---------- */

const WAVE_BASE = [0.1,0.1,0.1,0.1,0.1,0.1,0.1,0,0,-0,-0,-0.1,-0.1,-0.1,-0.1,-0.1,-0.1,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.1,-0.1,-0.1,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.3,-0.3,-0.4,-0.5,-0.8,-1,-1.4,-2,-2.6,-3.4,-4.3,-5.3,-6.5,-7.9,-9.4,-11.2,-13.2,-15.3,-17.8,-20.5,-23.4,-26.6,-30.1,-33.8,-37.8,-41.9,-46.3,-50.8,-55.4,-60.2,-65.1,-70.1,-75.2,-80.5,-85.8,-91.3,-96.9,-102.5,-108.2,-114,-119.8,-125.6,-131.4,-137,-142.6,-148.1,-153.5,-158.7,-163.7,-168.6,-173.3,-177.8,-182.2,-186.3,-190.2,-193.8,-197.1,-200,-202.4,-204.2,-205.4,-205.9,-205.7,-204.7,-203.1,-200.8,-197.9,-194.4,-190.4,-185.9,-181,-175.7,-170,-163.9,-157.4,-150.6,-143.4,-136,-128.3,-120.4,-112.2,-103.8,-95.4,-86.8,-78.2,-69.6,-61.2,-52.9,-44.7,-36.7,-28.9,-21.3,-13.8,-6.4,0.8,7.9,14.9,21.8,28.5,35,41.4,47.4,53.1,58.4,63.2,67.4,70.9,73.6,75.5,76.5,76.6,75.8,74.1,71.7,68.6,65,60.8,56.2,51.3,46.1,40.7,35,29.3,23.4,17.3,11.1,4.8,-1.7,-8.3,-15,-21.8,-28.8,-35.8,-42.9,-49.9,-56.9,-63.7,-70.5,-77.1,-83.5,-89.8,-95.9,-101.7,-107.4,-112.8,-118,-122.9,-127.5,-131.7,-135.6,-139,-141.9,-144.4,-146.3,-147.7,-148.5,-148.8,-148.6,-147.8,-146.5,-144.6,-142.3,-139.5,-136.3,-132.8,-129.1,-125.2,-121.1,-116.9,-112.7,-108.5,-104.2,-99.9,-95.6,-91.3,-86.9,-82.5,-78,-73.5,-69,-64.3,-59.7,-55,-50.5,-46,-41.6,-37.4,-33.4,-29.6,-26.1,-22.9,-19.9,-17.2,-14.8,-12.7,-10.7,-9,-7.5,-6.2,-5.1,-4.1,-3.2,-2.5,-1.9,-1.4,-1,-0.7,-0.5,-0.4,-0.3,-0.3,-0.2,-0.2,-0.2,-0.2,-0.2,-0.2,-0.3,-0.3,-0.3,-0.3,-0.3,-0.4,-0.4,-0.4,-0.4,-0.4,-0.4,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.5,-0.4,-0.4,-0.4,-0.3,-0.3,-0.2];
const STATION = { side: 1080, loop: 6, line: 84, centre: 540, span: 1420, resting: 0.8 };
const TRAILS = [[0.24, 1.08, 3.10], [0.50, 0.54, 1.75]];

const waveProfile = (() => {
  const n = WAVE_BASE.length, gauss = (u, mu, sigma) => Math.exp(-0.5 * ((u - mu) / sigma) ** 2);
  return Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1), c = Math.min(1, Math.max(0, (u - 0.05) / 0.9));
    return {
      u, x: STATION.side / 2 + (u - 0.5) * STATION.span, base: WAVE_BASE[i],
      first: gauss(u, 0.347565043362, 0.145), valley: gauss(u, 0.508338892595, 0.12), second: gauss(u, 0.663775850567, 0.145),
      edge: Math.sin(Math.PI * c) ** 1.3,
    };
  });
})();

function deform(t) {
  const first = 58 * Math.sin(t) + 12 * Math.sin(2 * t + 0.10) + 5 * Math.sin(3 * t + 0.75);
  const valley = 72 * Math.sin(t + 2 * Math.PI / 3) + 15 * Math.sin(2 * t + 1.00) + 6 * Math.sin(3 * t + 1.45);
  const second = 56 * Math.sin(t + 4 * Math.PI / 3) + 12 * Math.sin(2 * t + 1.92) + 5 * Math.sin(3 * t + 2.10);
  return waveProfile.map((p) => {
    const travel = 17 * Math.sin(2 * Math.PI * (p.u * 1.3) - t) + 7 * Math.sin(2 * Math.PI * (p.u * 0.8) + t) + 3 * Math.sin(2 * Math.PI * (p.u * 2.2) - 2 * t);
    return (first * p.first + valley * p.valley + second * p.second + travel) * p.edge;
  });
}

function waveRuns(side) {
  const runs = [], last = side.length - 1;
  let i = 0;
  while (i < last) {
    while (i < last && side[i] === 0) i++;
    if (i >= last) break;
    const s = side[i], start = Math.max(0, i - 1);
    let j = i + 1;
    while (j < side.length && (side[j] === s || side[j] === 0)) {
      if (side[j] === 0 && j + 1 < side.length && side[j + 1] !== 0 && side[j + 1] !== s) break;
      j++;
    }
    const stop = Math.min(last, j);
    if (stop - start >= 2) runs.push([start, stop]);
    i = Math.max(i + 1, stop);
  }
  return runs;
}

// The wave's colour on a ground: the same hue, lighter and fuller.
function waveHighlight(ground) {
  const r = (ground >> 16 & 255) / 255, g = (ground >> 8 & 255) / 255, b = (ground & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let l = (max + min) / 2, s = d < 1e-9 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = d < 1e-9 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  l += (1 - l) * 0.45; s = Math.min(1, s * 1.9); if (h < 0) h += 6;
  const chroma = (1 - Math.abs(2 * l - 1)) * s, x = chroma * (1 - Math.abs((h % 2) - 1));
  const [r1, g1, b1] = h < 1 ? [chroma, x, 0] : h < 2 ? [x, chroma, 0] : h < 3 ? [0, chroma, x] : h < 4 ? [0, x, chroma] : h < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const m = l - chroma / 2, byte = (v) => Math.round(Math.min(1, Math.max(0, v + m)) * 255);
  return [byte(r1), byte(g1), byte(b1)];
}

function liveCover(el, ground) {
  el.innerHTML = `<canvas aria-hidden="true"></canvas>${WAVE}<span class="live-badge">Live</span>`;
  el.style.background = hex(ground);
  const [hr, hg, hb] = waveHighlight(ground);
  const offset = Math.floor((ground * 2654435761) / 65536) % 6000 / 1000;
  canvasLoop($("canvas", el), (ctx, w, h, t) => {
    const seconds = STATION.resting + offset + (reduceMotion.matches ? 0 : t);
    const phase = 2 * Math.PI * (((seconds % STATION.loop) + STATION.loop) % STATION.loop) / STATION.loop;
    ctx.fillStyle = hex(ground); ctx.fillRect(0, 0, w, h);
    const scale = Math.max(w, h) / STATION.side;
    ctx.save();
    ctx.translate((w - STATION.side * scale) / 2, (h - STATION.side * scale) / 2);
    ctx.scale(scale, scale);
    const motion = deform(phase);
    const front = waveProfile.map((p, i) => STATION.centre + p.base + motion[i]);
    for (const [alpha, delay, stretch] of TRAILS) {
      const delayed = deform(phase - delay), inner = [], outer = [], side = [];
      waveProfile.forEach((p, i) => {
        const delta = (delayed[i] - motion[i]) * p.edge, toward = delta < 0 ? -1 : 1;
        side.push(Math.abs(delta) < 0.15 ? 0 : toward);
        inner.push(front[i] + toward * STATION.line / 2);
        outer.push(inner[i] + delta * stretch);
      });
      ctx.fillStyle = `rgba(${hr},${hg},${hb},${alpha})`;
      for (const [start, stop] of waveRuns(side)) {
        ctx.beginPath();
        ctx.moveTo(waveProfile[start].x, outer[start]);
        for (let i = start + 1; i <= stop; i++) ctx.lineTo(waveProfile[i].x, outer[i]);
        for (let i = stop; i >= start; i--) ctx.lineTo(waveProfile[i].x, inner[i]);
        ctx.closePath(); ctx.fill();
      }
    }
    ctx.beginPath();
    waveProfile.forEach((p, i) => (i ? ctx.lineTo(p.x, front[i]) : ctx.moveTo(p.x, front[i])));
    ctx.strokeStyle = `rgb(${hr},${hg},${hb})`; ctx.lineWidth = STATION.line; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  });
}

/* ---------- Pulse guide, from PulseProgramme.cs ---------- */

function programmes(day) {
  const evening = day === 5
    ? [[18, 19, "Weekly Picks", "The week's strongest new songs"], [19, 20, "New Release Countdown", "The top new songs, counted down"]]
    : [[18, 20, "Rap & R&B", "Hip-hop and R&B from your library"]];
  return [
    [6, 9, "Morning Pulse", "Easy favourites to start the day"],
    [9, 12, "New Music", "Fresh releases and recent additions"],
    [12, 14, "Chart Pulse", "What's trending in your library"],
    [14, 16, "Then & Now", "Older favourites mixed with new ones"],
    [16, 18, "Pop Focus", "Pop from your library"],
    ...evening,
    [20, 22, "Alternative Focus", "Alternative from your library"],
    [22, 30, "Continuous Pulse", "Your whole library on rotation"],
  ];
}

function buildGuide() {
  const h = now.getHours(), hour = h < 6 ? h + 24 : h;
  const list = programmes(now.getDay());
  const span = (a, b) => {
    const [x, y] = [a % 24, b % 24];
    const same = (x < 12) === (y < 12) && y !== 0 && x !== 0;
    return same ? `${x % 12 || 12}–${fmtHour(y)}` : `${fmtHour(x)}–${fmtHour(y)}`;
  };
  $("#guide-list").innerHTML = list.map(([a, b, title, desc]) => {
    const on = hour >= a && hour < b, past = hour >= b;
    return `<li class="${on ? "on" : past ? "past" : ""}"><span class="t">${span(a, b)}</span>` +
      `<span><span class="p">${title}</span><span class="d">${desc}</span></span>${on ? '<span class="badge">On air</span>' : "<span></span>"}</li>`;
  }).join("");
  const live = list.find(([a, b]) => hour >= a && hour < b);
  liveCover($("#pulse-cover"), 0x1442AC);
  $("#guide-now").textContent = `${today}'s schedule. On air now: ${live[2]}.`;
}

/* ---------- Meloday Engine search ---------- */

const QUERIES = {
  "late night r&b": { groups: [["Moments", [["late night", .84], ["night drive", .52]]], ["Genre", [["r&b", .9], ["soul", .48]]], ["Mood", [["sensual", .71], ["chill", .62]]], ["Energy", [["calm", .64]]]],
    songs: [["Snooze", "SZA", "SZA|SOS"], ["Thinkin Bout You", "Frank Ocean", "Frank Ocean|channel ORANGE"], ["Wicked Games", "The Weeknd", "The Weeknd|House Of Balloons (Original)"]], next: ["Late Night Soul", "Smooth R&B"] },
  "upbeat house": { groups: [["Energy", [["upbeat", .86], ["danceable", .9]]], ["Genre", [["house", .88], ["french house", .61]]], ["Mood", [["happy", .66]]], ["Moments", [["party", .72], ["workout", .41]]]],
    songs: [["One More Time", "Daft Punk", "Daft Punk|Discovery"], ["Latch", "Disclosure", "Disclosure|Settle (Deluxe Version)"], ["SPACE INVADER", "KAYTRANADA", "KAYTRANADA|AIN'T NO DAMN WAY!"]], next: ["Disco House", "Party House"] },
  "sad indie": { groups: [["Mood", [["sad", .8], ["melancholy", .77]]], ["Genre", [["indie folk", .74], ["alternative", .62]]], ["Instruments", [["acoustic guitar", .7], ["piano", .38]]], ["Energy", [["calm", .75]]]],
    songs: [["Holocene", "Bon Iver", "Bon Iver|Bon Iver, Bon Iver"], ["Funeral", "Phoebe Bridgers", "Phoebe Bridgers|Stranger in the Alps (Deluxe Edition)"], ["Karma Police", "Radiohead", "Radiohead|Karma Police"]], next: ["Indie Folk", "Quiet Songs"] },
  "hazy psych grooves": { groups: [["Mood", [["dreamy", .76], ["groovy", .7]]], ["Genre", [["psychedelic", .86], ["indie rock", .58]]], ["Instruments", [["bass guitar", .73], ["synthesizer", .6]]], ["Moments", [["night drive", .55]]]],
    songs: [["Let It Happen", "Tame Impala", "Tame Impala|Currents"], ["Electric Feel", "MGMT", "MGMT|Oracular Spectacular"], ["Mariella", "Khruangbin", "Khruangbin|Texas Moon"]], next: ["Psych Rock", "Late Night Grooves"] },
  "chill, not sad": { groups: [["Mood", [["chill", .84], ["happy", .58], ["groovy", .55]]], ["Energy", [["calm", .66]]], ["Leaving out", [["sad", 0], ["melancholy", 0]]]],
    songs: [["Feel Good Inc.", "Gorillaz", "Gorillaz|Demon Days"], ["Dreams", "Fleetwood Mac", "Fleetwood Mac|Rumours"], ["See You Again", "Tyler, The Creator", "Tyler, The Creator|Flower Boy"]], next: ["Feel Good", "Sunny Grooves"] },
  "3am": { groups: [["Moments", [["late night", .81], ["night drive", .6]]], ["Mood", [["dreamy", .7], ["chill", .66]]], ["Energy", [["calm", .7]]]],
    songs: [["Teardrop", "Massive Attack", "Massive Attack|Mezzanine"], ["Moonlight", "Kali Uchis", "Kali Uchis|Red Moon In Venus"], ["May Ninth", "Khruangbin", "Khruangbin|A LA SALA"]], next: ["Late Night Grooves", "Dreamy Indie"] },
};
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bR&b\b/, "R&B");
let typing = 0;

function runQuery(q) {
  const token = ++typing;
  document.querySelectorAll("#engine-chips .chip").forEach((c) => c.setAttribute("aria-pressed", c.textContent === q));
  const field = $("#engine-query"), hears = $("#engine-hears"), create = $("#engine-create span");
  const data = QUERIES[q];
  hears.innerHTML = data.groups.map(([g, words]) => g === "Leaving out"
    ? `<div class="hear"><span class="g">${g}</span><span class="words muted">${words.map(([w]) => w).join(", ")}</span></div>`
    : `<div class="hear"><span class="g">${g}</span><span class="words">${words.map(([w, c]) =>
    `<span class="word${c < .5 ? " weak" : ""}">${w}<span class="meter" aria-hidden="true"><i data-w="${Math.round(c * 100)}"></i></span><span class="visually-hidden">${Math.round(c * 100)}%</span></span>`).join("")}</span></div>`).join("") +
    `<div class="hear results"><span class="g">Top matches</span><ol>${data.songs.map(([title, artist, album]) =>
      `<li><img src="${art(album)}" alt="" loading="lazy"><span><b>${title}</b><span>${artist}</span></span></li>`).join("")}</ol></div>` +
    `<div class="hear"><span class="g">Try next</span><span class="words muted">${data.next.join(", ")}</span></div>`;
  create.textContent = `Create Playlist: Sounds Like ${titleCase(q)}`;
  const reveal = () => [...hears.children].forEach((row, i) => setTimeout(() => {
    if (token !== typing) return;
    row.classList.add("in");
    row.querySelectorAll("i").forEach((m) => { m.style.width = m.dataset.w + "%"; });
  }, reduceMotion.matches ? 0 : i * 90));
  if (reduceMotion.matches) { field.textContent = q; reveal(); return; }
  field.textContent = "";
  [...q].forEach((ch, i) => setTimeout(() => {
    if (token !== typing) return;
    field.textContent += ch;
    if (i === q.length - 1) setTimeout(reveal, 180);
  }, 40 * i));
}

function buildEngine() {
  const chips = $("#engine-chips");
  chips.innerHTML = Object.keys(QUERIES).map((q) => `<button class="chip" type="button" aria-pressed="false">${q}</button>`).join("");
  chips.addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) runQuery(b.textContent); });
  let started = false;
  new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting && !started) { started = true; runQuery("late night r&b"); obs.disconnect(); }
  }, { threshold: 0.4 }).observe($(".engine"));
}

/* ---------- Canvas helpers ---------- */

function canvasLoop(canvas, draw) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, visible = false, raf = 0, start = performance.now();
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const frame = (t) => {
    draw(ctx, w, h, (t - start) / 1000);
    if (visible && !reduceMotion.matches) raf = requestAnimationFrame(frame);
  };
  const kick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  new ResizeObserver(() => { size(); kick(); }).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(canvas);
  return { redraw: kick };
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}

const FONT = '"DM Sans", "Segoe UI", sans-serif';

/* ---------- AutoMix diagram ---------- */

function buildMixer() {
  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const gains = {
    highs: [(t) => 1 - smooth((t - 6) / 2), (t) => smooth(t / 2)],
    mids: [(t) => 1 - smooth((t - 4) / 2), (t) => smooth((t - 2) / 2)],
    lows: [(t) => (t < 4 ? 1 : 0), (t) => (t < 4 ? 0 : 1)],
  };
  const noise = (i, s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  const texture = {
    highs: (t, i, s) => 0.25 + 0.55 * Math.exp(-((t * 8) % 1) * 7) + 0.2 * noise(i, s),
    mids: (t, i, s) => 0.45 + 0.25 * Math.sin(t * 3.1 + s) + 0.25 * noise(i, s + 3),
    lows: (t, i, s) => 0.3 + 0.7 * Math.exp(-((t * 4) % 1) * 5),
  };
  const rows = [["Highs", "highs"], ["Mids", "mids"], ["Lows", "lows"]];
  const A = "#FF6E4B", B = "#1EB4FF";

  canvasLoop($("#mix-canvas"), (ctx, w, h, time) => {
    ctx.clearRect(0, 0, w, h);
    const left = w < 520 ? 56 : 72, right = 8, top = 30, axis = 30;
    const plotW = w - left - right, rowH = (h - top - axis) / 3;
    const loop = 11, play = reduceMotion.matches ? 5.2 : Math.min(8, ((time % loop) / (loop - 1)) * 8.4);
    const cols = Math.max(48, Math.floor(plotW / 6));
    const colW = plotW / cols;

    rows.forEach(([label, key], r) => {
      const y0 = top + r * rowH, mid = y0 + rowH / 2, amp = rowH / 2 - 6;
      ctx.fillStyle = "rgba(255,255,255,.04)";
      roundRect(ctx, left, y0 + 2, plotW, rowH - 4, 10); ctx.fill();
      ctx.fillStyle = "#B3AFA8"; ctx.font = `700 14px ${FONT}`; ctx.textBaseline = "middle";
      ctx.fillText(label, 0, mid);
      for (let i = 0; i < cols; i++) {
        const t = ((i + 0.5) / cols) * 8;
        const ahead = t > play;
        const x = left + i * colW + colW * 0.2, bw = Math.max(1.5, colW * 0.6);
        const a = gains[key][0](t) * texture[key](t, i, 1) * amp, b = gains[key][1](t) * texture[key](t, i, 7) * amp;
        ctx.globalAlpha = ahead ? 0.28 : 1;
        if (a > 0.5) { ctx.fillStyle = A; roundRect(ctx, x, mid - a, bw, a, bw / 2); ctx.fill(); }
        if (b > 0.5) { ctx.fillStyle = B; roundRect(ctx, x, mid + 1, bw, b, bw / 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
    });

    // The bass swap on the downbeat of bar 5.
    const swapX = left + plotW / 2;
    ctx.strokeStyle = "rgba(244,242,238,.5)"; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(swapX, top - 4); ctx.lineTo(swapX, h - axis); ctx.stroke(); ctx.setLineDash([]);

    ctx.fillStyle = "#8C8881"; ctx.font = `700 14px ${FONT}`; ctx.textBaseline = "alphabetic";
    for (let b = 0; b < 8; b++) {
      const x = left + (b / 8) * plotW;
      ctx.fillText(w < 520 ? `${b + 1}` : `Bar ${b + 1}`, x + 4, h - 8);
    }
    ctx.fillStyle = "#F4F2EE"; ctx.font = `800 14px ${FONT}`;
    const swapText = "Bass swap";
    ctx.fillText(swapText, swapX - ctx.measureText(swapText).width / 2, 18);

    const px = left + (play / 8) * plotW;
    ctx.fillStyle = "#F4F2EE";
    roundRect(ctx, px - 1.5, top, 3, h - top - axis + 4, 1.5); ctx.fill();
  });
}

/* ---------- Visualizers ---------- */
// Ports of the app's painters (src/MelodayMusic.App/Controls), fed by a smoothly drifting spectrum so the page stays silent.

const vHash = (a, b) => {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h & 0xFFFFFF) / 0x1000000;
};
const vNoise = (x, y, seed = 0) => {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const c = (cx, cy) => vHash(cx + seed * 7919, cy * 31 + seed);
  const top = c(ix, iy) + (c(ix + 1, iy) - c(ix, iy)) * u;
  const bottom = c(ix, iy + 1) + (c(ix + 1, iy + 1) - c(ix, iy + 1)) * u;
  return top + (bottom - top) * v;
};
const vLayered = (x, y, seed = 0) => (vNoise(x, y, seed) * 2 + vNoise(x * 2.3 + 17, y * 2.3 + 5, seed + 1)) / 3;
const vSmooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const vAverage = (values, from, to) => { let s = 0; for (let i = from; i < to; i++) s += values[i]; return s / Math.max(1, to - from); };
const vMix = (a, b, t) => { t = Math.min(1, Math.max(0, t)); return a.map((x, i) => x + (b[i] - x) * t); };
const vCss = (c, a = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;

function hsv(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][Math.floor(h / 60) % 6];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}
function toHsv([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const h = d < 1e-6 ? 0 : (max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  return [(h + 360) % 360, max <= 0 ? 0 : d / max, max];
}

/** VisualPalette.From: the artwork's strongest hue, brightened, with two neighbours and a light tone. */
function paletteFrom(colour) {
  const [h, s, v] = toHsv(colour);
  const main = hsv(h, Math.min(1, s * 1.2), Math.max(v, 0.82));
  const [mh, ms, mv] = toHsv(main);
  const near = (deg) => hsv((((mh + deg) % 360) + 360) % 360, ms, mv);
  return [near(-46), near(-20), main, vMix(main, [255, 255, 255], 0.5)];
}

/** The most vivid colour in an image, weighted by how much of the image it covers. */
function vividColour(img) {
  const c = document.createElement("canvas"), n = 48;
  c.width = c.height = n;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.drawImage(img, 0, 0, n, n);
  const data = x.getImageData(0, 0, n, n).data, bins = Array.from({ length: 24 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  for (let i = 0; i < data.length; i += 4) {
    const rgb = [data[i], data[i + 1], data[i + 2]], [h, s, v] = toHsv(rgb);
    if (s < 0.25 || v < 0.25) continue;
    const bin = bins[Math.floor(h / 15) % 24], w = s * s * v;
    bin.w += w; bin.r += rgb[0] * w; bin.g += rgb[1] * w; bin.b += rgb[2] * w;
  }
  const best = bins.reduce((a, b) => (b.w > a.w ? b : a));
  return best.w > 0 ? [best.r / best.w, best.g / best.w, best.b / best.w] : [244, 242, 238];
}

/** A 32-band spectrum that drifts smoothly, with no beat, so the visualizers glide rather than twitch. */
function makeFlow() {
  const N = 32, bands = new Float32Array(N);
  return {
    bpm: 90, bands, bass: 0, level: 0,
    update(t) {
      for (let b = 0; b < N; b++) {
        const along = b / (N - 1), slow = vNoise(t * 0.32, b * 0.2, 7);
        const wave = 0.5 + 0.5 * Math.sin(t * 0.8 - along * 5);
        bands[b] = (0.12 + 0.62 * slow * slow + 0.26 * wave) * (1 - along * 0.3);
      }
      this.bass = vAverage(bands, 0, 4);
      this.level = vAverage(bands, 0, N) * 0.4;
    },
    pulse() { return 0; },
  };
}

/** Each band eased towards the spectrum, so shapes change gently. */
function bandFollower(count) {
  const levels = new Float32Array(count);
  return {
    levels,
    update(bands, slices, dt) {
      slices = Math.min(slices, count);
      const ease = 1 - Math.exp(-dt / 0.35);
      for (let i = 0; i < slices; i++) {
        const from = Math.floor((i * bands.length) / slices);
        const raw = vAverage(bands, from, Math.max(from + 1, Math.floor(((i + 1) * bands.length) / slices)));
        levels[i] += (raw - levels[i]) * ease;
      }
    },
  };
}

function barsPainter() {
  const COUNT = 12;
  return (ctx, s, p, t, w, h) => {
    const bands = s.bands, span = Math.min(w * 0.84, h * 1.6), slot = span / COUNT, bw = slot * 0.88;
    const left = (w - span) / 2 + (slot - bw) / 2, mid = h * 0.5, tallest = Math.min(h * 0.64, span * 0.62);
    const swell = 1 + 0.06 * s.pulse(t);
    for (let i = 0; i < COUNT; i++) {
      const level = Math.min(1, vAverage(bands, Math.floor((i * bands.length) / COUNT), Math.floor(((i + 1) * bands.length) / COUNT)) * 1.15);
      const bh = Math.min(h * 0.9, bw + level * (tallest - bw) * swell);
      const drift = Math.sin(i * 1.9 + t * 0.7) * h * 0.035 * (0.4 + level);
      const top = Math.min(Math.max(mid - bh / 2 + drift, h * 0.04), h * 0.96 - bh);
      const x = left + i * slot, g = ctx.createLinearGradient(0, top, 0, top + bh);
      g.addColorStop(0, vCss(p[3])); g.addColorStop(1, vCss(p[1]));
      ctx.fillStyle = g; roundRect(ctx, x, top, bw, bh, bw / 2); ctx.fill();
    }
  };
}

function haloPainter() {
  const SPOKES = 96;
  return (ctx, s, p, t, w, h) => {
    const cx = w / 2, cy = h / 2, m = Math.min(w, h), r0 = m * 0.22 * (1 + 0.07 * s.bass), reach = m * 0.26;
    ctx.fillStyle = vCss(p[2], 0.1 + 0.22 * s.bass);
    ctx.beginPath(); ctx.arc(cx, cy, r0 * 0.97, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = vCss(p[3], 0.55); ctx.lineWidth = Math.max(1.5, m * 0.004); ctx.stroke();
    ctx.lineCap = "round"; ctx.lineWidth = Math.max(2, m * 0.0085);
    for (let k = 0; k < SPOKES; k++) {
      const fold = k <= SPOKES / 2 ? k : SPOKES - k, along = (fold * (s.bands.length - 1)) / (SPOKES / 2);
      const lo = Math.floor(along), hi = Math.min(s.bands.length - 1, lo + 1);
      const level = s.bands[lo] * (1 - (along - lo)) + s.bands[hi] * (along - lo);
      const a = (k / SPOKES) * Math.PI * 2 - Math.PI / 2, dx = Math.cos(a), dy = Math.sin(a), len = m * 0.012 + level * reach;
      ctx.strokeStyle = vCss(vMix(p[1], p[3], level));
      ctx.beginPath(); ctx.moveTo(cx + dx * r0 * 1.04, cy + dy * r0 * 1.04); ctx.lineTo(cx + dx * (r0 * 1.04 + len), cy + dy * (r0 * 1.04 + len)); ctx.stroke();
    }
    ctx.lineCap = "butt";
  };
}

function pillarsPainter() {
  const MOST = 32, PILLS = 7, unit = (seed) => { const v = Math.sin(seed) * 43758.5453; return v - Math.floor(v); };
  const lengths = Array.from({ length: MOST }, (_, i) => Array.from({ length: PILLS }, (_, k) => 0.18 + 0.45 * unit(i * 12.9898 + k * 78.233)));
  const weights = Array.from({ length: MOST }, (_, i) => 0.65 + 0.7 * unit(i * 4.1414 + 1.7));
  const slide = new Float32Array(MOST), follow = bandFollower(MOST);
  let last = -1;
  return (ctx, s, p, t, w, h) => {
    const dt = last < 0 ? 1 / 60 : Math.min(0.1, Math.max(0.001, t - last)); last = t;
    const span = w * 0.94, height = h * 0.92, count = Math.min(MOST, Math.max(8, Math.round(span / (height * 0.1))));
    const left = (w - span) / 2, top = (h - height) / 2, gap = span * 0.008, room = span - gap * (count - 1);
    let total = 0; for (let i = 0; i < count; i++) total += weights[i];
    const pulse = s.pulse(t);
    follow.update(s.bands, count, dt);
    ctx.save(); ctx.beginPath(); ctx.rect(left, top, span, height); ctx.clip();
    let x = left;
    for (let i = 0; i < count; i++) {
      const level = follow.levels[i], colW = (room * weights[i]) / total, gapV = colW * 0.22;
      let period = 0; for (const l of lengths[i]) period += l * height + gapV;
      slide[i] += (i % 2 === 0 ? 1 : -1) * dt * height * (0.02 + 0.9 * level + 1.6 * pulse);
      const shift = ((slide[i] % period) + period) % period, colour = vMix(p[1], p[3], 0.25 + 0.75 * level);
      let y = top - shift;
      for (let k = 0; y < top + height; k++) {
        const basic = lengths[i][k % PILLS] * height, drawn = Math.max(colW, basic * (0.3 + 0.7 * level));
        ctx.fillStyle = vCss(k % 2 === 0 ? colour : vMix(colour, p[2], 0.35), 0.5 + 0.5 * level);
        roundRect(ctx, x, y + (basic - drawn) / 2, colW, drawn, colW / 2); ctx.fill();
        y += basic + gapV;
      }
      x += colW + gap;
    }
    ctx.restore();
  };
}

function buildVisualizer() {
  const stage = $(".stage"), song = makeFlow(), art = $(".stage-art.real-art");
  const theatre = $(".theatre");
  let mode = "bars";
  let palette = paletteFrom([30, 180, 255]);
  const glow = () => {
    const c = mode === "lyrics" ? [135, 50, 255] : palette[2];
    theatre.style.setProperty("--glow", vCss(c, 0.5));
  };
  const usePalette = () => { try { palette = paletteFrom(vividColour(art)); } catch { /* keep the default */ } glow(); };
  if (art.complete && art.naturalWidth) usePalette(); else art.addEventListener("load", usePalette, { once: true });

  const painters = { bars: barsPainter(), halo: haloPainter(), pillars: pillarsPainter() };
  const LENGTH = 202, bar = $(".stage-progress i"), elapsed = $(".stage-time .at"), left = $(".stage-time .left");
  const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
  let shown = -1;

  const LYRICS = [
    [0.0, "Turn the lights down low"], [3.2, "and let the city hum below"], [6.6, "every street is gold tonight"], [9.8, "we'll keep driving till it's light"],
  ];

  function lyricBackdrop(ctx, w, h, t) {
    ctx.fillStyle = "#0d0c10"; ctx.fillRect(0, 0, w, h);
    const blob = (x, y, r, c, a) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, vCss(c, a)); g.addColorStop(1, vCss(c, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    };
    const kick = song.pulse(t);
    blob(w * (0.3 + 0.08 * Math.sin(t * 0.13)), h * (0.35 + 0.06 * Math.cos(t * 0.11)), w * 0.6, [135, 50, 255], 0.4 + 0.08 * kick);
    blob(w * (0.78 + 0.06 * Math.cos(t * 0.09)), h * (0.7 + 0.05 * Math.sin(t * 0.15)), w * 0.55, [225, 20, 135], 0.26 + 0.06 * kick);
  }

  function drawLyrics(ctx, w, h, t) {
    lyricBackdrop(ctx, w, h, t);
    const cycle = 13.4, local = reduceMotion.matches ? 8.2 : t % cycle;
    const index = LYRICS.findLastIndex(([at]) => local >= at), [at, line] = LYRICS[index];
    const size = Math.max(28, Math.min(w * 0.06, 72)), lead = size * 1.08, x0 = Math.max(28, w * 0.07);
    ctx.font = `800 ${size}px ${FONT}`; ctx.textBaseline = "alphabetic";
    const words = line.split(" "), maxW = w - x0 * 2, lines = [[]];
    let width = 0;
    words.forEach((word, i) => {
      const ww = ctx.measureText(word + " ").width;
      if (width + ww > maxW && lines[lines.length - 1].length) { lines.push([]); width = 0; }
      lines[lines.length - 1].push([word, i, width]); width += ww;
    });
    const step = 2.6 / words.length, y0 = h * 0.42 - ((lines.length - 1) * lead) / 2;
    lines.forEach((ln, li) => ln.forEach(([word, i, x]) => {
      const p = Math.min(1, Math.max(0, (local - at - i * step) / 0.35));
      ctx.globalAlpha = 0.28 + 0.72 * p; ctx.fillStyle = "#fff";
      ctx.fillText(word, x0 + x, y0 + li * lead + (1 - p) * 8);
    }));
    ctx.globalAlpha = 1;
    if (local > at + 2.6) {
      ctx.font = `800 ${Math.round(size * 0.42)}px ${FONT}`; ctx.fillStyle = "rgba(255,255,255,.4)";
      ctx.fillText(LYRICS[(index + 1) % LYRICS.length][1], x0, y0 + lines.length * lead + size * 0.2);
    }
  }

  const draw = (ctx, w, h, t) => {
    const time = reduceMotion.matches ? 6.3 : t;
    song.update(time);
    ctx.clearRect(0, 0, w, h);
    if (mode === "lyrics") drawLyrics(ctx, w, h, time);
    else {
      ctx.fillStyle = "rgba(10,10,14,.55)"; ctx.fillRect(0, 0, w, h);
      painters[mode](ctx, song, palette, time, w, h);
    }
    const at = (72 + time) % LENGTH;
    if (Math.floor(at) !== shown) {
      shown = Math.floor(at);
      bar.style.transform = `scaleX(${at / LENGTH})`;
      elapsed.textContent = clock(at); left.textContent = "-" + clock(LENGTH - at);
    }
  };

  const loop = canvasLoop($("#vis-canvas"), draw);
  $("#vis-picker").addEventListener("change", (e) => {
    mode = e.target.value;
    stage.dataset.mode = mode;
    glow();
    loop.redraw();
  });
}

/* ---------- Guest curators ---------- */

const SOUND_RAMP = [0xFF6E4B, 0xE11487, 0x8732FF, 0x1E5ADC, 0x0F3796];
const soundColour = (s) => { const p = s * (SOUND_RAMP.length - 1), i = Math.min(SOUND_RAMP.length - 2, Math.floor(p)); return mixRgb(SOUND_RAMP[i], SOUND_RAMP[i + 1], p - i); };
// Cosine similarity of the Meloday Engine's fingerprints for these songs, in SONGS order.
const SIM = [[1.0, 0.828, 0.524, 0.69, 0.512, 0.296, 0.449, 0.364, 0.551, 0.737, 0.752, 0.659, 0.427, 0.49], [0.828, 1.0, 0.69, 0.69, 0.548, 0.357, 0.525, 0.445, 0.608, 0.804, 0.631, 0.624, 0.534, 0.546], [0.524, 0.69, 1.0, 0.682, 0.472, 0.347, 0.422, 0.543, 0.52, 0.588, 0.459, 0.448, 0.467, 0.518], [0.69, 0.69, 0.682, 1.0, 0.503, 0.356, 0.452, 0.5, 0.441, 0.655, 0.579, 0.604, 0.419, 0.506], [0.512, 0.548, 0.472, 0.503, 1.0, 0.805, 0.392, 0.295, 0.554, 0.604, 0.445, 0.489, 0.453, 0.56], [0.296, 0.357, 0.347, 0.356, 0.805, 1.0, 0.254, 0.212, 0.412, 0.444, 0.235, 0.25, 0.307, 0.478], [0.449, 0.525, 0.422, 0.452, 0.392, 0.254, 1.0, 0.758, 0.651, 0.609, 0.586, 0.596, 0.257, 0.378], [0.364, 0.445, 0.543, 0.5, 0.295, 0.212, 0.758, 1.0, 0.547, 0.538, 0.476, 0.464, 0.224, 0.317], [0.551, 0.608, 0.52, 0.441, 0.554, 0.412, 0.651, 0.547, 1.0, 0.739, 0.616, 0.637, 0.467, 0.537], [0.737, 0.804, 0.588, 0.655, 0.604, 0.444, 0.609, 0.538, 0.739, 1.0, 0.646, 0.67, 0.544, 0.601], [0.752, 0.631, 0.459, 0.579, 0.445, 0.235, 0.586, 0.476, 0.616, 0.646, 1.0, 0.879, 0.527, 0.647], [0.659, 0.624, 0.448, 0.604, 0.489, 0.25, 0.596, 0.464, 0.637, 0.67, 0.879, 1.0, 0.607, 0.685], [0.427, 0.534, 0.467, 0.419, 0.453, 0.307, 0.257, 0.224, 0.467, 0.544, 0.527, 0.607, 1.0, 0.839], [0.49, 0.546, 0.518, 0.506, 0.56, 0.478, 0.378, 0.317, 0.537, 0.601, 0.647, 0.685, 0.839, 1.0]];
const SONGS = [
  ["The Less I Know The Better", "Tame Impala", "Currents", 2015, 117], ["Borderline", "Tame Impala", "The Slow Rush", 2020, 98],
  ["One More Time", "Daft Punk", "Discovery", 2001, 123], ["Digital Love", "Daft Punk", "Discovery", 2001, 125],
  ["Money Trees", "Kendrick Lamar", "good kid, m.A.A.d city", 2012, 97], ["HUMBLE.", "Kendrick Lamar", "DAMN.", 2017, 150],
  ["Dreams", "Fleetwood Mac", "Rumours", 1977, 120], ["Everywhere", "Fleetwood Mac", "Tango In the Night (Deluxe Edition)", 1987, 115],
  ["Back To Black", "Amy Winehouse", "Back To Black (Deluxe Edition)", 2006, 124], ["Rehab", "Amy Winehouse", "Back To Black (Deluxe Edition)", 2006, 97],
  ["Mariella", "Khruangbin", "Texas Moon", 2022, 110], ["May Ninth", "Khruangbin", "A LA SALA", 2024, 80],
  ["Teardrop", "Massive Attack", "Mezzanine", 1998, 77], ["Angel", "Massive Attack", "Mezzanine", 1998, 107],
].map(([title, a, album, y, bpm], id) => ({ id, title, a, y, bpm, art: art(`${a}|${album}`), s: (1 - SIM[0][id]) / (1 - Math.min(...SIM[0])) }));
const QUEUED = [1, 6, 7, 2, 12, 3, 9, 8, 4, 10, 11, 5, 13];
const byId = (id) => SONGS[id];

function chain(start, pool, distance) {
  const out = [], left = [...pool]; let last = start;
  while (left.length) { left.sort((x, y) => distance(last, byId(x)) - distance(last, byId(y))); const next = left.shift(); out.push(next); last = byId(next); }
  return out;
}

const CURATORS = [
  ["queued", "As queued", "With no curator, songs play in the order you queued them.", () => QUEUED],
  ["double", "Double Up", "Two songs from each artist, back to back.", () => {
    const order = []; const seen = [SONGS[0].a];
    QUEUED.forEach((id) => { if (!seen.includes(byId(id).a)) seen.push(byId(id).a); });
    seen.forEach((a) => QUEUED.filter((id) => byId(id).a === a).forEach((id) => order.push(id)));
    return order;
  }],
  ["twin", "Twin", "Stays close to what's playing. This order comes from the Meloday Engine's fingerprints of these songs, and the bar under each cover shows how close it sounds to The Less I Know The Better.", () =>
    [...QUEUED].sort((x, y) => SIM[0][y] - SIM[0][x])],
  ["drift", "Drift", "Starts close to what's playing, then wanders a little further with each song.", () =>
    chain(SONGS[0], QUEUED, (a, b) => 1 - SIM[a.id][b.id])],
  ["time", "Time Machine", "Oldest to newest, so the queue plays like a walk through the years.", () => [...QUEUED].sort((x, y) => byId(x).y - byId(y).y)],
  ["smooth", "Smooth", "Each song flows into the next by tempo, key and energy.", () => chain(SONGS[0], QUEUED, (a, b) => Math.abs(a.bpm - b.bpm) / 40 + (1 - SIM[a.id][b.id]) * 0.5)],
  ["spread", "Spread", "Never the same artist twice in a row.", () => {
    const left = [...QUEUED], out = []; let prev = SONGS[0].a;
    while (left.length) { const i = Math.max(0, left.findIndex((id) => byId(id).a !== prev)); const [id] = left.splice(i, 1); out.push(id); prev = byId(id).a; }
    return out;
  }],
  ["bridge", "Bridge", "Lays five songs between each pair that lead from one to the next in even steps of sound. It works a couple of songs ahead and keeps going as the queue plays.", () => QUEUED],
];

const detail = (song, curator) => song.cls === "now" ? "Playing" : song.cls === "bridge" ? "A step in sound"
  : curator === "time" ? `<strong>${song.y}</strong>` : curator === "smooth" ? `<strong>${song.bpm}</strong> BPM` : song.a;

function songTile(song, curator, extra = "") {
  return `<li class="song ${extra}" data-key="${song.key}" style="--c:${hex(soundColour(song.s))}">` +
    `<div class="tile">${song.art ? `<img src="${song.art}" alt="" loading="lazy">` : WAVE}</div>` +
    `<p class="meta"><b>${song.cls === "bridge" ? "Bridge" : song.title}</b><span class="detail">${detail(song, curator)}</span></p></li>`;
}

function buildCurators() {
  const picker = $("#curator-picker"), queue = $("#queue"), blurb = $("#curator-blurb");
  picker.insertAdjacentHTML("beforeend", CURATORS.map(([id, name], i) =>
    `<label><input type="radio" name="curator" value="${id}"${i === 0 ? " checked" : ""}><span>${name}</span></label>`).join(""));

  function render(id, animate) {
    const [, , text, arrange] = CURATORS.find((c) => c[0] === id);
    blurb.textContent = text;
    const before = new Map([...queue.children].map((li) => [li.dataset.key, li.getBoundingClientRect()]));
    let items = [{ ...SONGS[0], key: "s0", cls: "now" }, ...arrange().map((sid) => ({ ...byId(sid), key: "s" + sid, cls: "" }))];
    if (id === "bridge") {
      const out = [items[0]];
      for (let i = 1; i < items.length; i++) {
        if (i <= 2) {
          const a = items[i - 1], b = items[i];
          for (let k = 1; k <= 5; k++) out.push({ key: `b${a.id}-${b.id}-${k}`, s: a.s + (b.s - a.s) * (k / 6), cls: "bridge" });
        }
        out.push(items[i]);
      }
      items = out;
    }
    const existing = new Map([...queue.children].map((li) => [li.dataset.key, li]));
    const frag = document.createDocumentFragment();
    items.forEach((song) => {
      let li = existing.get(song.key);
      if (li) {
        li.querySelector(".detail").innerHTML = detail(song, id);
        existing.delete(song.key);
      } else {
        const tmp = document.createElement("ol");
        tmp.innerHTML = songTile(song, id, song.cls + (animate ? " enter" : ""));
        li = tmp.firstElementChild;
      }
      frag.appendChild(li);
    });
    existing.forEach((li) => li.remove());
    queue.appendChild(frag);
    if (!animate || reduceMotion.matches) return;
    [...queue.children].forEach((li) => {
      const old = before.get(li.dataset.key);
      if (!old) return;
      const box = li.getBoundingClientRect();
      const dx = old.left - box.left, dy = old.top - box.top;
      if (dx || dy) li.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" });
    });
  }

  render("queued", false);
  picker.addEventListener("change", (e) => render(e.target.value, true));
}

/* ---------- Trends ---------- */

function buildTrends() {
  $("#top-artists").innerHTML = ["Tame Impala", "Kendrick Lamar", "Zara Larsson", "Fleetwood Mac", "Bad Bunny"].map((a, i) =>
    `<li><img src="${art("photo|" + a)}" alt="" loading="lazy"><span><b>${i + 1}</b>${a}</span></li>`).join("");
  const r = rng("trends");
  const cal = $("#calendar");
  const cells = [];
  for (let i = 0; i < 26 * 7; i++) {
    const weekend = i % 7 === 0 || i % 7 === 6;
    const v = r() < 0.12 ? 0 : Math.min(1, r() * 0.8 + (weekend ? 0.35 : 0.1));
    cells.push(`<i style="${v ? `background:rgba(242,174,78,${(0.18 + v * 0.82).toFixed(2)})` : ""}"></i>`);
  }
  cal.style.gridTemplateColumns = "repeat(26, 1fr)";
  cal.innerHTML = cells.join("");
  const shape = [.15, .08, .05, .03, .03, .05, .2, .45, .6, .5, .45, .5, .62, .55, .5, .52, .6, .75, .85, .8, .9, 1, .7, .35];
  $("#hours").innerHTML = shape.map((v, h) => `<i style="height:${Math.round(v * 100)}%;background:${hex(periodAt(h).rings[3])}"></i>`).join("");
  $("#hours").insertAdjacentHTML("afterend", '<div class="dial-ticks" aria-hidden="true" style="margin-top:8px"><span>12 am</span><span>6 am</span><span>12 pm</span><span>6 pm</span><span>11 pm</span></div>');
}

/* ---------- All features ---------- */

const FEATURES = [
  ["Meloday", [
    "A new mix for each of seven parts of the day, from dawn to late night",
    "Names drawn from the mix's genres, moods and eras",
    "Covers with the sun placed where it sits at that hour",
    "Save to Plex as one playlist that updates in place",
  ]],
  ["Made for You", [
    "Daily mixes of about 30 songs based on what you play",
    "20 mood, 9 energy and 18 moment playlists, made weekly",
    "Find Your Mood: Feel Good, Relax, Energy, Focus, Heartbreak and Feeling Blue",
    "Moments such as Wake Up, Sunny Afternoon, Workout, Dinner, Rainy Day, Late Night and Road Trip",
    "Genre Essentials: up to 12 playlists of the best-known songs in the genres you play, each with an illustrated cover",
    "Niche mixes named in two words, like Late Night R&B or 90s Indie",
    "Sound niches in the Meloday Engine's own words, like Dreamy Indie or Melancholy Piano",
    "Artist, genre, mood and Discovery mixes",
    "Every mix tops itself up as it runs low",
    "Keep a mix on Plex, or save a fixed copy as a playlist",
    "Songs and artists that come up a lot are rested for a while",
    "Copies of a song on deluxe editions, remasters and compilations count once",
    "Don't Use for My Taste Profile, so a playlist or station doesn't shape your recommendations",
  ]],
  ["Radio and stations", [
    "Radio from any song, album, artist, genre, style, mood or decade",
    "Live stations that keep playing while you're away, so you join mid-song",
    "Meloday Pulse, a station with a daily schedule of programs",
    "Pulse Guide for scheduling your own programs once, daily, on weekdays, at weekends or on chosen days",
    "Change Pulse's own lineup: move a program, change its days or take it out",
    "Programs that last one song, a number of songs or a number of minutes",
    "Sonic Radio, which follows the sound of a song",
    "Sonic Adventure, which travels from one song you pick to another",
  ]],
  ["Meloday Engine", [
    "Analyses your songs on your PC, with no cloud service and no Plex Pass needed",
    "What ME Hears: 187 words for mood, energy, genre, era, instruments, vocals and moments",
    "Sounds Like search, with a Create Playlist button for up to 50 songs",
    "Search in everyday words and phrases, like “bangers” or “3am”, with “not” and “without”",
    "Free-text search for sounds Meloday has no word for, read on your PC",
    "Similar songs from any song's menu",
    "A Taste Engine that learns the sound of what you finish and skip",
    "Separate taste for mornings, afternoons, evenings and nights",
    "Adventure setting, from Familiar to Adventurous",
    "Tag Moods in Plex, so Plexamp and other Plex apps can filter by them, and remove them again in one step",
    "Plex's sonic analysis fills in with Plex Pass for songs the engine hasn't learned",
    "Background or Power through analysis pace, or switch learning off",
  ]],
  ["Playback", [
    "AutoMix beat-matched transitions, with both songs meeting halfway in tempo",
    "EQ blends that bring in highs, then mids, then bass",
    "Voice-aware transitions that never let two vocals overlap",
    "Filter sweeps, echo outs and cuts on a break for pairs that can't be matched",
    "Look-ahead limiter so overlapping songs don't distort",
    "Crossfade with a length you choose",
    "Guest curators: Double Up, Twin, Drift, Time Machine, Smooth and Spread",
    "Sonic order for playlists, so each song leads into the next by tempo, key and energy",
    "Play and Shuffle follow the sort or search you have on a playlist",
    "Bridge, which fills jumps in sound with songs that lead from one to the next",
    "Cast to Google Cast devices and UPnP/DLNA speakers and TVs, including Sonos",
    "Downloads for offline listening",
    "Sleep timer from 15 minutes to 2 hours, or at the end of the song",
    "Mute a song or artist for a week, a month or any number of days",
    "Mini player that stays above other windows (Ctrl+Shift+M)",
    "Media keys, Windows media controls and a taskbar preview with playback buttons",
    "Queue and place saved when you close the app",
  ]],
  ["Now Playing", [
    "Artist backdrop behind the song",
    "Synced lyrics from LRCLIB or Plex",
    "Lyric Studio for timing lyrics yourself with the space bar",
    "Lyric videos, with each word arriving as it's sung",
    "Visualizers: Bars, Halo, Sun, Pillars, Tiles, Light Wall and Bloom",
    "projectM with five MilkDrop presets",
  ]],
  ["Library", [
    "Albums, artists, songs, playlists, collections and folders",
    "Grid and list views",
    "Move a genre, style or mood into another family from its right-click menu",
    "A Home page you arrange yourself, with rails like On Repeat, Forgotten Favourites, New in Your Rotation and Your Decade",
    "Pins in the sidebar, in any order you drag them",
    "Artist pages with backdrops, logos, biographies and top songs",
    "MusicBrainz release catalogue for releases missing from your library",
    "Plex smart playlists, played as Plex made them",
    "Search across your whole library",
  ]],
  ["Trends", [
    "Your listening by artist, album and song",
    "Listening by time of day and day of the week",
    "A listening calendar",
    "Fresh Finds and New in Your Rotation, checked against your whole history",
  ]],
  ["Accounts and services", [
    "Sign in with your Plex account from inside the app",
    "Works without Plex Pass",
    "Plex Home profiles, each with their own history, ratings, taste, queue, pins and Meloday",
    "Plays reported to your Plex server for play counts, history and Now Playing, with a switch to turn it off",
    "Optional Last.fm and ListenBrainz scrobbling with your own key or account",
    "Optional MusicBrainz integration",
  ]],
  ["Privacy", [
    "Sign-ins and keys encrypted with Windows DPAPI and never written to logs",
    "The skips and choices behind recommendations stay on your PC",
    "Cast devices get a temporary Plex token, never your account's own",
    "HTTPS first, with Plex's standard choices for insecure connections",
  ]],
  ["Windows", [
    "Windows 10 version 2004 or later, x64",
    "Windows contrast themes",
    "A layout that adapts as the window gets narrower",
    "Free and open source under the GPL-3.0",
  ]],
];

function buildFeatures() {
  const total = FEATURES.reduce((n, [, items]) => n + items.length, 0);
  $("#feature-count").textContent = `${total} features, grouped by what they're for.`;
  $("#feature-list").innerHTML = FEATURES.map(([group, items]) =>
    `<div class="group"><h3>${group}</h3><ul>${items.map((t) => `<li>${t}</li>`).join("")}</ul></div>`).join("");
}

/* ---------- Page ---------- */

function watchSections() {
  const links = new Map([...document.querySelectorAll(".nav-links a")].map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((l) => l.removeAttribute("aria-current"));
    links.get(e.target.id)?.setAttribute("aria-current", "true");
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));

  // Covers only breathe while they're on screen.
  const covers = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("paused", !e.isIntersecting)));
  document.querySelectorAll(".cover").forEach((c) => covers.observe(c));
}

// Content rises into place the first time it scrolls into view. Items in a row follow one another.
function reveal() {
  if (reduceMotion.matches) return;
  const items = document.querySelectorAll([
    ".hero-copy > *", ".hero-art", ".section-head", ".showcase > *", "#engine .engine", ".mixer", ".theatre", ".cards > li",
    ".day-strip > li", ".cover-grid > li", ".details-grid > *", ".faq", ".chooser", ".queue-panel",
    ".closing .wrap > *",
  ].join(","));
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    io.unobserve(e.target);
  }), { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => {
    const order = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--delay", `${Math.min(order, 6) * 70}ms`);
    el.classList.add("reveal");
    io.observe(el);
  });
}

Promise.all([document.fonts.load("800 16px \"DM Sans\""), document.fonts.load("700 16px \"DM Sans\""), document.fonts.ready]).then(() => {
  setHour(+hourInput.value, true);
  buildHalo(heroPeriod);
  buildStrip();
  buildMixes();
  buildGuide();
  buildEngine();
  buildMixer();
  buildVisualizer();
  buildCurators();
  buildTrends();
  buildFeatures();
  watchSections();
  reveal();
});
