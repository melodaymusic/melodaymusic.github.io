"use strict";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const $ = (s, el = document) => el.querySelector(s);
const hex = (n) => "#" + n.toString(16).padStart(6, "0");
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ART = {"Zara Larsson|So Good": "album-zara-larsson-so-good", "Zara Larsson|Midnight Sun": "album-zara-larsson-midnight-sun", "Britney Spears|In The Zone": "album-britney-spears-in-the-zone", "Britney Spears|Circus (Deluxe Version)": "album-britney-spears-circus-deluxe-version", "Rihanna|Good Girl Gone Bad: Reloaded": "album-rihanna-good-girl-gone-bad-reloaded", "Rihanna|Loud": "album-rihanna-loud", "Lady Gaga|The Fame Monster (Deluxe Edition)": "album-lady-gaga-the-fame-monster-deluxe-edition", "Lady Gaga|MAYHEM": "album-lady-gaga-mayhem", "Ariana Grande|thank u, next": "album-ariana-grande-thank-u-next", "Ariana Grande|Dangerous Woman": "album-ariana-grande-dangerous-woman", "Dua Lipa|Dua Lipa (Deluxe)": "album-dua-lipa-dua-lipa-deluxe", "Dua Lipa|Future Nostalgia": "album-dua-lipa-future-nostalgia", "Sabrina Carpenter|Short n' Sweet": "album-sabrina-carpenter-short-n-sweet", "Sabrina Carpenter|emails i can't send": "album-sabrina-carpenter-emails-i-can-t-send", "SZA|SOS": "album-sza-sos", "Frank Ocean|channel ORANGE": "album-frank-ocean-channel-orange", "The Weeknd|House Of Balloons (Original)": "album-the-weeknd-house-of-balloons-original", "Kylie Minogue|Tension (Deluxe)": "album-kylie-minogue-tension-deluxe", "Carly Rae Jepsen|E•mo•tion (Deluxe Expanded Edition)": "album-carly-rae-jepsen-emotion-deluxe-expanded-edition", "Billie Eilish|WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?": "album-billie-eilish-when-we-all-fall-asleep-where-do-w", "Olivia Rodrigo|SOUR": "album-olivia-rodrigo-sour", "Lorde|Melodrama": "album-lorde-melodrama", "Troye Sivan|Bloom": "album-troye-sivan-bloom", "The Weeknd|After Hours (Deluxe)": "album-the-weeknd-after-hours-deluxe", "Nicki Minaj|Pink Friday 2": "album-nicki-minaj-pink-friday-2", "Beyoncé|4": "album-beyonce-4", "Taylor Swift|reputation": "album-taylor-swift-reputation", "Charli xcx|Brat and it’s completely different but also still brat": "album-charli-xcx-brat-and-its-completely-different-but", "Doja Cat|Planet Her": "album-doja-cat-planet-her", "Tove Lo|Dirt Femme": "album-tove-lo-dirt-femme", "Lana Del Rey|Did you know that there's a tunnel under Ocean Blvd": "album-lana-del-rey-did-you-know-that-there-s-a-tunnel-", "Kali Uchis|Red Moon In Venus": "album-kali-uchis-red-moon-in-venus", "Chappell Roan|The Rise and Fall of a Midwest Princess": "album-chappell-roan-the-rise-and-fall-of-a-midwest-pri", "Tyla|TYLA": "album-tyla-tyla", "photo|Nicki Minaj": "artist-nicki-minaj", "photo|Zara Larsson": "artist-zara-larsson", "photo|Ariana Grande": "artist-ariana-grande", "photo|Tove Lo": "artist-tove-lo", "photo|Lana Del Rey": "artist-lana-del-rey", "photo|Dua Lipa": "artist-dua-lipa", "photo|Lady Gaga": "artist-lady-gaga", "photo|Sabrina Carpenter": "artist-sabrina-carpenter", "photo|The Weeknd": "artist-the-weeknd", "photo|SZA": "artist-sza", "photo|Rihanna": "artist-rihanna", "photo|Charli xcx": "artist-charli-xcx", "backdrop|Zara Larsson": "backdrop-zara-larsson", "backdrop|Nicki Minaj": "backdrop-nicki-minaj", "backdrop|Lady Gaga": "backdrop-lady-gaga", "backdrop|Sabrina Carpenter": "backdrop-sabrina-carpenter", "backdrop|Beyoncé": "backdrop-beyonce", "backdrop|Britney Spears": "backdrop-britney-spears", "backdrop|SZA": "backdrop-sza", "backdrop|Doja Cat": "backdrop-doja-cat", "made|feel-good": "made-feel-good", "made|late-night": "made-late-night", "made|rainy-day": "made-rainy-day", "made|road-trip": "made-road-trip", "made|heartbreak": "made-heartbreak", "made|workout": "made-workout", "made|focus": "made-focus", "made|relax": "made-relax", "made|wake-up": "made-wake-up", "made|sunny-afternoon": "made-sunny-afternoon", "made|dinner": "made-dinner", "made|energy": "made-energy"};
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

