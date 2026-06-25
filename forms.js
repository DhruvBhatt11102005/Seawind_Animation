/**
 * Seawind Solution — unified form submission (contact, CTA, careers)
 */
(function () {
  const config = window.SEAWIND_FORMS || { endpoint: "api/send-mail.php", fallbackEmail: "info@seawindsolution.com" };

  function getBasePath() {
    const path = window.location.pathname.replace(/\\/g, "/");
    if (/\/(services|blog|portfolio)\//.test(path)) return "../";
    return "";
  }

  function showSuccess(btn) {
    if (!btn) return;
    btn.classList.add("is-success");
    btn.disabled = true;
    setTimeout(() => {
      btn.classList.remove("is-success");
      btn.disabled = false;
    }, 4000);
  }

  function showError(form, message) {
    let el = form.querySelector(".form-status-error");
    if (!el) {
      el = document.createElement("p");
      el.className = "form-status-error";
      form.appendChild(el);
    }
    el.textContent = message;
    el.hidden = false;
  }

  function clearError(form) {
    const el = form.querySelector(".form-status-error");
    if (el) el.hidden = true;
  }

  function buildPayload(form) {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((value, key) => {
      data[key] = String(value).trim();
    });
    if (!data.formType) data.formType = form.dataset.formType || "contact";
    if (!data.website) data.website = "";
    return data;
  }

  function mailtoFallback(data) {
    const subject = encodeURIComponent(`[${data.formType || "Inquiry"}] ${config.companyName || "Seawind"}`);
    const body = encodeURIComponent(
      Object.entries(data)
        .filter(([k]) => k !== "website")
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    );
    window.location.href = `mailto:${config.fallbackEmail}?subject=${subject}&body=${body}`;
  }

  async function sendWeb3Forms(data) {
    const key = config.web3formsKey;
    if (!key) return false;
    const payload = {
      access_key: key,
      subject: `${data.formType || "Contact"} - ${config.companyName || "Seawind Solution"}`,
      from_name: [data.firstName, data.lastName].filter(Boolean).join(" ") || data.name || "Website Visitor",
      email: data.email || "",
      phone: data.phone || "",
      message: data.message || data.projectBrief || data.coverLetter || "",
      form_type: data.formType,
      service: data.service || "",
      job_profile: data.jobProfile || "",
    };
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return res.ok && json.success;
  }

  async function sendPhp(data) {
    const base = getBasePath();
    const url = base + (config.endpoint || "api/send-mail.php").replace(/^\//, "");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Server error");
    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Send failed");
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    if (btn && btn.classList.contains("is-success")) return;

    if (form.website && form.website.value) return;

    clearError(form);
    const data = buildPayload(form);
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
    }

    try {
      let sent = false;
      if (config.web3formsKey) sent = await sendWeb3Forms(data);
      if (!sent) await sendPhp(data);
      form.reset();
      showSuccess(btn);
      const inquiry = document.getElementById("inquiryType");
      if (inquiry) inquiry.value = "Account";
      document.querySelectorAll(".inquiry-tab").forEach((t, i) => t.classList.toggle("active", i === 0));
    } catch (err) {
      console.warn("Form send failed, using mailto fallback:", err);
      try {
        mailtoFallback(data);
        showSuccess(btn);
      } catch {
        showError(form, "Could not send your message. Please email us at " + config.fallbackEmail);
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.removeAttribute("aria-busy");
      }
    }
  }

  document.querySelectorAll("form[data-form-type], #contactForm, #ctaForm, #careerForm").forEach((form) => {
    if (!form.dataset.formType && form.id === "contactForm") form.dataset.formType = "contact";
    if (!form.dataset.formType && form.id === "ctaForm") form.dataset.formType = "cta";
    if (!form.dataset.formType && form.id === "careerForm") form.dataset.formType = "career";

    if (!form.querySelector('input[name="website"]')) {
      const honeypot = document.createElement("input");
      honeypot.type = "text";
      honeypot.name = "website";
      honeypot.tabIndex = -1;
      honeypot.autocomplete = "off";
      honeypot.setAttribute("aria-hidden", "true");
      honeypot.style.cssText = "position:absolute;left:-9999px;opacity:0;height:0;width:0;";
      form.appendChild(honeypot);
    }

    form.addEventListener("submit", handleSubmit);
  });
})();
