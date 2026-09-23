/* Tawa Express motion system.
   Policy: the Pause-motion button is the ONLY off-switch and it persists.
   prefers-reduced-motion calms (200ms opacity reveals, hero photo still).
   Only transform and opacity animate. Prices, hours, phones and forms stay still. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOff = localStorage.getItem("tawa-motion") === "off";
  var root = document.documentElement;
  root.classList.toggle("motion-off", motionOff);

  var btn = document.getElementById("motionToggle");
  function syncBtn() {
    if (!btn) return;
    btn.textContent = motionOff ? "Resume motion" : "Pause motion";
    btn.setAttribute("aria-pressed", motionOff ? "true" : "false");
    root.classList.toggle("motion-off", motionOff);
  }
  function forceIn() {
    document.querySelectorAll(".sec,.rise").forEach(function (el) { el.classList.add("is-in"); });
  }
  if (btn) {
    syncBtn();
    btn.addEventListener("click", function () {
      motionOff = !motionOff;
      localStorage.setItem("tawa-motion", motionOff ? "off" : "on");
      syncBtn();
      if (motionOff) forceIn();
    });
  }

  var header = document.querySelector("header.site");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 80);
    var bar = document.querySelector(".progress i");
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!("IntersectionObserver" in window) || motionOff) { forceIn(); }

  if ("IntersectionObserver" in window && !motionOff) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.08 });
    document.querySelectorAll(".sec").forEach(function (el) { io.observe(el); });

    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io2.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".rise").forEach(function (el) { io2.observe(el); });
  }

  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var m = el.textContent.trim().match(/^([\d,.]+)(.*)$/);
    if (!m) return;
    var target = parseFloat(m[1].replace(/,/g, ""));
    var suffix = m[2] || "";
    var dec = (m[1].split(".")[1] || "").length;
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / 1200);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (dec ? val.toFixed(dec) : Math.round(val).toLocaleString("en-US")) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = m[1] + suffix;
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && !reduce && !motionOff && "IntersectionObserver" in window) {
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); io3.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io3.observe(el); });
  }
})();