// Shrink the name until it fits four lines, as the app's CoverFit does.
function setName(el, text) {
  const name = $(".name", el);
  name.textContent = text;
  fitText(name, 10, 1, 4);
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
    measure.font = `${weight} ${px}px Nunito`;
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

/* ---------- Shape covers, after ShapeLayout.cs ---------- */

const FAMILIES = [
  [0xF57387, 0xDC143C, 0x960A28], [0xF05F7D, 0xBE0A37, 0x780523], [0xFDA58C, 0xEE5005, 0xA52D19],
  [0xEB966E, 0xC8502D, 0x872D14], [0xFFAF91, 0xFF6E4B, 0xB93C23], [0xFFE169, 0xFFB400, 0xB47800],
  [0xAAEB91, 0x5AD746, 0x379128], [0x7DCDCD, 0x009191, 0x005F5F], [0xB4F5E1, 0x2DC8AA, 0x198770],
  [0xB4E1F5, 0x3CA5E1, 0x2873A5], [0x82AFFF, 0x1E5ADC, 0x0F3796], [0xC3D7FF, 0x739BF5, 0x4B69B9],
  [0xD2AFFF, 0x8732FF, 0x5514B4], [0xE6CDFA, 0xB987E6, 0x7850A5], [0xCDA0B9, 0x873769, 0x551941],
  [0xFFA5DC, 0xE11487, 0x960A55], [0xFFC3E1, 0xFF80B9, 0xB43C73],
];

const SHAPES = [
  { round: true, d: "M437.3 158.3A99.5 99.5 0 0 0 321.6 42.8a99.5 99.5 0 0 0-163.4 0A99.5 99.5 0 0 0 42.7 158.3a99.5 99.5 0 0 0 0 163.4 99.5 99.5 0 0 0 115.6 115.6 99.5 99.5 0 0 0 163.4 0 99.5 99.5 0 0 0 115.5-115.6 99.5 99.5 0 0 0 0-163.4Z" },
  { round: false, d: "M480 240H0a240 240 0 1 1 480 0ZM480 480H0a240 240 0 1 1 480 0Z" },
  { round: true, d: "M480 240a240 240 0 0 0-240 240 240 240 0 0 0 240-240ZM240 0A240 240 0 0 0 0 240 240 240 0 0 0 240 0ZM480 240A240 240 0 0 0 240 0a240 240 0 0 0 240 240ZM240 480A240 240 0 0 0 0 240a240 240 0 0 0 240 240Z" },
  { round: true, d: "M347.5 168.3C324 184 296 156 311.7 132.5 348.8 76.8 310.7 0 239.2 0s-108.6 75.8-70.9 132.5C184 156 156 184 132.5 168.3A85.2 85.2 0 0 0 0 239.2v1.6c0 68 75.8 108.6 132.5 70.9C156 296 184 324 168.3 347.6A85.2 85.2 0 0 0 239.2 480h1.6c68 0 108.6-75.8 70.9-132.5C296 324 324 296 347.6 311.7c55.6 37.1 132.4-1 132.4-72.5s-75.8-108.6-132.5-70.9Z" },
  { round: false, d: "M320 0v240a160 160 0 1 0-320 0v240h160V240a160 160 0 1 0 320 0V0H320Z" },
  { round: false, d: "M480 240c0-21.9-11.7-42.4-32.1-60 20.4-17.6 32.1-38.1 32.1-60C480 53.7 372.6 0 240 0S0 53.7 0 120c0 21.9 11.7 42.4 32.1 60C11.7 197.7 0 218.1 0 240s11.7 42.4 32.1 60C11.7 317.6 0 338.1 0 360c0 66.3 107.5 120 240 120s240-53.7 240-120c0-21.9-11.7-42.4-32.1-60 20.4-17.6 32.1-38.1 32.1-60Z" },
  { round: true, d: "M480 240c0-29.1-20.7-55.8-55.2-76.5 9.7-39.1 5.5-72.6-15-93.2-20.7-20.6-54.2-24.8-93.3-15.1C295.8 20.7 269.1 0 240 0s-55.8 20.7-76.5 55.2c-39.1-9.7-72.6-5.5-93.2 15s-24.8 54.2-15.1 93.2C20.7 184.3 0 211 0 240s20.7 55.8 55.2 76.5c-9.7 39.1-5.5 72.6 15 93.2 20.7 20.6 54.2 24.8 93.2 15.1C184.3 459.3 211 480 240 480s55.8-20.7 76.5-55.2c39.1 9.7 72.6 5.5 93.2-15s24.8-54.2 15.1-93.2C459.3 295.8 480 269 480 240Z" },
  { round: true, d: "M409.7 296.6 353.1 240l56.6-56.6A80 80 0 0 0 296.6 70.3L240 126.9l-56.6-56.6A80 80 0 0 0 70.3 183.4l56.6 56.6-56.6 56.6a80 80 0 0 0 113.1 113.1l56.6-56.6 56.6 56.6a80 80 0 0 0 113.1-113.1Z" },
  { round: true, d: "M240 6 47.5 98.7 0 307l133.2 167h213.6L480 307 432.5 98.7 240 6z" },
  { round: false, d: "M360.5 240V120.5H240V0H0v240h120.5v120.5H240V480h240V240H360.5z" },
  { round: false, d: "M480 0H120v120h120v120h120v120h120V0zM0 480h360V360H240V240H120V120H0v360z" },
  { round: true, d: "M450 210A180 180 0 0 1 270 30a30 30 0 1 0-60 0A180 180 0 0 1 30 210a30 30 0 1 0 0 60 180 180 0 0 1 180 180 30 30 0 1 0 60 0 180 180 0 0 1 180-180 30 30 0 1 0 0-60Z" },
];

function overlap(a, b) {
  const w = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1), h = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
  return w > 0 && h > 0 ? w * h : 0;
}
const box = (cx, cy, s) => ({ x1: cx - s / 2, y1: cy - s / 2, x2: cx + s / 2, y2: cy + s / 2 });
const area = (b) => (b.x2 - b.x1) * (b.y2 - b.y1);
const COVER = { x1: 0, y1: 0, x2: 1000, y2: 1000 };

