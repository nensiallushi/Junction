import Link from "next/link";
import { SignInForm } from "./_components/sign-in-form";

export default () => (
  <div className="space-y-6">
    <header className="space-y-1">
      <h1 className="font-semibold text-foreground text-xl">Hyr në llogari</h1>
      <p className="text-foreground-dimmed text-sm">
        Qasje klinike për stafin e regjistruar të spitalit.
      </p>
    </header>

    <SignInForm />

    <div className="flex items-center justify-between text-sm">
      <Link
        href="/reset-password"
        className="text-caption transition-colors hover:text-foreground"
      >
        Harruat fjalëkalimin?
      </Link>
      <span className="text-caption">I ftuar? Kontrolloni email-in.</span>
    </div>
  </div>
);
