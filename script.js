const desktop = window.matchMedia("(min-width:1040px)");
const nav = document.querySelector("header nav");
const header = document.querySelector("header");
const tabs = {
   about: document.getElementById("getAbout"),
   resume: document.getElementById("getResume"),
   portfolio: document.getElementById("getPortfolio"),
   contact: document.getElementById("getContact")
};
const sections = {};
Object.keys(tabs).forEach(function (id) { sections[id] = document.getElementById(id); });

const indicator = document.createElement("span");
indicator.className = "nav-indicator";
nav.appendChild(indicator);

let current = "about";
let scrollLock = null;

function moveIndicator() {
   const link = tabs[current];
   indicator.style.setProperty("--x", link.offsetLeft + "px");
   indicator.style.setProperty("--y", link.offsetTop + "px");
   indicator.style.setProperty("--w", link.offsetWidth + "px");
   indicator.style.setProperty("--h", link.offsetHeight + "px");
}

function select(id) {
   Object.keys(tabs).forEach(function (key) { tabs[key].classList.toggle("selected", key === id); });
   current = id;
   moveIndicator();
}

function replay(el, className) {
   el.classList.remove(className);
   void el.offsetWidth;
   el.classList.add(className);
}

function openTab(id) {
   select(id);
   if (desktop.matches) {
      Object.keys(sections).forEach(function (key) { sections[key].classList.remove("view"); });
      sections[id].classList.add("view");
      sections[id].scrollTop = 0;
      replayReveal(sections[id]);
      return;
   }
   Object.keys(sections).forEach(function (key) { if (key !== id) sections[key].classList.remove("tab-flash"); });
   replay(sections[id], "tab-flash");
   replayReveal(sections[id]);
   clearTimeout(scrollLock);
   scrollLock = setTimeout(function () { scrollLock = null; }, 900);
   window.scrollTo({ top: sections[id].getBoundingClientRect().top + window.scrollY - header.offsetHeight - 12, behavior: "smooth" });
}

Object.keys(tabs).forEach(function (id) {
   tabs[id].addEventListener("click", function (e) { e.preventDefault(); openTab(id); });
});
document.getElementById("getContactFooter").addEventListener("click", function (e) { e.preventDefault(); openTab("contact"); });

// Mobile: highlight the tab of the section being scrolled through
if ("IntersectionObserver" in window) {
   const spy = new IntersectionObserver(function (entries) {
      if (desktop.matches || scrollLock) return;
      entries.forEach(function (entry) { if (entry.isIntersecting) select(entry.target.id); });
   }, { rootMargin: "-45% 0px -50% 0px" });
   Object.keys(sections).forEach(function (id) { spy.observe(sections[id]); });
}

// Scroll reveal (same feel as truenorth-hub.com): blocks fade up 24px, items in a group stagger 90ms
const revealStep = 90;
const revealGroups = "#presentation>div, .about-services>div, .resume-line, .resume-skills>div section, .contact-information";
const revealSingles = ".title, .about-aboutMe>div, .profile-buttons";
let revealer = null;

document.querySelectorAll(revealGroups).forEach(function (group) {
   Array.from(group.children).forEach(function (child, index) {
      child.dataset.reveal = Math.min(index, 6) * revealStep;
   });
});
document.querySelectorAll(revealSingles).forEach(function (el) {
   if (!el.dataset.reveal) el.dataset.reveal = 0;
});

// Drop the reveal classes once the animation lands so hover transitions stay intact
function settle(el) {
   el.classList.remove("reveal", "in");
   el.style.removeProperty("--d");
}

function show(el) {
   el.classList.add("in");
   el.addEventListener("transitionend", function () { settle(el); }, { once: true });
   setTimeout(function () { settle(el); }, Number(el.dataset.reveal) + 900);
}

function arm(el) {
   el.classList.remove("in");
   el.classList.add("reveal");
   el.style.setProperty("--d", el.dataset.reveal + "ms");
   revealer.observe(el);
}

if ("IntersectionObserver" in window) {
   document.documentElement.classList.add("reveal-ready");
   revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
         if (!entry.isIntersecting) return;
         revealer.unobserve(entry.target);
         show(entry.target);
      });
   }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
   document.querySelectorAll("[data-reveal]").forEach(arm);
}

function replayReveal(section) {
   if (!revealer) return;
   section.querySelectorAll("[data-reveal]").forEach(function (el) {
      revealer.unobserve(el);
      arm(el);
   });
}

window.addEventListener("resize", moveIndicator);
window.addEventListener("load", moveIndicator);
moveIndicator();