function shapeCover(el, name, family, seed) {
  const r = rng(name + seed);
  const fam = FAMILIES[family];
  const field = luminance(fam[1]) <= 0.3 ? 1 : 2;
  const bars = field === 1 ? 2 : 1;
  const [colourBack, colourFront] = [fam[0], fam[bars]];

  const lines = Math.ceil(name.length / 14);
  const label = { x1: 100, y1: 900 - lines * 96 - 20, x2: 880, y2: 910 };
  const pick = () => Math.floor(r() * SHAPES.length);
  const a = pick(); let b = pick(); while (b === a) b = pick();

  let best = null;
  for (let i = 0; i < 400; i++) {
    const s1 = 520 + r() * 230, s2 = 400 + r() * Math.max(10, s1 - 470);
    const p1 = [r() * 1000, r() * 760], p2 = [r() * 1000, r() * 760];
    const b1 = box(...p1, s1), b2 = box(...p2, s2);
    const off1 = 1 - overlap(b1, COVER) / area(b1), off2 = 1 - overlap(b2, COVER) / area(b2);
    const both = overlap(b1, b2) / area(b2);
    const onLabel = (overlap(b1, label) + overlap(b2, label)) / area(label);
    let score = Math.max(0, off1 - 0.4) * 9 + Math.max(0, off2 - 0.4) * 9 + Math.max(0, both - 0.5) * 6 + Math.max(0, onLabel - 0.1) * 12;
    score += Math.abs(p1[0] - p2[0]) < 200 && Math.abs(p1[1] - p2[1]) < 200 ? 0.4 : 0;
    if (!best || score < best.score) best = { score, s1, s2, p1, p2 };
  }

  let turned = false;
  const shapeSvg = (index, size, [cx, cy], colour) => {
    const shape = SHAPES[index];
    const rot = shape.round ? Math.round(r() * 24) * 15 : Math.round(r() * 4) * 90;
    let cls = "swell", style = `--d:${(6 + r() * 5).toFixed(1)}s`;
    if (shape.round && !turned) { turned = true; cls = "turn"; style = `--d:${(50 + r() * 30).toFixed(0)}s;--dir:${r() < 0.5 ? "normal" : "reverse"}`; }
    return `<g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)}) rotate(${rot}) scale(${(size / 480).toFixed(3)}) translate(-240 -240)">` +
      `<path class="shape ${cls}" style="${style}" d="${shape.d}" fill="${hex(colour)}"/></g>`;
  };

  el.innerHTML =
    `<svg viewBox="0 0 1000 1000" aria-hidden="true"><rect width="1000" height="1000" fill="${hex(fam[field])}"/>` +
    shapeSvg(a, best.s1, best.p1, colourBack) + shapeSvg(b, best.s2, best.p2, colourFront) +
    `<rect y="964" width="1000" height="36" fill="${hex(fam[bars])}"/><rect y="760" width="18" height="120" fill="${hex(fam[bars])}"/></svg>` +
    WAVE + `<div class="label"></div>`;
  const labelEl = $(".label", el);
  labelEl.textContent = name;
  fitText(labelEl, 8.8, 1.09, 3);
}

