#!/usr/bin/env node
/**
 * Dev launcher for the chest X-ray model service (services/cxr).
 *
 *   node scripts/cxr.mjs setup   → one-time: create a venv + install deps
 *   node scripts/cxr.mjs         → start the service; skips gracefully if the
 *                                  venv isn't there yet (so the combined
 *                                  `dev:web` never breaks — the web just falls
 *                                  back to template reads).
 */

import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serviceDir = join(root, "services", "cxr");
const isWindows = process.platform === "win32";
const venvPython = join(
  serviceDir,
  ".venv",
  isWindows ? "Scripts" : "bin",
  isWindows ? "python.exe" : "python",
);
const port = process.env["CXR_PORT"] ?? "8000";

const note = (message) => console.log(`\x1b[36m[cxr]\x1b[0m ${message}`);

const findBasePython = () => {
  const candidates = isWindows ? ["py", "python"] : ["python3", "python"];
  for (const candidate of candidates) {
    const args = candidate === "py" ? ["-3", "--version"] : ["--version"];
    const probe = spawnSync(candidate, args, { stdio: "ignore" });
    if (!probe.error && probe.status === 0) return candidate;
  }
  return null;
};

const setup = () => {
  const base = findBasePython();
  if (!base) {
    note("Python 3 not found. Install Python 3, then re-run `bun run cxr:setup`.");
    process.exit(1);
  }
  note("creating virtual env…");
  const venvArgs =
    base === "py" ? ["-3", "-m", "venv", ".venv"] : ["-m", "venv", ".venv"];
  const venv = spawnSync(base, venvArgs, { cwd: serviceDir, stdio: "inherit" });
  if (venv.status !== 0) process.exit(venv.status ?? 1);

  note("installing deps (downloads PyTorch — a few minutes the first time)…");
  const pip = spawnSync(
    venvPython,
    ["-m", "pip", "install", "-r", "requirements.txt"],
    { cwd: serviceDir, stdio: "inherit" },
  );
  if (pip.status !== 0) process.exit(pip.status ?? 1);

  note(
    `done. Add CXR_SERVICE_URL=http://127.0.0.1:${port} to apps/web/.env, then run \`bun run dev:web\`.`,
  );
};

const run = () => {
  if (!existsSync(venvPython)) {
    note(
      "not set up — skipping (web will use template reads). Run `bun run cxr:setup` to enable real X-ray reads.",
    );
    process.exit(0);
  }
  note(`starting on http://127.0.0.1:${port}`);
  const child = spawn(
    venvPython,
    ["-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: serviceDir,
      stdio: "inherit",
      // Force UTF-8 so the first-run weight download's progress bar (Unicode
      // block chars) doesn't crash on Windows' cp1252 console.
      env: { ...process.env, PYTHONUTF8: "1", PYTHONIOENCODING: "utf-8" },
    },
  );
  child.on("exit", (code) => process.exit(code ?? 0));
  const stop = () => child.kill();
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
};

if (process.argv[2] === "setup") setup();
else run();
