(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-nav");

  if (menuButton instanceof HTMLButtonElement && navigation instanceof HTMLElement) {
    menuButton.addEventListener("click", () => {
      const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isExpanded));
      navigation.classList.toggle("is-open", !isExpanded);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) {
        menuButton.setAttribute("aria-expanded", "false");
        navigation.classList.remove("is-open");
      }
    });
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".primary-nav a").forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    const targetPage = link.getAttribute("href");
    if (targetPage === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const teacherName = typeof config.teacherName === "string" ? config.teacherName.trim() : "";
  const teacherBiography = typeof config.teacherBiography === "string" ? config.teacherBiography.trim() : "";
  const teachingApproach = typeof config.teachingApproach === "string" ? config.teachingApproach.trim() : "";
  const email = typeof config.contactEmail === "string" ? config.contactEmail.trim() : "";

  document.querySelectorAll("[data-teacher-name]").forEach((element) => {
    element.textContent = teacherName || "Teacher profile coming soon";
  });
  document.querySelectorAll("[data-teacher-biography]").forEach((element) => {
    element.textContent = teacherBiography || "The teacher biography will be added here.";
  });
  document.querySelectorAll("[data-teaching-approach]").forEach((element) => {
    element.textContent = teachingApproach || "The teacher’s approach to lessons will be added here.";
  });

  document.querySelectorAll("[data-contact-email]").forEach((element) => {
    if (!(element instanceof HTMLAnchorElement) || !isValidEmail(email)) return;
    element.href = `mailto:${email}`;
    element.hidden = false;
    const status = document.querySelector("#contact-email-status");
    if (status) status.textContent = email;
  });
  const emailStatus = document.querySelector("#contact-email-status");
  if (email && !isValidEmail(email) && emailStatus) {
    emailStatus.textContent = "Email contact is unavailable because the configured address is invalid.";
  }

  const bookingUrl = typeof config.bookingUrl === "string" ? config.bookingUrl.trim() : "";
  document.querySelectorAll("[data-booking-url]").forEach((element) => {
    if (!(element instanceof HTMLAnchorElement) || !isWebUrl(bookingUrl)) return;
    element.href = bookingUrl;
    element.target = "_blank";
    element.rel = "noopener noreferrer";
    element.hidden = false;
  });
  document.querySelectorAll("[data-booking-unconfigured]").forEach((element) => {
    if (isWebUrl(bookingUrl)) element.hidden = true;
  });

  const socials = config.socialLinks && typeof config.socialLinks === "object" ? config.socialLinks : {};
  const socialContainer = document.querySelector("#social-links");
  if (socialContainer instanceof HTMLElement) {
    Object.entries(socials).forEach(([name, url]) => {
      if (typeof url !== "string" || !isWebUrl(url.trim())) return;
      const anchor = document.createElement("a");
      anchor.href = url.trim();
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      anchor.textContent = name;
      socialContainer.append(anchor);
    });
    if (socialContainer.childElementCount > 0) {
      const status = document.querySelector("#social-status");
      if (status) status.textContent = "Follow along on social media.";
    }
  }

  const contactIntro = document.querySelector("[data-contact-intro]");
  if (
    contactIntro &&
    (isValidEmail(email) || isWebUrl(bookingUrl) || (socialContainer instanceof HTMLElement && socialContainer.childElementCount > 0))
  ) {
    contactIntro.textContent = "Have a question about learning or private lessons? Use the configured contact options below to get in touch.";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isWebUrl(value) {
    if (!value) return false;
    try {
      const parsedUrl = new URL(value);
      return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
    } catch {
      return false;
    }
  }
})();