const MIXES = [
  { made: "late-night", name: "Late Night", sub: "Nicki Minaj, The Weeknd, Lauv and more" },
  { made: "road-trip", name: "Road Trip", sub: "MARINA, Ciara, aespa and more" },
  { made: "rainy-day", name: "Rainy Day", sub: "Laufey, Sam Smith, Haroula Rose and more" },
  { made: "feel-good", name: "Feel Good", sub: "Lady Gaga, Ozuna, Davido and more" },
  { name: "R&B Deep Cuts", sub: "Niche mix" },
  { name: "Dreamy Synth-Pop", sub: "Your Sounds" },
  { name: "2000s Pop", sub: "Niche mix" },
  { name: "Melodic House Mix", sub: "Genre mix" },
];
let mixSeed = 0;

function buildMixes() {
  const r = rng("families" + mixSeed);
  const order = FAMILIES.map((_, i) => i).sort(() => r() - 0.5);
  const grid = $("#mix-grid");
  if (!grid.children.length) {
    grid.innerHTML = MIXES.map((m) => `
      <li><div class="cover${m.made ? " photo" : ""}" role="img" aria-label="${m.name} cover">${m.made ? `<img src="${art("made|" + m.made)}" alt="" loading="lazy">` : ""}</div>
      <p class="title">${m.name}</p><p class="sub">${m.made ? "Made by Meloday · " + m.sub : m.sub}</p></li>`).join("");
  }
  let shape = 0;
  [...grid.children].forEach((li, i) => { if (!MIXES[i].made) shapeCover($(".cover", li), MIXES[i].name, order[shape++], mixSeed); });
}

