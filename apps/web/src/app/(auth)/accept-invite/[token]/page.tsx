import { Button } from "@zenncore/web/components/button";
import Link from "next/link";

export default async ({ params }: { params: Promise<{ token: string }> }) => {
  await params;

  return (
    <div className="w-full max-w-sm space-y-6 rounded-3xl border border-white/12 bg-black/50 p-6 text-left shadow-2xl backdrop-blur-xl sm:p-8">
      <header className="space-y-1">
        <h1 className="font-semibold text-foreground text-xl">Je ftuar</h1>
        <p className="text-foreground-dimmed text-sm">
          Prano ftesën për t'u bashkuar me spitalin tënd në Mediscan. Llogaria
          jote është paralidhur me organizatën dhe rolin që caktoi
          administratori.
        </p>
      </header>

      <Button color="primary" render={<Link href="/sign-in" />}>
        Prano &amp; vazhdo
      </Button>
    </div>
  );
};
