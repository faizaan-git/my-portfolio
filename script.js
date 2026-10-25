const siteNav = document.querySelector(".site-nav");
const themeToggles = document.querySelectorAll(".theme-toggle");
const year = document.querySelector("#year");
const siteIntro = document.querySelector("#site-intro");

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;

  for (const themeToggle of themeToggles) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    const icon = themeToggle.querySelector("span");
    if (icon) {
      icon.textContent = isDark ? "☀" : "◐";
    }
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

if (siteNav) {
  siteNav.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    if (link) {
      for (const navLink of siteNav.querySelectorAll("a[href^='#']")) {
        navLink.removeAttribute("aria-current");
      }
      link.setAttribute("aria-current", "location");
    }
  });
}

if (siteNav && "IntersectionObserver" in window) {
  const sectionLinks = [...siteNav.querySelectorAll("a[href^='#']")];
  const sections = sectionLinks
    .map((link) => ({
      link,
      section: document.querySelector(link.hash),
    }))
    .filter(({ section }) => section);

  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSections = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
    const activeSection = visibleSections[0]?.target;

    if (!activeSection) {
      return;
    }

    for (const { link, section } of sections) {
      if (section === activeSection) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }, {
    rootMargin: "-20% 0px -65% 0px",
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });

  for (const { section } of sections) {
    sectionObserver.observe(section);
  }
}

for (const themeToggle of themeToggles) {
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
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
    progress.style.transform = `scaleX(${Math.min(completion * 0.92, 0.92)})`;

    if ((pageLoaded && completion === 1) || elapsed >= maximumDuration) {
      progress.style.transform = "scaleX(1)";
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