$("#reshuffle").addEventListener("click", () => {
  mixSeed++;
  const covers = document.querySelectorAll("#mix-grid .cover:not(.photo)");
  if (reduceMotion.matches) { buildMixes(); return; }
  covers.forEach((c, i) => c.animate([{ transform: "scale(1)" }, { transform: "scale(.92)", opacity: .4 }], { duration: 160, delay: i * 30, fill: "forwards", easing: "ease-in" }));
  setTimeout(() => {
    buildMixes();
    covers.forEach((c, i) => c.animate([{ transform: "scale(.92)", opacity: .4 }, { transform: "scale(1)", opacity: 1 }], { duration: 380, delay: i * 30, fill: "forwards", easing: "cubic-bezier(.2,.8,.2,1)" }));
  }, 180 + covers.length * 30);
});

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
  "upbeat dance pop": { groups: [["Energy", [["upbeat", .88], ["danceable", .85]]], ["Genre", [["dance pop", .9], ["disco", .52]]], ["Mood", [["happy", .7]]], ["Moments", [["party", .66], ["workout", .45]]]],
    songs: [["Don't Start Now", "Dua Lipa", "Dua Lipa|Future Nostalgia"], ["Padam Padam", "Kylie Minogue", "Kylie Minogue|Tension (Deluxe)"], ["Run Away With Me", "Carly Rae Jepsen", "Carly Rae Jepsen|E•mo•tion (Deluxe Expanded Edition)"]], next: ["Happy Disco", "Party Pop"] },
  "sad piano": { groups: [["Mood", [["sad", .82], ["melancholy", .74]]], ["Instruments", [["piano", .9], ["strings", .44]]], ["Energy", [["calm", .77]]], ["Vocals", [["female vocals", .69]]]],
    songs: [["when the party's over", "Billie Eilish", "Billie Eilish|WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?"], ["drivers license", "Olivia Rodrigo", "Olivia Rodrigo|SOUR"], ["Liability", "Lorde", "Lorde|Melodrama"]], next: ["Heartbreak Ballads", "Quiet Piano"] },
  "dreamy synth pop": { groups: [["Mood", [["dreamy", .78]]], ["Genre", [["synth-pop", .87], ["electronic", .6]]], ["Instruments", [["synthesizer", .91]]], ["Moments", [["night drive", .63]]]],
    songs: [["Blinding Lights", "The Weeknd", "The Weeknd|After Hours (Deluxe)"], ["Supercut", "Lorde", "Lorde|Melodrama"], ["Bloom", "Troye Sivan", "Troye Sivan|Bloom"]], next: ["Night Drive", "Retro Synth"] },
};
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bR&b\b/, "R&B");
let typing = 0;

