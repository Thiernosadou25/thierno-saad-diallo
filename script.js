// ===== Langue FR / EN =====
// Priorité : ?lang=en dans l'URL, puis choix mémorisé, puis français par défaut.
const root = document.documentElement;

function getSavedLang() {
  try { return localStorage.getItem("lang"); } catch (e) { return null; }
}
function saveLang(lang) {
  try { localStorage.setItem("lang", lang); } catch (e) { /* stockage indisponible */ }
}
function setLang(lang) {
  root.setAttribute("lang", lang);
  const t = root.getAttribute("data-title-" + lang);
  if (t) document.title = t;
  document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
}

const urlLang = new URLSearchParams(location.search).get("lang");
setLang(urlLang === "en" || urlLang === "fr" ? urlLang : getSavedLang() || "fr");

document.querySelectorAll(".lang-toggle").forEach((btn) =>
  btn.addEventListener("click", () => {
    const next = root.getAttribute("lang") === "fr" ? "en" : "fr";
    setLang(next);
    saveLang(next);
  })
);

// ===== Menu mobile =====
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", false);
    })
  );
}

// ===== Chiffres animés =====
const fmt = (n) => n.toLocaleString(root.getAttribute("lang") === "en" ? "en-US" : "fr-FR");
const counters = document.querySelectorAll("[data-count]");
const animate = (el) => {
  const end = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / 1200, 1);
    el.textContent = fmt(Math.round(end * (1 - Math.pow(1 - p, 3)))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  counters.forEach((c) => io.observe(c));
} else {
  counters.forEach((c) => (c.textContent = fmt(Number(c.dataset.count)) + (c.dataset.suffix || "")));
}
document.addEventListener("langchange", () =>
  counters.forEach((c) => (c.textContent = fmt(Number(c.dataset.count)) + (c.dataset.suffix || "")))
);

// Nombres fixes formatés selon la langue : <b data-num="14079">14 079</b>
const formatNums = () =>
  document.querySelectorAll("[data-num]").forEach((el) => (el.textContent = fmt(Number(el.dataset.num))));
formatNums();
document.addEventListener("langchange", formatNums);

// ===== Année du pied de page =====
document.querySelectorAll(".year").forEach((y) => (y.textContent = new Date().getFullYear()));

// ===== Réglages communs des graphiques (Chart.js) =====
window.chartTheme = {
  navy: "#0F2A4A", accent: "#2563EB", sky: "#0EA5E9", teal: "#0D9488",
  grey: "#A9B8CA", grid: "#EEF2F7", text: "#5B6778",
};
if (window.Chart) {
  Chart.defaults.font.family = '"Inter", system-ui, sans-serif';
  Chart.defaults.color = window.chartTheme.text;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.maintainAspectRatio = false;
}
// Texte selon la langue active : L({fr: "...", en: "..."})
window.L = (o) => o[root.getAttribute("lang")] || o.fr;
