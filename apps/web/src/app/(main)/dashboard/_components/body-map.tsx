import type { Route } from "next";
import Link from "next/link";

// The exact model requested:
// https://sketchfab.com/3d-models/human-skeleton-highresolution-model-657a31ed9704423c8c4e752fb2506a74
const MODEL_ID = "657a31ed9704423c8c4e752fb2506a74";
const EMBED = `https://sketchfab.com/models/${MODEL_ID}/embed?autostart=1&autospin=0.2&ui_theme=dark&ui_infos=0&ui_controls=1&ui_stop=0&ui_hint=0&dnt=1`;

const REGIONS = [
  { label: "Kafka", part: "Kokë", color: "#a970ff" },
  { label: "Toraksi", part: "Toraks", color: "#ff5fa8" },
  { label: "Shtylla kurrizore", part: "Shtyllë kurrizore", color: "#38e1ff" },
  { label: "Krahët", part: "Krah", color: "#5b8cff" },
  { label: "Pelvisi", part: "Pelvis", color: "#ffb43b" },
  { label: "Këmbët", part: "Këmbë", color: "#43e08f" },
] as const;

export const BodyMap = () => (
  <section className="flex animate-fade-up flex-col rounded-card border border-accent bg-card/70 p-2 shadow-card">
    <header className="px-3 py-2">
      <h2 className="font-semibold text-foreground">Harta e trupit · 3D</h2>
      <p className="text-caption text-xs">
        Rrotullo skeletin · zgjidh një pjesë për të parë studimet e saj
      </p>
    </header>

    <div className="relative h-[24rem] w-full overflow-hidden rounded-card border border-accent/60 bg-black sm:h-[28rem]">
      <iframe
        title="Skeleti i njeriut — model 3D"
        src={EMBED}
        className="size-full"
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />
    </div>

    <div className="space-y-2 px-3 py-3">
      <p className="text-caption text-xs">Zgjidh një pjesë të trupit:</p>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((region) => (
          <Link
            key={region.part}
            href={
              `/dashboard/worklist?bodyPart=${encodeURIComponent(region.part)}` as Route
            }
            className="flex items-center gap-2 rounded-pill border bg-card/60 px-3 py-1.5 font-medium text-foreground text-sm transition-colors hover:bg-card-hover"
            style={{ borderColor: `${region.color}66` }}
          >
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: region.color,
                boxShadow: `0 0 8px ${region.color}`,
              }}
            />
            {region.label}
          </Link>
        ))}
      </div>
    </div>
  </section>
);
