import type { NextConfig } from "next";

export default {
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    // uploaded media is carried inline (data URL) to the Storage.register action.
    serverActions: { bodySizeLimit: "16mb" },
  },
} satisfies NextConfig;