function runQuery(q) {
  const token = ++typing;
  document.querySelectorAll("#engine-chips .chip").forEach((c) => c.setAttribute("aria-pressed", c.textContent === q));
  const field = $("#engine-query"), hears = $("#engine-hears"), create = $("#engine-create span");
  const data = QUERIES[q];
  hears.innerHTML = data.groups.map(([g, words]) => `<div class="hear"><span class="g">${g}</span><span class="words">${words.map(([w, c]) =>
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

const FONT = '"Nunito", "Segoe UI", sans-serif';

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

function buildVisualizer() {
  const LIGHT = [160, 225, 255], MID = [30, 180, 255], DEEP = [15, 115, 185];
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const lerp = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  let mode = "bars";
  const bpm = 118;

  function bands(t) {
    const beat = (t * bpm) / 60, phase = beat % 1, kick = Math.exp(-phase * 6), hat = Math.exp(-((beat * 2) % 1) * 9);
    return Array.from({ length: 16 }, (_, b) => {
      const base = 0.55 + 0.25 * Math.sin(t * (0.7 + b * 0.37) + b * 1.7) + 0.12 * Math.sin(t * (2.3 + b * 0.11) + b);
      const hit = b < 4 ? kick * (1 - b * 0.18) : b > 10 ? hat * 0.5 : 0.15 * kick;
      return Math.min(1, Math.max(0.05, base * (b < 4 ? 0.7 : 0.75 - (b - 4) * 0.025) + hit * 0.5));
    });
  }

  const LYRICS = [
    [0.0, "Turn the lights down low"], [3.2, "and let the city hum below"], [6.6, "every street is gold tonight"], [9.8, "we'll keep driving till it's light"],
  ];

  function backdrop(ctx, w, h, t, strength) {
    ctx.fillStyle = "#0d0c10"; ctx.fillRect(0, 0, w, h);
    const blob = (x, y, r, c, a) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgb(c, a)); g.addColorStop(1, rgb(c, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    };
    blob(w * (0.3 + 0.08 * Math.sin(t * 0.13)), h * (0.35 + 0.06 * Math.cos(t * 0.11)), w * 0.6, MID, 0.35 * strength);
    blob(w * (0.78 + 0.06 * Math.cos(t * 0.09)), h * (0.7 + 0.05 * Math.sin(t * 0.15)), w * 0.55, [225, 20, 135], 0.22 * strength);
  }

  const draw = (ctx, w, h, t) => {
    const e = bands(t);
    if (mode === "lyrics") { drawLyrics(ctx, w, h, t); return; }
    ctx.clearRect(0, 0, w, h);
    const shade = ctx.createLinearGradient(0, 0, 0, h);
    shade.addColorStop(0, "rgba(10,10,14,.45)"); shade.addColorStop(0.6, "rgba(10,10,14,.6)"); shade.addColorStop(1, "rgba(10,10,14,.92)");
    ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
    const floor = h - 96;
    if (mode === "bars") {
      const n = 12, slot = (w - 48) / n, bw = slot * 0.62, cy = floor * 0.52;
      for (let i = 0; i < n; i++) {
        const v = e[Math.floor((i / n) * 14)];
        const bh = Math.max(bw, v * floor * 0.78);
        const x = 24 + i * slot + (slot - bw) / 2, drift = Math.sin(t * 0.8 + i * 0.9) * floor * 0.03;
        const g = ctx.createLinearGradient(0, cy - bh / 2 + drift, 0, cy + bh / 2 + drift);
        g.addColorStop(0, rgb(LIGHT)); g.addColorStop(1, rgb(DEEP));
        ctx.fillStyle = g; roundRect(ctx, x, cy - bh / 2 + drift, bw, bh, bw / 2); ctx.fill();
      }
    } else if (mode === "pillars") {
      const n = 14, slot = (w - 48) / n, pw = slot * 0.56, rowsN = 9, gap = 6;
      const ph = (floor * 0.8 - gap * (rowsN - 1)) / rowsN;
      const beat = Math.exp(-(((t * bpm) / 60) % 1) * 7);
      for (let i = 0; i < n; i++) {
        const v = e[i], lit = Math.round(v * rowsN), jump = beat * (i < 5 ? 14 : 5);
        for (let k = 0; k < rowsN; k++) {
          const on = k < lit, y = floor * 0.88 - (k + 1) * ph - k * gap - (on ? jump : 0);
          ctx.fillStyle = on ? rgb(lerp(DEEP, LIGHT, k / (rowsN - 1))) : "rgba(255,255,255,.06)";
          roundRect(ctx, 24 + i * slot + (slot - pw) / 2, y, pw, ph, Math.min(pw, ph) / 2); ctx.fill();
        }
      }
    } else {
      const cell = Math.max(26, w / 18), cols = Math.ceil(w / cell), rowsN = Math.ceil(h / cell);
      for (let c = 0; c < cols; c++) for (let r = 0; r < rowsN; r++) {
        const along = (c / cols + r / rowsN * 0.35 - t * 0.12) % 1;
        const v = e[Math.floor(((along + 1) % 1) * 15)];
        const s = cell * (0.25 + 0.6 * v), x = c * cell + (cell - s) / 2, y = r * cell + (cell - s) / 2;
        ctx.fillStyle = rgb(lerp(DEEP, LIGHT, v), 0.25 + 0.75 * v);
        roundRect(ctx, x, y, s, s, s * 0.28); ctx.fill();
      }
    }
  };

  function drawLyrics(ctx, w, h, t) {
    backdrop(ctx, w, h, t, 1);
    const cycle = 13.4, local = reduceMotion.matches ? 8.2 : t % cycle;
    let index = LYRICS.findLastIndex(([at]) => local >= at);
    const [at, line] = LYRICS[index];
    const size = Math.max(26, Math.min(w * 0.072, 58));
    ctx.font = `900 ${size}px ${FONT}`; ctx.textBaseline = "alphabetic";
    const words = line.split(" "), maxW = w - 56;
    const lines = [[]]; let width = 0;
    words.forEach((word, i) => {
      const ww = ctx.measureText(word + " ").width;
      if (width + ww > maxW && lines[lines.length - 1].length) { lines.push([]); width = 0; }
      lines[lines.length - 1].push([word, i, width]); width += ww;
    });
    const step = 2.6 / words.length;
    const y0 = h * 0.42 - ((lines.length - 1) * size * 1.08) / 2;
    lines.forEach((ln, li) => ln.forEach(([word, i, x]) => {
      const p = Math.min(1, Math.max(0, (local - at - i * step) / 0.35));
      ctx.globalAlpha = p;
      ctx.fillStyle = "#fff";
      ctx.fillText(word, 28 + x, y0 + li * size * 1.08 + (1 - p) * 10);
    }));
    ctx.globalAlpha = 1;
    const next = LYRICS[(index + 1) % LYRICS.length][1];
    ctx.font = `800 ${Math.round(size * 0.42)}px ${FONT}`; ctx.fillStyle = "rgba(255,255,255,.4)";
    if (local > at + 2.6) ctx.fillText(next, 28, y0 + lines.length * size * 1.08 + size * 0.2);
  }

  const loop = canvasLoop($("#vis-canvas"), draw);
  const stage = $(".stage");
  $("#vis-picker").addEventListener("change", (e) => {
    mode = e.target.value;
    stage.classList.toggle("lyrics", mode === "lyrics");
    loop.redraw();
  });
}

/* ---------- Guest curators ---------- */

const SOUND_RAMP = [0xFF6E4B, 0xE11487, 0x8732FF, 0x1E5ADC, 0x0F3796];
const soundColour = (s) => { const p = s * (SOUND_RAMP.length - 1), i = Math.min(SOUND_RAMP.length - 2, Math.floor(p)); return mixRgb(SOUND_RAMP[i], SOUND_RAMP[i + 1], p - i); };
// Cosine similarity of the Meloday Engine's fingerprints for these songs, in SONGS order.
const SIM = [[1.0, 0.735, 0.686, 0.764, 0.642, 0.825, 0.695, 0.381, 0.751, 0.827, 0.92, 0.844, 0.857, 0.74], [0.735, 1.0, 0.672, 0.642, 0.642, 0.761, 0.628, 0.461, 0.716, 0.769, 0.761, 0.725, 0.707, 0.727], [0.686, 0.672, 1.0, 0.817, 0.835, 0.835, 0.692, 0.405, 0.637, 0.788, 0.623, 0.759, 0.837, 0.761], [0.764, 0.642, 0.817, 1.0, 0.826, 0.811, 0.726, 0.425, 0.813, 0.857, 0.73, 0.791, 0.829, 0.789], [0.642, 0.642, 0.835, 0.826, 1.0, 0.746, 0.728, 0.319, 0.687, 0.768, 0.586, 0.761, 0.786, 0.726], [0.825, 0.761, 0.835, 0.811, 0.746, 1.0, 0.806, 0.434, 0.696, 0.901, 0.762, 0.842, 0.829, 0.73], [0.695, 0.628, 0.692, 0.726, 0.728, 0.806, 1.0, 0.467, 0.61, 0.8, 0.639, 0.723, 0.697, 0.556], [0.381, 0.461, 0.405, 0.425, 0.319, 0.434, 0.467, 1.0, 0.337, 0.446, 0.376, 0.345, 0.359, 0.235], [0.751, 0.716, 0.637, 0.813, 0.687, 0.696, 0.61, 0.337, 1.0, 0.855, 0.786, 0.801, 0.82, 0.833], [0.827, 0.769, 0.788, 0.857, 0.768, 0.901, 0.8, 0.446, 0.855, 1.0, 0.8, 0.893, 0.884, 0.802], [0.92, 0.761, 0.623, 0.73, 0.586, 0.762, 0.639, 0.376, 0.786, 0.8, 1.0, 0.807, 0.784, 0.778], [0.844, 0.725, 0.759, 0.791, 0.761, 0.842, 0.723, 0.345, 0.801, 0.893, 0.807, 1.0, 0.896, 0.858], [0.857, 0.707, 0.837, 0.829, 0.786, 0.829, 0.697, 0.359, 0.82, 0.884, 0.784, 0.896, 1.0, 0.842], [0.74, 0.727, 0.761, 0.789, 0.726, 0.73, 0.556, 0.235, 0.833, 0.802, 0.778, 0.858, 0.842, 1.0]];
const SONGS = [
  ["Lush Life", "Zara Larsson", "So Good", 2017, 98], ["Midnight Sun", "Zara Larsson", "Midnight Sun", 2025, 101],
  ["Toxic", "Britney Spears", "In The Zone", 2003, 143], ["Womanizer", "Britney Spears", "Circus (Deluxe Version)", 2008, 139],
  ["Umbrella", "Rihanna", "Good Girl Gone Bad: Reloaded", 2008, 87], ["Only Girl (In The World)", "Rihanna", "Loud", 2010, 126],
  ["Bad Romance", "Lady Gaga", "The Fame Monster (Deluxe Edition)", 2009, 119], ["Abracadabra", "Lady Gaga", "MAYHEM", 2025, 126],
  ["7 rings", "Ariana Grande", "thank u, next", 2019, 140], ["Into You", "Ariana Grande", "Dangerous Woman", 2016, 108],
  ["New Rules", "Dua Lipa", "Dua Lipa (Deluxe)", 2017, 116], ["Don't Start Now", "Dua Lipa", "Future Nostalgia", 2020, 124],
  ["Espresso", "Sabrina Carpenter", "Short n' Sweet", 2024, 104], ["Nonsense", "Sabrina Carpenter", "emails i can't send", 2022, 139],
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
  ["twin", "Twin", "Stays close to what's playing. This order comes from the Meloday Engine's fingerprints of these songs, and the bar under each cover shows how close it sounds to Lush Life.", () =>
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
  $("#top-artists").innerHTML = ["Nicki Minaj", "Zara Larsson", "Ariana Grande", "Tove Lo", "Lana Del Rey"].map((a, i) =>
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
    "Meloday Pulse, a station with a daily schedule of programmes",
    "Pulse Guide for scheduling your own programmes once, daily, on weekdays, at weekends or on chosen days",
    "Programmes that last one song, a number of songs or a number of minutes",
    "Sonic Radio, which follows the sound of a song",
    "Sonic Adventure, which travels from one song you pick to another",
  ]],
  ["Meloday Engine", [
    "Analyses your songs on your PC, with no cloud service and no Plex Pass needed",
    "What ME Hears: 112 words for mood, energy, genre, instruments, vocals and moments",
    "Sounds Like search, with a Create Playlist button for up to 50 songs",
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
    "Bars, Pillars and Tiles visualizers",
    "projectM with five MilkDrop presets",
  ]],
  ["Library", [
    "Albums, artists, songs, playlists, collections and folders",
    "Grid and list views",
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
  const list = $("#feature-list"), input = $("#feature-filter"), empty = $("#feature-empty"), count = $("#feature-count");
  const total = FEATURES.reduce((n, [, items]) => n + items.length, 0);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const mark = (text, q) => {
    if (!q) return esc(text);
    const i = text.toLowerCase().indexOf(q);
    return i < 0 ? esc(text) : esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
  };
  function render() {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    list.innerHTML = FEATURES.map(([group, items]) => {
      const groupHit = q && group.toLowerCase().includes(q);
      const hits = items.filter((t) => !q || groupHit || t.toLowerCase().includes(q));
      if (!hits.length) return "";
      shown += hits.length;
      return `<div class="group"><h3>${mark(group, q)}</h3><ul>${hits.map((t) => `<li>${mark(t, q)}</li>`).join("")}</ul></div>`;
    }).join("");
    count.textContent = q ? `Showing ${shown} of ${total} features.` : `${total} features, grouped by what they're for.`;
    empty.hidden = shown > 0;
    $("span", empty).textContent = input.value.trim();
  }
  input.addEventListener("input", render);
  $("#feature-clear").addEventListener("click", () => { input.value = ""; render(); input.focus(); });
  render();
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

Promise.all([document.fonts.load("900 16px Nunito"), document.fonts.load("700 16px Nunito"), document.fonts.ready]).then(() => {
  setHour(+hourInput.value, true);
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
});
