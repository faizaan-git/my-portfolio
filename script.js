import { inject } from '@vercel/analytics';

inject();

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const themeToggle = document.querySelector(".theme-toggle");
const year = document.querySelector("#year");
const siteIntro = document.querySelector("#site-intro");

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeToggle.querySelector("span").textContent = isDark ? "☀" : "◐";
  }
};

if (year) {
  year.textContent = new Date().getFullYear();
}

let savedTheme = "light";

try {
  savedTheme = localStorage.getItem("portfolio-theme") === "dark" ? "dark" : "light";
} catch (error) {
  console.warn("The saved theme preference could not be read.", error);
}

applyTheme(savedTheme);

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    siteNav.classList.toggle("is-open", !isOpen);
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      siteNav.classList.remove("is-open");
    }
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);

    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch (error) {
      console.warn("The theme preference could not be saved.", error);
    }
  });
}

if (siteIntro) {
  const progress = siteIntro.querySelector(".intro-progress");
  const startTime = performance.now();
  const minimumDuration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 850;
  const maximumDuration = 4000;
  let pageLoaded = document.readyState === "complete";

  siteIntro.hidden = false;
  document.body.classList.add("intro-loading");

  if (!pageLoaded) {
    window.addEventListener("load", () => {
      pageLoaded = true;
    }, { once: true });
  }

  const updateIntro = (now) => {
    const elapsed = now - startTime;
    const completion = minimumDuration === 0 ? 1 : Math.min(elapsed / minimumDuration, 1);
    progress.textContent = String(Math.min(Math.floor(completion * 92), 92)).padStart(2, "0");

    if ((pageLoaded && completion === 1) || elapsed >= maximumDuration) {
      progress.textContent = "100";
      siteIntro.classList.add("is-exiting");
      document.body.classList.remove("intro-loading");
      window.setTimeout(() => {
        siteIntro.hidden = true;
      }, 550);
      return;
    }

    window.requestAnimationFrame(updateIntro);
  };

  window.requestAnimationFrame(updateIntro);
}
