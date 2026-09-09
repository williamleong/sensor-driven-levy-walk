function copyBibTeX() {
  const code = document.getElementById("bibtex-code");
  const button = document.querySelector(".copy-bibtex-btn");
  if (!code || !button) return;

  const copyText = button.querySelector(".copy-text");
  const copyStatus = button.querySelector(".copy-status");
  const setCopyFeedback = (state, label, announcement) => {
    button.dataset.state = state;
    if (copyText) copyText.textContent = label;
    if (copyStatus) copyStatus.textContent = announcement;
  };
  const resetCopyFeedback = () => {
    window.setTimeout(() => {
      setCopyFeedback("idle", "Copy", "");
    }, 2000);
  };
  const finish = () => {
    setCopyFeedback("copied", "Copied", "BibTeX copied to clipboard.");
    resetCopyFeedback();
  };
  const fail = () => {
    setCopyFeedback(
      "error",
      "Copy failed",
      "Could not copy BibTeX. Select and copy it manually.",
    );
    resetCopyFeedback();
  };
  const copyWithTextareaFallback = () => {
    const area = document.createElement("textarea");
    let copied = false;
    try {
      area.value = code.textContent;
      document.body.appendChild(area);
      area.select();
      copied = document.execCommand("copy") === true;
    } catch {
      copied = false;
    } finally {
      area.remove();
    }
    (copied ? finish : fail)();
  };
  const writeText = navigator.clipboard?.writeText;

  if (typeof writeText !== "function") {
    copyWithTextareaFallback();
    return;
  }

  try {
    writeText.call(navigator.clipboard, code.textContent)
      .then(finish)
      .catch(copyWithTextareaFallback);
  } catch {
    copyWithTextareaFallback();
  }
}

function scrollToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

function initializeSocialCaptureMode() {
  if (new URLSearchParams(window.location.search).has("social-capture")) {
    document.documentElement.dataset.socialCapture = "true";
  }
}

function initializeArenaGridPlayback() {
  const grid = document.getElementById("arena-grid");
  const reduceMotion = typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!grid || reduceMotion || typeof window.IntersectionObserver !== "function") return;

  const videos = Array.from(grid.querySelectorAll?.("video") || []);
  if (!videos.length) return;

  const playAll = () => {
    for (const video of videos) {
      if (typeof video.play === "function") video.play()?.catch?.(() => {});
    }
  };
  const pauseAll = () => {
    for (const video of videos) {
      if (typeof video.pause === "function") video.pause();
    }
  };
  const observer = new window.IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === grid) (entry.isIntersecting ? playAll : pauseAll)();
    }
  }, { threshold: 0.25 });
  observer.observe(grid);
}

document.addEventListener("DOMContentLoaded", () => {
  initializeSocialCaptureMode();
  initializeArenaGridPlayback();
  const copyButton = document.querySelector(".copy-bibtex-btn");
  const scrollButton = document.querySelector(".scroll-to-top");
  copyButton?.addEventListener("click", copyBibTeX);
  scrollButton?.addEventListener("click", scrollToTop);
  window.addEventListener("scroll", () => {
    scrollButton?.classList.toggle("visible", window.scrollY > 300);
  }, { passive: true });
});
