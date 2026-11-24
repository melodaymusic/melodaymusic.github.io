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
  { made: "late-night", name: "Late Night", sub: "Nicki Minaj, The Weeknd, Lauv and more" },
  { made: "road-trip", name: "Road Trip", sub: "MARINA, Ciara, aespa and more" },
  { made: "rainy-day", name: "Rainy Day", sub: "Laufey, Sam Smith, Haroula Rose and more" },
  { made: "feel-good", name: "Feel Good", sub: "Lady Gaga, Ozuna, Davido and more" },
  { name: "R&B Deep Cuts", sub: "Niche mix", family: 12, pictures: ["SZA|SOS", "Frank Ocean|channel ORANGE", "Kali Uchis|Red Moon In Venus", "The Weeknd|House Of Balloons (Original)"] },
  { name: "Dreamy Synth-Pop", sub: "Your Sounds", family: 15, pictures: ["Lorde|Melodrama", "Carly Rae Jepsen|E•mo•tion (Deluxe Expanded Edition)", "Troye Sivan|Bloom", "Tove Lo|Dirt Femme"] },
  { name: "2000s Pop", sub: "Niche mix", family: 10, pictures: ["Britney Spears|In The Zone", "Rihanna|Good Girl Gone Bad: Reloaded", "Lady Gaga|The Fame Monster (Deluxe Edition)", "Britney Spears|Circus (Deluxe Version)"] },
  { name: "Dua Lipa Mix", sub: "Artist mix", family: 0, pictures: ["photo|Dua Lipa", "photo|Lady Gaga", "photo|Charli xcx", "photo|Sabrina Carpenter"] },
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
// Ports of the app's painters (src/MelodayMusic.App/Controls), fed by a made-up song so the page stays silent.

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

/** A 32-band spectrum for a four-bar loop at 118 BPM: kick, bass line, snare on two and four, hats, chords and a lead. */
function makeSong() {
  const bpm = 118, N = 32, bands = new Float32Array(N);
  const bassNotes = [0, 0, 3, 0, 5, 5, 3, 7], lead = [14, 16, 18, 16, 20, 18, 16, 14, 12, 14, 16, 18, 22, 20, 18, 16];
  let lastBeat = -1;
  return {
    bpm, bands,
    update(t) {
      const beat = (t * bpm) / 60, phase = beat % 1, bar = Math.floor(beat / 4) % 4, inBar = beat % 4;
      const kick = Math.exp(-phase * 7);
      const snare = (Math.floor(inBar) % 2 === 1) ? Math.exp(-phase * 9) : 0;
      const eighth = (beat * 2) % 1, sixteenth = (beat * 4) % 1;
      const hat = Math.exp(-sixteenth * 16) * ((Math.floor(beat * 4) % 2) ? 0.55 : 1);
      const bassEnv = Math.exp(-eighth * 3.5), bassBand = 1 + (bassNotes[Math.floor(beat * 2) % 8] % 4);
      const chord = 0.45 + 0.25 * Math.sin((beat / 16) * Math.PI * 2 + bar);
      const leadBand = lead[Math.floor(beat * 2) % 16], leadEnv = 0.5 + 0.5 * Math.exp(-eighth * 2.5);
      const drop = bar === 3 && inBar > 3 ? 0.35 : 1;
      for (let b = 0; b < N; b++) {
        let v = 0.03 + 0.06 * vNoise(t * 6, b, 3);
        if (b < 5) v += kick * (1 - b * 0.15) * drop;
        v += bassEnv * 0.7 * Math.exp(-((b - bassBand) ** 2) / 2.5);
        if (b >= 7 && b <= 22) v += snare * (0.55 - Math.abs(b - 13) * 0.03);
        if (b >= 6 && b <= 17) v += chord * 0.35 * (0.6 + 0.4 * Math.sin(b * 1.3 + bar));
        v += leadEnv * 0.45 * Math.exp(-((b - leadBand) ** 2) / 1.6);
        if (b >= 20) v += hat * (0.55 + (b - 20) * 0.015);
        bands[b] = Math.min(1, v * 1.35 * (1 - b * 0.006));
      }
      const beatIndex = Math.floor(beat);
      if (beatIndex !== lastBeat) { lastBeat = beatIndex; this.beatAt = (beatIndex * 60) / bpm; }
      this.bass = vAverage(bands, 0, 4);
      this.level = vAverage(bands, 0, N) * 0.4;
    },
    pulse(t) { return Math.exp(-Math.max(0, t - (this.beatAt ?? 0)) / 0.16); },
  };
}

