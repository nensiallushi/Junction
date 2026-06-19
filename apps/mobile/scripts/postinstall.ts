#!/usr/bin/env bun

import { execSync } from "node:child_process";

// Only run during EAS builds
if (process.env.EAS_BUILD) {
  console.log("📦 EAS Build detected - building workspace packages...");

  try {
    execSync("cd ../.. && bun run build:mobile", { stdio: "inherit" });
    console.log("✅ Workspace packages built successfully");
  } catch (error) {
    console.error("❌ Failed to build workspace packages", error);
    process.exit(1);
  }
} else {
  console.log("⏭️  Skipping package build (not in EAS)");
}
