/*
  The analytics tag (_includes/analytics.html) renders only when
  google_analytics_id is set and the build runs with JEKYLL_ENV=production.
  Each test runs a real `jekyll build` into a temp folder and reads the
  home page it produced.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function buildHomePage({ analyticsId, env }) {
  const dir = mkdtempSync(join(tmpdir(), "analytics-test-"));
  const override = join(dir, "override.yml");
  try {
    writeFileSync(override, `google_analytics_id: ${analyticsId}\n`);
    execFileSync(
      "bundle",
      ["exec", "jekyll", "build", "--quiet", "--disable-disk-cache", "--config", `_config.yml,${override}`, "--destination", join(dir, "site")],
      { env: { ...process.env, JEKYLL_ENV: env }, stdio: ["ignore", "pipe", "pipe"] },
    );
    return readFileSync(join(dir, "site", "index.html"), "utf8");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("a production build with an id loads gtag for that id", () => {
  const html = buildHomePage({ analyticsId: "G-TEST123", env: "production" });
  assert.match(html, /googletagmanager\.com\/gtag\/js\?id=G-TEST123/);
});

test("a development build with an id loads no gtag", () => {
  const html = buildHomePage({ analyticsId: "G-TEST123", env: "development" });
  assert.doesNotMatch(html, /gtag/);
});

test("a production build with no id loads no gtag, whether the id is blank or an empty string", () => {
  // Written into YAML as-is: "" leaves the value blank (nil); '""' is an
  // empty string, which Liquid treats as true.
  for (const analyticsId of ["", '""']) {
    const html = buildHomePage({ analyticsId, env: "production" });
    assert.doesNotMatch(html, /gtag/, `google_analytics_id: ${analyticsId}`);
  }
});
