# Upgrading the Stack

How this Site keeps Ruby, Jekyll, Node, Tailwind and Netlify's build image
current. Written for an agent: each kind of upgrade is a short list of
commands, and the steps marked **You** are the maintainer's. Every upgrade
lands as a pull request.

## Before a runtime or major upgrade

Read the latest version of this file in the starter template first. The
template does each yearly bump before its Sites and records what went wrong
under [Notes from past upgrades](#notes-from-past-upgrades):

```sh
gh api repos/galearii/jekyll-tailwind/contents/UPGRADING.md -H "Accept: application/vnd.github.raw"
```

## Dependabot pull requests

Dependabot (`.github/dependabot.yml`) opens, once a month, one grouped pull
request each for npm, bundler and GitHub Actions minor and patch updates, a
pull request of its own for each major, and one for `tailwindcss` with
`@tailwindcss/*`, which always move together. Security updates arrive as
soon as they are published.

1. Wait for CI to pass on the pull request.
2. **You:** open the Netlify deploy preview next to production and look over
   the pages. CI proves the site builds, not that it still looks right.
3. **You:** merge, or ask an agent to.

A major for Jekyll or Tailwind follows [Jekyll and Tailwind
majors](#jekyll-and-tailwind-majors) instead.

## Yearly runtime bump (January)

Dependabot can't change `.ruby-version` or `.nvmrc`, so they move once a
year, in January, one pull request per runtime.

### Node

Move to the newest LTS line. From Node 27 on, one new line becomes LTS
each October, so each January bump moves up one major.

1. Branch, and set `.nvmrc` to the new major, e.g. `28`.
2. `asdf install nodejs latest:<major>` (or your version manager's
   equivalent), then `npm run check:versions`. Done when it passes.
3. `npm install`, to refresh `package-lock.json` under the new npm.
4. `npm run build`.
5. Push, open the pull request, and follow steps 1–3 of [Dependabot pull
   requests](#dependabot-pull-requests).

### Ruby

Move to the newest Ruby line whose native gems install. If they don't yet,
move to the latest patch of the line you're on instead.

1. Branch, and set `.ruby-version` to the new version (exact `x.y.z`, no
   trailing newline).
2. `asdf install ruby <x.y.z>` (or your version manager's equivalent), then
   `npm run check:versions`. Done when it passes.
3. **Native gems:** `bundle install`. Gems with C extensions
   (`eventmachine`, `google-protobuf`, `sass-embedded`) fail here when they
   don't support the new Ruby yet. If one fails, start again from step 1
   with the latest patch of the line you're on.
4. Commit `.ruby-version` with the updated `Gemfile.lock`. After a Ruby
   major, `BUNDLED WITH` at the end of the lock shows the new Bundler
   major.
5. `npm run build`.
6. Push, open the pull request, and follow steps 1–3 of [Dependabot pull
   requests](#dependabot-pull-requests).

The Gemfile names no Ruby version: CI and Netlify read `.ruby-version`
themselves, and a `ruby` line in the Gemfile makes Dependabot's bundler
updates fail whenever its own list of Ruby versions lags.

### Netlify build image

Rare, when Netlify announces a new image.

1. **You:** in the Netlify UI, Project configuration → Build & deploy → Build
   image selection, choose the new image.
2. **You:** trigger a production deploy. Done when it succeeds and the site
   looks as before; if it fails, switch back to the previous image.

## Jekyll and Tailwind majors

1. Read the project's upgrade guide for the new major.
2. For Tailwind, run `npx @tailwindcss/upgrade` on the pull request's branch
   and review its changes.
3. `npm run build`, then push.
4. **You:** compare the deploy preview with production for every layout and
   kind of page the Site uses, not just the home page.
5. **You:** merge.

## Notes from past upgrades

Newest first. The template adds a note whenever an upgrade needs more than
the steps above.

- **2026-11, Ruby 4.1:** blocked. `eventmachine` 1.2.7, which Jekyll needs
  for `jekyll serve --livereload`, doesn't compile on Ruby 4.1, and
  `google-protobuf` has no prebuilt 4.1 gems. Stay on 4.0 until
  `eventmachine` ships a release with the fix.
