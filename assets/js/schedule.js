/*
  Project Schedule (project-schedule.html): outlines the visitor's current
  month and tags it "This month", but only when the visitor's year is the
  Schedule's year. The outline comes from aria-current="date" on the month
  card. Without this script, or in another year, no month is highlighted.
*/
(function () {
  "use strict";

  var grid = document.querySelector("[data-schedule-year]");
  if (!grid) return;

  var now = new Date();
  if (now.getFullYear() !== Number(grid.getAttribute("data-schedule-year"))) return;

  var card = grid.querySelector('[data-month="' + (now.getMonth() + 1) + '"]');
  if (!card) return;

  card.setAttribute("aria-current", "date");
  var tag = document.createElement("span");
  tag.className = "rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-deep";
  tag.textContent = "This month";
  card.querySelector("h2").appendChild(tag);
})();
