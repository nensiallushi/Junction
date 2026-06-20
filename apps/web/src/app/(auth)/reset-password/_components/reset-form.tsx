"use client";

import { Button } from "@zenncore/web/components/button";
import { field, InferredForm } from "@zenncore/web/components/inferred-form";
import { useState } from "react";
import { z } from "zod";

const config = {
  email: field({
    shape: "text",
    validator: z.string().email(),
    label: "Email",
    placeholder: "ju@spitalint.al",
  }),
};

export const ResetForm = () => {
  const [sent, setSent] = useState(false);

  if (sent)
    return (
      <p className="rounded-card border border-accent bg-card/60 p-4 text-foreground-dimmed text-sm">
        Nëse ekziston një llogari për këtë email, kemi dërguar një lidhje
        rivendosjeje.
      </p>
    );

  return (
    <InferredForm
      config={config}
      onSubmit={() => setSent(true)}
      className="space-y-4"
    >
      <Button type="submit" color="primary">
        Dërgo lidhjen
      </Button>
    </InferredForm>
  );
};
