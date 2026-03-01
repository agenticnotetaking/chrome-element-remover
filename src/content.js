(function () {
  // Prevent double-injection
  if (window.__elementRemoverActive) return;
  window.__elementRemoverActive = true;

  const undoStack = []; // { element, parent, nextSibling }
  let hoveredEl = null;

  // --- Banner ---
  const banner = document.createElement("div");
  banner.className = "element-remover-banner";
  banner.innerHTML =
    "🧹 <b>Element Remover</b> &nbsp;—&nbsp; " +
    "<kbd>Click</kbd> remove &nbsp; " +
    "<kbd>Ctrl+Z</kbd> undo &nbsp; " +
    "<kbd>Esc</kbd> exit";
  document.body.appendChild(banner);

  // --- Activate crosshair ---
  document.documentElement.classList.add("element-remover-active");

  // --- Helpers ---
  function isOwnUI(el) {
    return el === banner || banner.contains(el) || el.classList.contains("element-remover-banner");
  }

  function clearHighlight() {
    if (hoveredEl) {
      hoveredEl.classList.remove("element-remover-target");
      hoveredEl = null;
    }
  }

  // --- Event handlers ---
  function onMouseOver(e) {
    const el = e.target;
    if (isOwnUI(el) || el === document.documentElement || el === document.body) return;
    clearHighlight();
    hoveredEl = el;
    hoveredEl.classList.add("element-remover-target");
  }

  function onMouseOut(e) {
    if (e.target === hoveredEl) {
      clearHighlight();
    }
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const el = e.target;
    if (isOwnUI(el) || el === document.documentElement || el === document.body) return;

    clearHighlight();

    // Save undo info
    undoStack.push({
      element: el,
      parent: el.parentNode,
      nextSibling: el.nextSibling,
    });

    // Animate then remove
    el.classList.add("element-remover-poof");
    el.addEventListener(
      "animationend",
      () => {
        if (el.parentNode) el.parentNode.removeChild(el);
      },
      { once: true }
    );
  }

  function onKeyDown(e) {
    // Ctrl+Z / Cmd+Z → undo
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      e.preventDefault();
      e.stopPropagation();
      const entry = undoStack.pop();
      if (entry) {
        entry.element.classList.remove("element-remover-poof");
        // Restore to original position
        if (entry.nextSibling && entry.nextSibling.parentNode === entry.parent) {
          entry.parent.insertBefore(entry.element, entry.nextSibling);
        } else {
          entry.parent.appendChild(entry.element);
        }
      }
      return;
    }

    // Escape → deactivate
    if (e.key === "Escape") {
      deactivate();
    }
  }

  // --- Deactivate ---
  function deactivate() {
    clearHighlight();
    document.documentElement.classList.remove("element-remover-active");
    document.removeEventListener("mouseover", onMouseOver, true);
    document.removeEventListener("mouseout", onMouseOut, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    if (banner.parentNode) banner.parentNode.removeChild(banner);
    window.__elementRemoverActive = false;
  }

  // --- Bind ---
  document.addEventListener("mouseover", onMouseOver, true);
  document.addEventListener("mouseout", onMouseOut, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown, true);
})();
