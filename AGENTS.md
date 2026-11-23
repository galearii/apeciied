# APEC IIED website

Site for the APEC Institute of Innovation & Education Development:
https://www.apeciied.org. Being ported from Wix to Jekyll 4 + Tailwind CSS v4
(vanilla JavaScript where interaction calls for it), deployed by Netlify from
`master`. The codebase starts from the galearii/jekyll-tailwind starter
template; the pages are not ported yet.

Started from galearii/jekyll-tailwind@074e5563a609a6be7fc957a5a6f00db258785865 on 2026-11-23.

The port is being planned as a wayfinder map in this repo's issues (label
`wayfinder:map`).

## Build and run

- `npm run dev` serves the site on http://localhost:4000 (also the
  `.claude/launch.json` entry). It runs `jekyll serve --incremental`, which
  misses `_config.yml` and `_data/` changes: restart it after editing those.
- `npm run build` is what Netlify and CI run; the steps are the `build`
  script in `package.json`. Output goes to `_site/`.
- Edit styles in `src/style.css` and `src/css/site.css`;
  `assets/css/style.css` is their generated output.
- Ruby is pinned in `.ruby-version` (exact) and Node in `.nvmrc` (major
  only), nowhere else. `check:versions` opens every build and dev run and
  fails when the running Ruby or Node doesn't match. Change versions by
  following `UPGRADING.md`.
- Version managers: rbenv and nvm read the two pin files as they are. asdf
  needs `legacy_version_file = yes` in `~/.asdfrc` and
  `ASDF_NODEJS_LEGACY_FILE_DYNAMIC_STRATEGY=latest_installed` in the shell
  environment (so the bare major in `.nvmrc` resolves); install with
  `asdf install ruby <x.y.z>` and `asdf install nodejs latest:<major>`.
  The Claude desktop app's dev server skips shell startup files, so
  `.claude/launch.json` sets that asdf variable itself.
  mise needs `idiomatic_version_file_enable_tools = ["node", "ruby"]`.

## Layout

- One layout, `_layouts/default.html`, with `_includes/` for the header,
  footer, share tags (`social_meta.html`) and analytics.
- A page is a stack of full-width strips (`strip.html`: white, grey, peach
  or photo) that opens with the page-title band (`page_title.html`, which
  holds the page's `<h1>`). Buttons are `button.html`. Text inside a strip
  sits in `.container-site`, running text in `.prose-site`.
- A page's front matter drives its share tags: `title`, `description`,
  `image` (+ `image_alt`, `image_width`, `image_height`), `noindex: true`.
  `_config.yml` `defaults` gives every page the share card as its `image`.
  `sitemap: false` keeps a page out of `sitemap.xml`.
- Header links come from `_data/navigation.yml`; an item with `children` is
  a dropdown. `assets/js/nav.js` opens the dropdown and the phone menu;
  without JavaScript the nav is the full list, so keep it that way.
- URLs are extensionless: Netlify serves `about.html` at `/about`, so links,
  navigation, canonical tags and the sitemap all use `/about`.
- Colours are `@theme` tokens in `src/style.css`: the four roles (`brand`,
  `brand-soft`, `ink`, `paper`) plus copper shades, neutrals, blue and red.
  Style with their classes (`text-brand`, `bg-grey`, ...), never raw hex.
- Images are resized once from the Wix snapshot and committed under
  `assets/images/`; nothing processes images at build time.
- GA4 loads only on production deploys with `google_analytics_id` set; local
  builds and deploy previews never load it.

## Working with the maintainer

- Propose before building; use a branch per feature.
- Commit, merge and push only when asked.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for galearii/apeciied, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
