(() => {
  "use strict";

  const form = document.querySelector("#booking-form");
  const status = document.querySelector("#booking-status");
  const configNotice = document.querySelector("#booking-config-notice");
  if (!(form instanceof HTMLFormElement) || !(status instanceof HTMLElement) || !(configNotice instanceof HTMLElement)) return;

  const config = window.SITE_CONFIG || {};
  const email = typeof config.contactEmail === "string" ? config.contactEmail.trim() : "";
  const bookingUrl = typeof config.bookingUrl === "string" ? config.bookingUrl.trim() : "";
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validBookingUrl = isWebUrl(bookingUrl);

  if (validBookingUrl) {
    form.hidden = true;
    configNotice.textContent = "Use the configured booking provider to request a lesson. Follow its instructions; your reservation is confirmed only when the teacher replies.";
    const link = document.createElement("a");
    link.href = bookingUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "text-link";
    link.textContent = "Open the booking service ↗";
    configNotice.append(document.createElement("br"), link);
  } else if (email && validEmail) {
    configNotice.textContent = "Complete the form to prepare an email draft. You must review and send the email yourself. Your lesson is not confirmed until Teacher Apple replies.";
    const dateInput = form.elements.namedItem("date");
    if (dateInput instanceof HTMLInputElement && dateInput.type === "date") {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
      dateInput.min = localToday;
    }
  } else {
    form.hidden = true;
    configNotice.textContent = email
      ? "Booking is unavailable because the configured contact email is invalid. Please contact the site owner."
      : "Booking is not accepting requests yet. The site owner must configure a real contact email or booking provider before students can enter their details.";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const requiredTextFields = ["name", "timezone", "goals"];
    for (const fieldName of requiredTextFields) {
      const field = form.elements.namedItem(fieldName);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        if (field.value.trim()) continue;
        status.textContent = "Please enter a value for every required field.";
        field.focus();
        return;
      }
    }
    if (validBookingUrl || !validEmail) {
      status.textContent = "No request was sent. Booking is not configured to prepare an email draft.";
      return;
    }

    const values = new FormData(form);
    const subject = "Private Thai lesson request";
    const body = [
      `Name: ${String(values.get("name")).trim()}`,
      `Email: ${String(values.get("email")).trim()}`,
      `Country or timezone: ${String(values.get("timezone")).trim()}`,
      `Thai proficiency level: ${String(values.get("level")).trim()}`,
      `Preferred lesson date: ${String(values.get("date")).trim()}`,
      `Preferred time: ${String(values.get("time")).trim()}`,
      "",
      "Learning goals:",
      String(values.get("goals")).trim()
    ].join("\n");
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const link = document.createElement("a");
    link.href = mailto;
    link.className = "text-link";
    link.textContent = "Open email draft ↗";
    status.replaceChildren(
      document.createTextNode("Your request is ready as an email draft. Open it, review the details, and press Send yourself. No email has been sent by this website. Your lesson is not confirmed until Teacher Apple replies. "),
      link
    );
  });

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