/** BandFollower: each band against its own recent peak and average, so visuals follow hits rather than loudness. */
function bandFollower(count) {
  const peak = new Float32Array(count), mean = new Float32Array(count), levels = new Float32Array(count);
  return {
    levels,
    update(bands, slices, dt) {
      slices = Math.min(slices, count);
      const fall = Math.exp(-dt / 2.5), settle = 1 - Math.exp(-dt / 0.8);
      for (let i = 0; i < slices; i++) {
        const from = Math.floor((i * bands.length) / slices);
        const raw = vAverage(bands, from, Math.max(from + 1, Math.floor(((i + 1) * bands.length) / slices)));
        peak[i] = Math.max(raw, Math.max(peak[i] * fall, 0.04));
        mean[i] += (raw - mean[i]) * settle;
        const steady = raw / peak[i], hit = Math.min(1, Math.max(0, (raw - mean[i]) / (0.5 * peak[i])));
        const target = Math.min(1, Math.max(0, 0.3 * steady * steady + 0.9 * hit));
        levels[i] += (target - levels[i]) * (1 - Math.exp(-dt / (target > levels[i] ? 0.025 : 0.22)));
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

/**
 * Retrowave: a flight down a valley of glowing grid towards a setting sun, between low-poly mountains with gold edges.
 * Each new row of land is made at the horizon from the music at that moment: bass raises the slopes nearest the valley,
 * treble the far ridges.
 */
function retrowavePainter() {
  const VALLEY = 8, RIDGE = 18, ACROSS = VALLEY + RIDGE, COLUMNS = ACROSS * 2 + 1, ROWS = 40, KEEP = 56;
  const EYE = 2.6, NEAREST = 2.2, FAR = ROWS - 2;
  const NIGHT = [5, 2, 8], HAZE = [74, 34, 14], GOLD = [238, 196, 72], HAZE_GLOW = [255, 176, 64];
  const spread = Array.from({ length: ACROSS + 1 }, (_, k) => { const j = Math.max(0, k - VALLEY); return Math.min(k, VALLEY) + 1.6 * j + 0.2 * j * j; });
  const heights = Array.from({ length: KEEP }, () => new Float32Array(COLUMNS)), rowOf = new Array(KEEP).fill(-Infinity);
  const screen = Array.from({ length: ROWS + 1 }, () => Array.from({ length: COLUMNS }, () => [0, 0]));
  const follow = bandFollower(RIDGE);
  let travel = 0, speed = 2.6, last = -1, level = 0, bass = 0, camera = 0, W = 0, H = 0, horizon = 0, focal = 0;

  const slotOf = (r) => ((r % KEEP) + KEEP) % KEEP;
  const height = (r, c) => heights[slotOf(r)][c];

  function grow(r) {
    const slot = slotOf(r);
    if (rowOf[slot] === r) return;
    rowOf[slot] = r;
    const row = heights[slot];
    for (const side of [-1, 1]) {
      let before = 0;
      for (let k = 0; k <= ACROSS; k++) {
        const c = ACROSS + side * k;
        if (k <= VALLEY) { row[c] = 0; continue; }
        const rise = vSmooth(0, 1, (k - VALLEY) / 4), broad = 1 + 0.03 * (spread[k] - VALLEY);
        const shape = Math.pow(vLayered(r * 0.17 + side * 41, spread[k] * 0.06, 3), 1.8) * 1.9;
        const music = 0.35 + 1.2 * follow.levels[Math.min(RIDGE - 1, k - VALLEY - 1)] + 0.3 * level;
        const hgt = 4.2 * rise * broad * shape * music;
        row[c] = k <= VALLEY + 2 ? Math.max(hgt, before * 0.9) : hgt;
        before = row[c];
      }
    }
  }

  const project = (out, x, y, z) => { z = Math.max(0.35, z); out[0] = W / 2 + (focal * (x - camera)) / z; out[1] = horizon + (focal * (EYE - y)) / z; };

  function ellipseGlow(ctx, x, y, rx, ry, stops, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = "lighter";
    ctx.translate(x, y); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    stops.forEach(([at, c]) => g.addColorStop(at, c));
    ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
    ctx.restore();
  }

  function sky(ctx, t, pulse) {
    const g = ctx.createLinearGradient(0, 0, 0, horizon);
    g.addColorStop(0, "rgb(10,4,16)"); g.addColorStop(0.45, "rgb(40,9,44)"); g.addColorStop(0.8, "rgb(104,14,44)"); g.addColorStop(1, "rgb(170,30,40)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, horizon + 1);
    for (let i = 0; i < 90; i++) {
      const x = vHash(i, 1) * W, y = vHash(i, 2) * vHash(i, 3) * horizon * 0.85;
      const twinkle = 0.55 + 0.45 * Math.sin(t * (0.8 + 1.7 * vHash(i, 4)) + i);
      ctx.fillStyle = `rgba(255,236,220,${(200 * twinkle * (1 - (y / horizon) * 0.6)) / 255})`;
      ctx.beginPath(); ctx.arc(x, y, 0.6 + 1.2 * vHash(i, 5), 0, Math.PI * 2); ctx.fill();
    }
    const radius = Math.min(W * 0.2, H * 0.36), sx = W / 2 - camera * 6, sy = horizon - radius * 0.58;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, horizon); ctx.clip();
    ellipseGlow(ctx, sx, sy, radius * 2.4, radius * 2.4, [[0, "rgba(255,90,40,1)"], [0.45, "rgba(230,40,50,.43)"], [1, "rgba(160,20,60,0)"]], Math.min(1, 0.4 + 0.35 * bass + 0.15 * pulse));
    ctx.restore();
    const disc = ctx.createLinearGradient(0, sy - radius, 0, sy + radius);
    disc.addColorStop(0, "rgb(232,44,36)"); disc.addColorStop(0.5, "rgb(255,104,22)"); disc.addColorStop(0.85, "rgb(255,182,30)"); disc.addColorStop(1, "rgb(255,214,70)");
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(sx, sy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = vCss(NIGHT); ctx.fillRect(0, horizon, W, H - horizon);
    ctx.save(); ctx.beginPath(); ctx.rect(0, horizon - H * 0.05, W, H * 0.085); ctx.clip();
    ellipseGlow(ctx, sx, horizon, W * 0.7, H * 0.05, [[0, "rgba(255,200,90,1)"], [0.4, "rgba(255,140,40,.59)"], [1, "rgba(200,60,30,0)"]], 0.75 + 0.25 * pulse);
    ctx.restore();
  }

  function seen(i, side, from, to) {
    let top = Infinity;
    for (let k = from; k <= to; k++) top = Math.min(top, screen[i][ACROSS + side * k][1], screen[i + 1][ACROSS + side * k][1]);
    const lo = screen[i][ACROSS + side * from][0], hi = screen[i][ACROSS + side * to][0];
    return top < H && Math.max(lo, hi) > -W * 0.1 && Math.min(lo, hi) < W * 1.1;
  }

  function sideOf(ctx, r, i, side, face, line, width) {
    const runs = [];
    let start = VALLEY, rising = true;
    for (let k = VALLEY; k < ACROSS; k++) {
      const here = height(r, ACROSS + side * k) + height(r + 1, ACROSS + side * k);
      const next = height(r, ACROSS + side * (k + 1)) + height(r + 1, ACROSS + side * (k + 1));
      const up = next >= here;
      if (k === start) rising = up;
      else if (up !== rising) { runs.push([start, k, rising]); start = k; rising = up; }
    }
    runs.push([start, ACROSS, rising]);
    for (let n = runs.length - 1; n >= 0; n--) {
      const [from, to, up] = runs[n];
      if (!up && Math.min(height(r, ACROSS + side * from), height(r + 1, ACROSS + side * from)) > EYE + 0.3) continue;
      if (!seen(i, side, from, to)) continue;
      const faces = new Path2D(), edges = new Path2D();
      for (let k = to - 1; k >= from; k--) {
        const inner = ACROSS + side * k, outer = ACROSS + side * (k + 1);
        const a = screen[i][inner], b = screen[i][outer], c = screen[i + 1][outer], d = screen[i + 1][inner];
        faces.moveTo(a[0], a[1]); faces.lineTo(b[0], b[1]); faces.lineTo(c[0], c[1]); faces.lineTo(d[0], d[1]); faces.closePath();
        edges.moveTo(a[0], a[1]); edges.lineTo(b[0], b[1]);
        edges.moveTo(d[0], d[1]); edges.lineTo(c[0], c[1]);
        edges.moveTo(b[0], b[1]); edges.lineTo(c[0], c[1]);
        edges.moveTo(a[0], a[1]); edges.lineTo(c[0], c[1]);
        if (k === from) { edges.moveTo(a[0], a[1]); edges.lineTo(d[0], d[1]); }
      }
      ctx.fillStyle = face; ctx.fill(faces);
      ctx.strokeStyle = line; ctx.lineWidth = width; ctx.stroke(edges);
    }
  }

  function floor(ctx, i, line, width, pulse) {
    const grid = new Path2D();
    const a = screen[i][ACROSS - VALLEY], b = screen[i][ACROSS + VALLEY];
    grid.moveTo(a[0], a[1]); grid.lineTo(b[0], b[1]);
    for (let c = ACROSS - VALLEY; c <= ACROSS + VALLEY; c++) { grid.moveTo(screen[i][c][0], screen[i][c][1]); grid.lineTo(screen[i + 1][c][0], screen[i + 1][c][1]); }
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = vCss(line, (40 + 50 * pulse) / 255); ctx.lineWidth = width * 4; ctx.stroke(grid);
    ctx.restore();
    ctx.strokeStyle = vCss(line); ctx.lineWidth = width; ctx.stroke(grid);
  }

  return (ctx, s, p, t, w, h) => {
    const dt = last < 0 ? 1 / 60 : Math.min(0.1, Math.max(0.001, t - last)); last = t;
    follow.update(s.bands, RIDGE, dt);
    level += (Math.min(1, s.level * 3) - level) * (1 - Math.exp(-dt / 0.6));
    bass += (s.bass - bass) * (1 - Math.exp(-dt / (s.bass > bass ? 0.05 : 0.3)));
    speed += ((s.bpm / 60) * 1.4 + 1.2 * level - speed) * (1 - Math.exp(-dt / 1.5));
    travel += speed * dt;
    W = w; H = h; horizon = h * 0.5; focal = ((h - horizon) * NEAREST) / EYE;
    camera = 0.55 * Math.sin(t * 0.11) + 0.25 * Math.sin(t * 0.27 + 1.3);
    const pulse = s.pulse(t), first = Math.floor(travel + NEAREST - 1.2);
    for (let r = first; r <= first + ROWS; r++) grow(r);
    sky(ctx, t, pulse);

    const offset = travel - first;
    for (let i = 0; i <= ROWS; i++) {
      const r = first + i, z = i - offset;
      for (let c = 0; c < COLUMNS; c++) {
        const k = Math.abs(c - ACROSS), side = Math.sign(c - ACROSS);
        let x = side * spread[k], zz = z;
        if (k > VALLEY + 1) {
          x += (vHash(r, c) - 0.5) * 0.5 * (spread[k] - spread[k - 1]);
          zz += (vHash(r, c + 999) - 0.5) * 0.4;
        }
        project(screen[i][c], x, height(r, c), zz);
      }
    }
    for (let i = ROWS - 1; i >= 0; i--) {
      const z = i - offset + 0.5;
      if (z < 0.3) continue;
      const fog = Math.pow(vSmooth(FAR * 0.6, FAR, z), 1.6);
      const bright = (0.55 + 0.45 * vSmooth(0, FAR * 0.5, z)) * (0.85 + 0.3 * pulse);
      const line = vMix(vMix(NIGHT, GOLD, Math.min(1, bright)), HAZE_GLOW, fog * 0.85);
      const width = Math.min(1.5, Math.max(0.7, 3.2 / z)) * Math.max(1, W / 900);
      const face = vCss(vMix(NIGHT, HAZE, fog)), stroke = vCss(line);
      for (const side of [-1, 1]) sideOf(ctx, first + i, i, side, face, stroke, width);
      floor(ctx, i, line, width, pulse);
    }
  };
}

function buildVisualizer() {
  const stage = $(".stage"), song = makeSong(), art = $(".stage-art.real-art");
  const theatre = $(".theatre");
  let mode = "bars";
  let palette = paletteFrom([30, 180, 255]);
  const glow = () => {
    const c = mode === "retrowave" ? [255, 92, 30] : mode === "lyrics" ? [135, 50, 255] : palette[2];
    theatre.style.setProperty("--glow", vCss(c, 0.5));
  };
  const usePalette = () => { try { palette = paletteFrom(vividColour(art)); } catch { /* keep the default */ } glow(); };
  if (art.complete && art.naturalWidth) usePalette(); else art.addEventListener("load", usePalette, { once: true });

  const painters = { bars: barsPainter(), halo: haloPainter(), pillars: pillarsPainter(), retrowave: retrowavePainter() };
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
      if (mode !== "retrowave") { ctx.fillStyle = "rgba(10,10,14,.55)"; ctx.fillRect(0, 0, w, h); }
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
    "Meloday Pulse, a station with a daily schedule of programs",
    "Pulse Guide for scheduling your own programs once, daily, on weekdays, at weekends or on chosen days",
    "Change Pulse's own lineup: move a program, change its days or take it out",
    "Programs that last one song, a number of songs or a number of minutes",
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
    "Visualizers: Bars, Halo, M-Wave, Sun, Pillars, Tiles, Ribbons, Light Wall, Bloom and Retrowave",
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

// Content rises into place the first time it scrolls into view. Items in a row follow one another.
function reveal() {
  if (reduceMotion.matches) return;
  const items = document.querySelectorAll([
    ".hero-copy > *", ".hero-art", ".section-head", ".two-col > *", ".theatre", ".np-facts > li", ".facts > li",
    ".three > *", ".day-strip > li", ".cover-grid > li", ".details-grid > *", ".faq-grid > *", ".chooser", ".queue-panel",
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
