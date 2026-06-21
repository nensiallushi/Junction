"use client";

import dynamic from "next/dynamic";

const BodyMapCanvas = dynamic(() => import("./body-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center text-caption text-sm">
      Po ngarkohet modeli 3D…
    </div>
  ),
});

const LEGEND = [
  { label: "Koka", color: "#a970ff" },
  { label: "Toraksi", color: "#ff5fa8" },
  { label: "Pelvisi", color: "#ffb43b" },
  { label: "Këmbët", color: "#43e08f" },
] as const;

export const BodyMap = () => (
  <section className="flex animate-fade-up flex-col rounded-card border border-accent bg-card/70 p-2 shadow-card">
    <header className="px-3 py-2">
      <h2 className="font-semibold text-foreground">Harta e trupit · 3D</h2>
      <p className="text-caption text-xs">
        Rrotullo me miun · kliko një pjesë për të parë studimet e saj
      </p>
    </header>

    <div
      className="relative h-[24rem] w-full overflow-hidden rounded-card border border-accent/60 sm:h-[30rem]"
      style={{
        background:
          "radial-gradient(ellipse at 50% 38%, #161c38 0%, #080a16 75%)",
      }}
    >
      <BodyMapCanvas />
    </div>

    <div className="flex flex-wrap gap-x-4 gap-y-2 px-3 py-3">
      {LEGEND.map((item) => (
        <span
          key={item.label}
          className="flex items-center gap-2 text-foreground-dimmed text-xs"
        >
          <span
            className="size-2.5 rounded-full"
            style={{
              backgroundColor: item.color,
              boxShadow: `0 0 8px ${item.color}`,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  </section>
);
