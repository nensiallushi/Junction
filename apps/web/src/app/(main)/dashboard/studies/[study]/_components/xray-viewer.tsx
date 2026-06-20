"use client";

import { FileIcon, MinusIcon, PlusIcon } from "@zenncore/icons";
import { cn } from "@zenncore/utils";
import { useState } from "react";
import type * as Study from "@/server/app/study";
import type { Finding } from "@/server/database/schema";
import { useActive } from "./viewer-context";

const OVERLAY: Record<Finding["severity"], { stroke: string; fill: string }> = {
  critical: { stroke: "stroke-error", fill: "fill-error/40" },
  moderate: { stroke: "stroke-warning", fill: "fill-warning/40" },
  normal: { stroke: "stroke-success", fill: "fill-success/35" },
};

const toPoints = (points: [number, number][]) =>
  points.map(([x, y]) => `${x},${y}`).join(" ");

/**
 * Left panel — renders the uploaded study by media type. Images get the contour
 * overlays + zoom and the bi-directional hover sync (DESIGN.md §7.3–§7.4); video,
 * PDF and other documents render directly (overlays apply to images only).
 */
export const XrayViewer = ({
  study,
  findings,
}: {
  study: Study.View;
  findings: Finding[];
}) => {
  const [active, setActive] = useActive();
  const [zoom, setZoom] = useState(1);
  const isImage = study.mediaType === "image";

  const media = (() => {
    switch (study.mediaType) {
      case "video":
        return (
          // biome-ignore lint/a11y/useMediaCaption: clinical upload has no caption track
          <video
            src={study.imageUrl}
            controls
            className="size-full bg-black object-contain"
          />
        );
      case "pdf":
        return (
          <iframe
            src={study.imageUrl}
            title={study.fileName}
            className="size-full bg-white"
          />
        );
      case "other":
        return (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-foreground-dimmed">
            <FileIcon className="size-12" />
            <p className="max-w-[80%] truncate text-sm">{study.fileName}</p>
            <a
              href={study.imageUrl}
              download={study.fileName}
              className="text-link text-sm underline underline-offset-2"
            >
              Shkarko skedarin
            </a>
          </div>
        );
      default:
        return (
          <div
            className="absolute inset-0 origin-center transition-transform duration-300"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* biome-ignore lint/performance/noImgElement: data-URL / SVG media; next/image is unsuitable here */}
            <img
              src={study.imageUrl}
              alt={`${study.bodyPart} — ${study.fileName}`}
              className="size-full object-cover"
            />
            <svg
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full"
              aria-hidden
            >
              {findings.map((finding) => {
                const isActive = active === finding.id;
                const tone = OVERLAY[finding.severity];
                const persistent = finding.severity !== "normal";

                return (
                  // biome-ignore lint/a11y/noStaticElementInteractions: hover mirrors the diagnosis list; not a control
                  <polygon
                    key={finding.id}
                    points={toPoints(finding.geometry.points)}
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeDasharray={isActive ? undefined : "5 3"}
                    onMouseEnter={() => setActive(finding.id)}
                    onMouseLeave={() => setActive(null)}
                    className={cn(
                      "cursor-pointer transition-all duration-200",
                      isActive
                        ? cn(tone.stroke, tone.fill)
                        : persistent
                          ? cn(tone.stroke, "fill-transparent")
                          : "fill-transparent stroke-transparent",
                    )}
                  />
                );
              })}
            </svg>
          </div>
        );
    }
  })();

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card border border-accent bg-black">
        {media}

        {isImage && (
          <div className="absolute right-3 bottom-3 flex flex-col gap-2">
            <button
              type="button"
              aria-label="Zmadho"
              onClick={() => setZoom((current) => Math.min(2.5, current + 0.5))}
              className="flex size-8 items-center justify-center rounded-full border border-accent bg-emphasis/70 text-foreground backdrop-blur-sm transition-colors hover:bg-emphasis"
            >
              <PlusIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Zvogëlo"
              onClick={() => setZoom((current) => Math.max(1, current - 0.5))}
              className="flex size-8 items-center justify-center rounded-full border border-accent bg-emphasis/70 text-foreground backdrop-blur-sm transition-colors hover:bg-emphasis"
            >
              <MinusIcon className="size-4" />
            </button>
          </div>
        )}
      </div>

      {isImage && (
        <p className="text-center text-caption text-xs">
          Kalo kursorin mbi imazh ose përshkrim për të lexuar diagnozën.
        </p>
      )}
    </div>
  );
};
