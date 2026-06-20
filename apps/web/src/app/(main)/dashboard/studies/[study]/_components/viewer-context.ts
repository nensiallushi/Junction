"use client";

import { createContext } from "@zenncore/utils/hooks";

/**
 * Shared hover state for the split-panel viewer — the `finding.id` currently
 * highlighted. Both panels read and write it, so hovering a diagnosis row lights
 * the matching overlay and vice-versa, with no server round-trip (DESIGN.md §7.4).
 */
export type ActiveState = [
  active: string | null,
  setActive: (id: string | null) => void,
];

export const [ActiveContext, useActive] = createContext<ActiveState>({
  name: "ViewerActive",
});
