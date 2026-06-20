"use client";

import { useAsyncAction } from "@zenncore/utils/hooks";
import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import * as Doctor from "@/server/app/doctor";

const INVITABLE = ["radiologist", "doctor"] as const;

const config = {
  name: field({
    shape: "text",
    validator: z.string().min(2),
    label: "Emri i plotë",
    placeholder: "Dr. Emri Mbiemri",
  }),
  email: field({
    shape: "text",
    validator: z.string().email(),
    label: "Email",
    placeholder: "emri@spitalint.al",
  }),
  role: field({
    shape: "select",
    validator: z.enum(INVITABLE),
    label: "Roli",
    items: { radiologist: "Radiolog", doctor: "Mjek" },
  }),
  specialty: field({
    shape: "text",
    validator: z.string(),
    label: "Specialiteti",
    placeholder: "p.sh. Pulmologji",
  }),
};

export const InviteDoctorForm = () => {
  const router = useRouter();

  const [invite, pending] = useAsyncAction(
    async (data: {
      name: string;
      email: string;
      role: (typeof INVITABLE)[number];
      specialty: string;
    }) => {
      const invitation = await Doctor.invite(data);
      if (invitation.success) router.refresh();
    },
  );

  return (
    <InferredForm config={config} onSubmit={invite} className="space-y-4">
      <Button type="submit" color="primary" disabled={pending}>
        Dërgo ftesën
      </Button>
    </InferredForm>
  );
};
