# APEC IIED website

Site for the APEC Institute of Innovation & Education Development:
https://www.apeciied.org. Being ported from Wix to Jekyll 4 + Tailwind CSS v4
(vanilla JavaScript where interaction calls for it), deployed by Netlify from
`master`. The codebase structure follows galearii/aplx.

The port is being planned as a wayfinder map in this repo's issues (label
`wayfinder:map`). Nothing is built yet.

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
