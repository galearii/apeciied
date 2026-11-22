# Snapshot of the Wix site www.apeciied.org (2026-11-23)

Raw source for the port map (issue 1), ticket issue 3. Never merged: it lives
only under the tag `wix-snapshot-2026-11-23`.

## What's here

- `pages/<page>.md`: the text of each of the 9 published pages (the sitemap's
  list), plus `_header.md` and `_footer.md`, in DOM order. Markers:
  - `[button: label](href)` is a Wix button or linked image; `(no label)` is a
    clickable image or icon.
  - `![alt](../images/<file>)` is an image at that position.
  - `Page background:` is the page's full-page background image.
  - `[tab: name]` is a tab of the Organization Tabs widget; both tab panels'
    content follows.
  - `[youtube: title](url)` is an embedded YouTube video.
  - `[iframe: Google Maps]` on Contact is Wix's Maps widget. Its pin isn't in
    the page source; the address text above it is the location.
  - Grid pages (Newsletters, 2026 Project Schedule) are in Wix's column order,
    not reading order: Newsletter 14, 11, 8, 5, … and January, April, July,
    October, February, …. The issue numbers and month headings make the order
    unambiguous.
- `images/`: every image the pages use, downloaded as the original upload from
  `static.wixstatic.com/media/<id>` (full resolution; `~` in Wix ids is `-`
  here). `logo.svg` is the header logo, an inline SVG coloured by Wix's CSS.
  The favicon is `7c0f6d_8edcc8e14e23467096ebe5ecc96d50f2-mv2.jpg`, the share
  image (og:image) `7c0f6d_b1f361ec782a41b0aca64e8fa46ac5e6-mv2.jpg`.
- `files/`: the 14 newsletter PDFs, named by their Wix id. Wix served them at
  `https://www.apeciied.org/_files/ugd/<file>`; `pages/newsletters.md` shows
  which issue each belongs to.
- `manifest.json`: per page title, description, URL and og:image; every image
  with alt text and the pages using it; the PDFs; the YouTube ids; every link
  with the pages it appears on.
- `raw/rendered/`: each page's DOM after Chrome ran its JavaScript
  (`--headless --dump-dom`), which `pages/` was extracted from. The Google
  Maps API key Wix's map widget carries in its URL is replaced with
  `REDACTED-WIX-GOOGLE-MAPS-KEY` in `contact.html`.
- `raw/server/`: each page's HTML as the server sent it, and the sitemaps.
- `tools/extract.py`: the script that made `pages/` and `manifest.json` from
  `raw/rendered/` (`python3 -I extract.py raw/rendered <out>`). `logo.svg`
  and the YouTube ids were added by hand.

## URLs the Wix site serves

The 9 pages: `/`, `/about`, `/organization`, `/apec-hrdwg-ednet`,
`/newsletters`, `/project-schedule`, `/apec-events`, `/apec-event-highlights`,
`/contact`; and the 14 PDFs under `/_files/ugd/`. Nothing else is in the
sitemap.
