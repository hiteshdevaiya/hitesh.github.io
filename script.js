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
      return;
   }
   Object.keys(sections).forEach(function (key) { if (key !== id) sections[key].classList.remove("tab-flash"); });
   replay(sections[id], "tab-flash");
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

window.addEventListener("resize", moveIndicator);
window.addEventListener("load", moveIndicator);
moveIndicator();
