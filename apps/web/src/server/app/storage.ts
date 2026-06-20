"use server";

import type { MediaType, Modality } from "@/lib/medical";
import * as Analysis from "@/server/app/analysis";
import * as Study from "@/server/app/study";
import { withAuthentication } from "@/server/utils/context";
import { Environment } from "@/server/utils/environment";

/**
 * Persist an uploaded study and kick the analysis (ROADMAP Part C / Phase 2–3).
 * The file is carried inline as a data URL (UploadThing stub) and stored as the
 * study's media; a real backend swaps the data URL for an object-store key.
 * Returns the new study id so the upload form can redirect into the viewer.
 */
export const register = withAuthentication(
  async (
    _environment,
    _session,
    data: {
      patient: string;
      modality: Modality;
      bodyPart: string;
      imageUrl?: string;
      mediaType?: MediaType;
      fileName?: string;
    },
  ): Promise<{ study: string }> => {
    const creation = await Study.create(Environment.SERVER, {
      patient: data.patient,
      modality: data.modality,
      bodyPart: data.bodyPart,
      imageUrl: data.imageUrl ?? "/sample-xray.svg",
      mediaType: data.mediaType ?? "image",
      fileName: data.fileName ?? "radiografi-toraks.png",
    });
    if (!creation.success) throw new Error(creation.error);

    await Analysis.ingest(Environment.SERVER, { study: creation.data.id });
    return { study: creation.data.id };
  },
  "Storage.register",
);
