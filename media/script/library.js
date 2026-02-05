/**
 * Olly Hodgson's site scripts - vanilla JS edition
 * Refactored in February 2026 to remove jQuery dependency
 *
 * Uses modern browser features:
 * - IntersectionObserver for efficient scroll-based transitions
 * - Native DOM methods
 * - ES6+ syntax
 */

(function () {
  "use strict";

  /* ********************
   * Scroll-based transitions using IntersectionObserver
   *
   * Usage:
   * Add class="olly-transition olly-transition-hidden" to elements you want to fade in
   * Add class="olly-transition-group" to their parent element
   *
   * Optionally, add data-timeout="1000" data-timeout-increment="500"
   * to the olly-transition-group element for custom delay timing
   ******************** */

  const defaults = {
    timeout: 0,
    timeoutIncrement: 0,
    itemSelector: ".olly-transition",
    hiddenClass: "olly-transition-hidden",
  };

  function initTransitionGroup(group) {
    const timeout = parseInt(group.dataset.timeout, 10) || defaults.timeout;
    const timeoutIncrement =
      parseInt(group.dataset.timeoutIncrement, 10) || defaults.timeoutIncrement;

    const items = group.querySelectorAll(
      `${defaults.itemSelector}.${defaults.hiddenClass}`
    );

    if (!items.length) return;

    // Track delay for staggered animations within this group
    let currentDelay = timeout;
    const itemDelays = new Map();

    // Use IntersectionObserver for efficient viewport detection
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            // Assign delay if not already assigned
            if (!itemDelays.has(el)) {
              itemDelays.set(el, currentDelay);
              currentDelay += timeoutIncrement;
            }
            const delay = itemDelays.get(el);
            setTimeout(() => {
              el.classList.remove(defaults.hiddenClass);
            }, delay);
            // Stop observing once revealed
            observer.unobserve(el);
          }
        });
      },
      {
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => observer.observe(item));
  }

  function initTransitions() {
    const groups = document.querySelectorAll(".olly-transition-group");
    groups.forEach(initTransitionGroup);
  }

  /* ********************
   * Simple lightbox for image galleries
   * Replaces Featherlight - works with existing HTML structure
   *
   * Usage:
   * Add data-featherlight-gallery to container
   * Add data-featherlight-filter="a.image" to specify gallery links
   * Links should be <a class="image" href="large-image.jpg">
   ******************** */

  let lightbox = null;
  let currentGallery = [];
  let currentIndex = 0;

  function createLightbox() {
    if (lightbox) return lightbox;

    const overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close">&times;</button>
        <button class="lightbox-prev" aria-label="Previous">&lsaquo;</button>
        <button class="lightbox-next" aria-label="Next">&rsaquo;</button>
        <img class="lightbox-image" src="" alt="" />
      </div>
    `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .lightbox-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      .lightbox-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
      }
      .lightbox-image {
        max-width: 90vw;
        max-height: 90vh;
        display: block;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .lightbox-image.loaded {
        opacity: 1;
      }
      .lightbox-close,
      .lightbox-prev,
      .lightbox-next {
        position: fixed;
        background: transparent;
        border: none;
        color: white;
        font-size: 2.5rem;
        cursor: pointer;
        padding: 1rem;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        z-index: 10001;
      }
      .lightbox-close:hover,
      .lightbox-prev:hover,
      .lightbox-next:hover {
        opacity: 1;
      }
      .lightbox-close {
        top: 0.5rem;
        right: 0.5rem;
      }
      .lightbox-prev {
        left: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
      }
      .lightbox-next {
        right: 0.5rem;
        top: 50%;
        transform: translateY(-50%);
      }
      .lightbox-prev[hidden],
      .lightbox-next[hidden] {
        display: none;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Event handlers
    const closeBtn = overlay.querySelector(".lightbox-close");
    const prevBtn = overlay.querySelector(".lightbox-prev");
    const nextBtn = overlay.querySelector(".lightbox-next");
    const img = overlay.querySelector(".lightbox-image");

    closeBtn.addEventListener("click", closeLightbox);
    prevBtn.addEventListener("click", showPrev);
    nextBtn.addEventListener("click", showNext);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    });

    // Touch swipe support for mobile/touch devices
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 50;

    overlay.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    overlay.addEventListener(
      "touchend",
      (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Only trigger if horizontal swipe is greater than vertical (not a scroll)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > SWIPE_THRESHOLD) {
          if (diffX > 0) {
            showPrev();
          } else {
            showNext();
          }
        }
      },
      { passive: true }
    );

    lightbox = { overlay, img, prevBtn, nextBtn };
    return lightbox;
  }

  function openLightbox(gallery, index) {
    const lb = createLightbox();
    currentGallery = gallery;
    currentIndex = index;
    showImage();
    lb.overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  function showImage() {
    if (!lightbox || !currentGallery.length) return;
    const src = currentGallery[currentIndex];
    lightbox.img.classList.remove("loaded");
    lightbox.img.src = src;
    lightbox.img.onload = () => lightbox.img.classList.add("loaded");

    // Show/hide nav buttons
    const isGallery = currentGallery.length > 1;
    lightbox.prevBtn.hidden = !isGallery;
    lightbox.nextBtn.hidden = !isGallery;
  }

  function showPrev() {
    if (currentGallery.length <= 1) return;
    currentIndex =
      (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showImage();
  }

  function showNext() {
    if (currentGallery.length <= 1) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showImage();
  }

  function initGalleries() {
    const galleries = document.querySelectorAll("[data-featherlight-gallery]");

    galleries.forEach((gallery) => {
      const filter = gallery.dataset.featherlightFilter || "a.image";
      const links = gallery.querySelectorAll(filter);
      const srcs = Array.from(links).map((link) => link.href);

      links.forEach((link, index) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          openLightbox(srcs, index);
        });
      });
    });
  }

  /* ********************
   * Initialize everything on DOMContentLoaded
   ******************** */

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    initTransitions();
    initGalleries();
  }
})();
