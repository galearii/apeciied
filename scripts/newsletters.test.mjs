/*
  The Newsletters page and the old Wix PDF redirects. One real `jekyll build`
  into a temp folder; the tests read what it produced.
*/
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let dir;
let site;
before(() => {
  dir = mkdtempSync(join(tmpdir(), "newsletters-test-"));
  site = join(dir, "site");
  execFileSync(
    "bundle",
    ["exec", "jekyll", "build", "--quiet", "--disable-disk-cache", "--destination", site],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
});
after(() => rmSync(dir, { recursive: true, force: true }));

const page = () => readFileSync(join(site, "newsletters.html"), "utf8");

test("_redirects is published with 14 301s from Wix PDF paths to PDFs in the build", () => {
  const lines = readFileSync(join(site, "_redirects"), "utf8").trim().split("\n");
  assert.equal(lines.length, 14);
  for (const line of lines) {
    const [from, to, code] = line.split(/\s+/);
    assert.match(from, /^\/_files\/ugd\/7c0f6d_[0-9a-f]{32}\.pdf$/);
    assert.match(to, /^\/assets\/newsletters\/APEC-IIED-Newsletter-\d\d\.pdf$/);
    assert.equal(code, "301");
    assert.ok(existsSync(join(site, to)), `${to} is in the build`);
  }
  assert.equal(new Set(lines.map((l) => l.split(/\s+/)[1])).size, 14, "each PDF once");
});

test("the page features issue 14, then lists 13 down to 1", () => {
  const headings = [...page().matchAll(/<h[23][^>]*>Newsletter (\d+)<\/h[23]>/g)].map((m) => Number(m[1]));
  assert.deepEqual(headings, [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  assert.match(page(), /Latest issue/);
});

test("each download link reads Download (PDF, n MB) with the PDF's rounded size", () => {
  const links = [...page().matchAll(/<a href="([^"]+\.pdf)"[^>]*>([^<]*)<\/a>/g)];
  assert.equal(links.length, 14);
  for (const [, href, text] of links) {
    const mb = Math.round(statSync(join(site, href)).size / 1e6);
    assert.equal(text, `Download (PDF, ${mb} MB)`, href);
  }
});

test("the page is indexable and nothing links to Wix", () => {
  assert.doesNotMatch(page(), /noindex/);
  assert.doesNotMatch(page(), /wixstatic\.com|parastorage\.com|\/_files\//);
  assert.match(readFileSync(join(site, "sitemap.xml"), "utf8"), /\/newsletters<\/loc>/);
});
