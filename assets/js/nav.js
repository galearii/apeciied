/*
  Header nav (_includes/header.html): the phone menu and the desktop
  dropdowns. The CSS shows or hides them from the `js` class, the menu's
  `is-open` class and each button's aria-expanded (src/css/site.css).
  Without this script the nav is the full list.
*/
(function () {
  "use strict";

  var desktop = window.matchMedia("(min-width: 48rem)");

  // Desktop dropdowns: click, Enter or Space toggles; Escape, an outside
  // click or tabbing out closes; hovering opens and leaving closes.
  document.querySelectorAll("[data-nav-group]").forEach(function (group) {
    var button = group.querySelector("button");
    var openedByHover = false;

    function setOpen(open) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) openedByHover = false;
    }
    function isOpen() {
      return button.getAttribute("aria-expanded") === "true";
    }

    button.addEventListener("click", function () {
      // A click right after hover opened the list keeps it open.
      if (openedByHover) {
        openedByHover = false;
        return;
      }
      setOpen(!isOpen());
    });
    group.addEventListener("mouseenter", function () {
      if (!desktop.matches || isOpen()) return;
      setOpen(true);
      openedByHover = true;
    });
    group.addEventListener("mouseleave", function () {
      if (desktop.matches) setOpen(false);
    });
    group.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false);
        button.focus();
      }
    });
    group.addEventListener("focusout", function (event) {
      if (!group.contains(event.relatedTarget)) setOpen(false);
    });
    document.addEventListener("click", function (event) {
      if (!group.contains(event.target)) setOpen(false);
    });
  });

  // Phone menu: the menu button opens and closes the nav; Escape closes it.
  var toggle = document.querySelector("[data-menu-toggle]");
  if (!toggle) return;
  var nav = document.getElementById(toggle.getAttribute("aria-controls"));

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true" && !desktop.matches) {
      setMenu(false);
      toggle.focus();
    }
  });
})();
