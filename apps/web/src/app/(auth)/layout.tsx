import Image from "next/image";
import type { PropsWithChildren } from "react";
import { MediscanMark } from "@/components/medical-icons";

export default ({ children }: PropsWithChildren) => (
  <div className="relative flex min-h-screen w-full flex-col bg-[#070b16] text-white">
    {/* ───── full-bleed background ───── */}
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <Image
        src="/login/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* top + bottom darkening so the logo and hero text stay legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b16]/85 via-[#070b16]/20 to-[#070b16]/95" />
      {/* gentle scrim behind the hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 48% at 50% 50%, rgba(7,11,22,0.55), transparent 72%)",
        }}
      />
      {/* edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 95% at 50% 6%, transparent 38%, rgba(7,11,22,0.8) 100%)",
        }}
      />

      {/* blue ambient glow — DESIGN.md §9 */}
      <div className="absolute -top-32 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-[#1a3a8f]/30 blur-[120px]" />
      <div className="absolute -bottom-40 -left-24 size-[34rem] animate-pulse rounded-full bg-[#3B4EE8]/20 blur-[120px] [animation-duration:8s]" />
      <div className="absolute top-1/3 -right-24 size-[30rem] animate-pulse rounded-full bg-[#4B5EF8]/15 blur-[120px] [animation-duration:11s]" />
    </div>

    {/* ───── content ───── */}
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-2.5">
          <MediscanMark className="size-9" />
          <span className="font-semibold text-lg tracking-tight">Mediscan</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center pt-6 pb-12 md:pt-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* left — hero copy, centered so the badge sits over the headline */}
          <div className="text-center">
            <span className="mb-5 inline-flex animate-fade-up items-center gap-2 rounded-pill border border-white/15 bg-white/5 px-4 py-1.5 text-white/75 text-xs backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#4B5EF8]" />
              Imazheri diagnostike e mbështetur nga AI
            </span>

            <h1 className="animate-fade-up font-bold text-4xl tracking-tight [animation-delay:60ms] md:text-6xl md:leading-[1.07]">
              Zgjidhje të shpejta shëndetësore për të gjithë
            </h1>

            <p className="mx-auto mt-5 max-w-md animate-fade-up text-base text-white/65 leading-relaxed [animation-delay:120ms]">
              Diagnostikë e avancuar dhe kujdes i përkushtuar me saktësi — sepse
              në situata kritike, çdo sekondë ka rëndësi.
            </p>
          </div>

          {/* right — sign-in / form */}
          <div className="flex w-full animate-fade-up justify-center [animation-delay:180ms]">
            <div className="flex w-full max-w-sm justify-center">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
