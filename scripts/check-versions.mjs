/*
  Checks that this machine runs the Ruby and Node versions the Site pins,
  and that the pin files are well-formed. First step of `npm run build`
  and `npm run dev` (`npm run check:versions`).

  - .ruby-version: an exact x.y.z with no trailing newline (Netlify's format).
    The running Ruby must match it exactly.
  - .nvmrc: a bare major version. The running Node must be that major.

  Netlify and CI read the pin files themselves, so in practice this guards
  laptops whose version manager ignores the pins.
*/
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// rubyVersion is null when `ruby` can't be run at all.
export function checkVersions({ rubyPin, nodePin, rubyVersion, nodeVersion }) {
  const problems = [];
  if (/\s$/.test(rubyPin)) {
    problems.push(".ruby-version ends in a trailing newline or space; Netlify needs the bare x.y.z version.");
  } else if (!/^\d+\.\d+\.\d+$/.test(rubyPin)) {
    problems.push(`.ruby-version holds "${rubyPin}"; it must be an exact x.y.z version.`);
  } else if (rubyVersion === null) {
    problems.push(`Ruby can't be run, and .ruby-version pins ${rubyPin}.`);
  } else if (rubyVersion !== rubyPin) {
    problems.push(`Ruby is ${rubyVersion}, but .ruby-version pins ${rubyPin}.`);
  }
  const nodeMajor = nodePin.trim();
  if (!/^\d+$/.test(nodeMajor)) {
    problems.push(`.nvmrc holds "${nodeMajor}"; it must be a bare major version, with no minor, patch or "v".`);
  } else if (nodeVersion.split(".")[0] !== nodeMajor) {
    problems.push(`Node is ${nodeVersion}, but .nvmrc pins major ${nodeMajor}.`);
  }
  return problems;
}

function runningRubyVersion() {
  try {
    return execFileSync("ruby", ["-e", "print RUBY_VERSION"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

if (import.meta.main) {
  const rubyPin = readFileSync(".ruby-version", "utf8");
  const nodePin = readFileSync(".nvmrc", "utf8");
  const problems = checkVersions({
    rubyPin,
    nodePin,
    rubyVersion: runningRubyVersion(),
    nodeVersion: process.versions.node,
  });
  if (problems.length > 0) {
    console.error("Version check failed:");
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error(
      `\nInstall Ruby ${rubyPin.trim()} and Node ${nodePin.trim()} with your version manager.` +
        "\nAGENTS.md, under Build and run, has the setup for asdf, mise, rbenv and nvm.",
    );
    process.exit(1);
  }
}
