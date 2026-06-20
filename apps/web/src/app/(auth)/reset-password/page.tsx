import Link from "next/link";
import { ResetForm } from "./_components/reset-form";

export default () => (
  <div className="space-y-6">
    <header className="space-y-1">
      <h1 className="font-semibold text-foreground text-xl">
        Rivendos fjalëkalimin
      </h1>
      <p className="text-foreground-dimmed text-sm">
        Shkruaj email-in dhe do të dërgojmë një lidhje rivendosjeje.
      </p>
    </header>

    <ResetForm />

    <Link
      href="/sign-in"
      className="block text-caption text-sm transition-colors hover:text-foreground"
    >
      Kthehu te hyrja
    </Link>
  </div>
);
