import { test } from "node:test";
import assert from "node:assert/strict";
import { checkVersions } from "./check-versions.mjs";

const matching = { rubyPin: "4.0.10", nodePin: "26\n", rubyVersion: "4.0.10", nodeVersion: "26.13.1" };

test("matching Ruby and Node versions pass", () => {
  assert.deepEqual(checkVersions(matching), []);
});

test("a Ruby other than the exact pinned version fails, naming both versions", () => {
  const problems = checkVersions({ ...matching, rubyVersion: "4.0.9" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /\.ruby-version/);
  assert.match(problems[0], /4\.0\.10/);
  assert.match(problems[0], /4\.0\.9/);
});

test("any Node release of the pinned major passes", () => {
  assert.deepEqual(checkVersions({ ...matching, nodeVersion: "26.0.0" }), []);
});

test("a Node of another major fails, naming both", () => {
  const problems = checkVersions({ ...matching, nodeVersion: "25.9.0" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /\.nvmrc/);
  assert.match(problems[0], /25\.9\.0/);
  assert.match(problems[0], /\b26\b/);
});

test(".ruby-version with a trailing newline fails as a format problem, not a mismatch", () => {
  const problems = checkVersions({ ...matching, rubyPin: "4.0.10\n" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /\.ruby-version/);
  assert.match(problems[0], /trailing newline/);
});

test(".ruby-version that isn't an exact x.y.z version fails", () => {
  const problems = checkVersions({ ...matching, rubyPin: "4.0", rubyVersion: "4.0.10" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /\.ruby-version/);
  assert.match(problems[0], /x\.y\.z/);
});

test(".nvmrc that isn't a bare major version fails", () => {
  for (const nodePin of ["26.13.1", "lts/*", "v26"]) {
    const problems = checkVersions({ ...matching, nodePin });
    assert.equal(problems.length, 1, nodePin);
    assert.match(problems[0], /\.nvmrc/);
    assert.match(problems[0], /must be a bare major version/);
  }
});

test("a Ruby that can't be run fails, saying so rather than naming a version", () => {
  const problems = checkVersions({ ...matching, rubyVersion: null });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /Ruby can't be run/);
  assert.match(problems[0], /4\.0\.10/);
});
