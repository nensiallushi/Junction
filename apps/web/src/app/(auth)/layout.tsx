import Image from "next/image";
import type { PropsWithChildren } from "react";
import { MediscanMark } from "@/components/medical-icons";

// Soft oval mask → fades the rectangular photo edges to nothing.
const MASK = "radial-gradient(62% 62% at 50% 48%, #000 38%, transparent 76%)";
// Crush the dark photo background to true black (so screen-blend removes it)
// and pop the neon.
const FX = "contrast(1.45) brightness(1.18) saturate(1.3)";

export default ({ children }: PropsWithChildren) => (
  <div className="relative min-h-screen w-full overflow-hidden">
    {/* ───────────── animated aurora background (full page) ───────────── */}
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, #181d45 0%, #241a52 48%, #2d1f50 100%)",
      }}
    >
      {/* drifting color glows — brighter, lighter palette */}
      <div className="-left-32 absolute top-10 size-[36rem] animate-drift rounded-full bg-violet-500/45 blur-3xl" />
      <div
        className="absolute top-1/2 left-1/4 size-[32rem] animate-drift rounded-full bg-blue-500/40 blur-3xl"
        style={{ animationDelay: "-6s", animationDuration: "26s" }}
      />
      <div
        className="absolute top-12 right-10 size-[34rem] animate-drift rounded-full bg-fuchsia-500/40 blur-3xl"
        style={{ animationDelay: "-12s" }}
      />
      <div
        className="absolute right-1/3 bottom-0 size-[34rem] animate-drift rounded-full bg-cyan-400/35 blur-3xl"
        style={{ animationDelay: "-3s", animationDuration: "30s" }}
      />
      <div
        className="-bottom-20 absolute left-1/4 size-[30rem] animate-drift rounded-full bg-amber-400/25 blur-3xl"
        style={{ animationDelay: "-18s" }}
      />

      {/* floating X-ray motifs — background removed via contrast-crush + screen
          blend, edges dissolved with a soft mask, each drifting on its own clock */}
      <div
        className="absolute top-[6%] right-[-3%] h-[58%] w-[40%] animate-float-slow mix-blend-screen"
        style={{ maskImage: MASK, WebkitMaskImage: MASK }}
      >
        <Image
          src="/login/ribcage.jpg"
          alt=""
          fill
          sizes="42vw"
          className="object-contain"
          style={{ filter: FX, opacity: 0.7 }}
        />
      </div>
      <div
        className="absolute top-[-8%] left-[-7%] h-[48%] w-[40%] animate-float-slow mix-blend-screen"
        style={{
          animationDelay: "-9s",
          animationDuration: "23s",
          maskImage: MASK,
          WebkitMaskImage: MASK,
        }}
      >
        <Image
          src="/login/hand.jpg"
          alt=""
          fill
          sizes="40vw"
          className="object-contain"
          style={{ filter: FX, opacity: 0.62 }}
        />
      </div>
      <div
        className="absolute bottom-[-10%] right-[16%] h-[50%] w-[34%] animate-float-slow mix-blend-screen"
        style={{
          animationDelay: "-15s",
          animationDuration: "27s",
          maskImage: MASK,
          WebkitMaskImage: MASK,
        }}
      >
        <Image
          src="/login/hero.jpg"
          alt=""
          fill
          sizes="34vw"
          className="object-contain"
          style={{ filter: FX, opacity: 0.6 }}
        />
      </div>

      {/* soft veil to settle contrast */}
      <div className="absolute inset-0 bg-[#10112e]/30" />
    </div>

    {/* ───────────── content ───────────── */}
    <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* brand + headline (desktop) */}
      <div className="hidden min-h-screen flex-col justify-between p-10 lg:flex xl:p-14">
        <div className="flex items-center gap-2">
          <MediscanMark className="size-8" />
          <span className="font-semibold text-lg text-white">Mediscan</span>
        </div>

        <div className="max-w-xl animate-fade-up">
          <p className="mb-4 font-medium text-white/65 text-xs uppercase tracking-[0.25em]">
            Spitali Nënë Tereza
          </p>
          <h1 className="bg-gradient-to-br from-white via-violet-100 to-cyan-200 bg-clip-text font-semibold text-5xl text-transparent leading-[1.05] xl:text-6xl">
            Zgjidhje të shpejta shëndetësore për të gjithë
          </h1>
          <p className="mt-6 max-w-md text-sm text-white/70 leading-relaxed">
            Imazheri diagnostike me AI — lexime të asistuara, listë e renditur
            sipas urgjencës dhe bashkëpunim mes mjekëve, me përkushtim në çdo
            sekondë që ka rëndësi.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-2 text-white/55 text-xs">
          <span>(Mjekë ekspertë)</span>
          <span>(Diagnostikë e shpejtë)</span>
          <span>(Ekspertizë e besueshme)</span>
        </div>
      </div>

      {/* glass form card */}
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <MediscanMark className="size-8" />
            <span className="font-semibold text-lg text-white">Mediscan</span>
          </div>
          <div className="rounded-3xl border border-white/15 bg-background/50 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
);
