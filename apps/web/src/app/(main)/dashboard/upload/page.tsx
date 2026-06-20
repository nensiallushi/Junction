import { unwrapResult } from "@zenncore/utils";
import * as Patient from "@/server/app/patient";
import { Environment } from "@/server/utils/environment";
import { UploadForm } from "./_components/upload-form";

export default async () => {
  const patients = await unwrapResult(Patient.paginate(Environment.SERVER, {}));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
      <header className="space-y-1">
        <h1 className="font-semibold text-2xl text-foreground">Studim i ri</h1>
        <p className="text-foreground-dimmed text-sm">
          Ngarko një studim dhe lidhe me një pacient. AI e lexon gjatë ngarkimit
          dhe rendit urgjencën.
        </p>
      </header>

      <UploadForm patients={patients.rows} />
    </div>
  );
};
