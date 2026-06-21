/**
 * Custom medical + navigation glyphs. `@zenncore/icons` has no clinical icons,
 * so these are inline `currentColor` SVGs (size via `className`, default `size-4`).
 * Consistent 24×24 line style across the nav; specialty glyphs tint to the
 * severity color of their appointment badge.
 */

import { cn } from "@zenncore/utils";
import Image from "next/image";
import type { ComponentProps, JSX } from "react";

type IconProps = ComponentProps<"svg">;

const Icon = ({ className, children, ...props }: IconProps): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("size-4", className)}
    aria-hidden
    {...props}
  >
    {children}
  </svg>
);

// --- Actions ------------------------------------------------------------------

export const PlusIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const TrashIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M4 7h16M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M10 11v6M14 11v6M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
  </Icon>
);

export const PharmacyIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <path d="M12 9v6M9 12h6" />
  </Icon>
);

export const SunIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icon>
);

export const MoonIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Icon>
);

export const SearchIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </Icon>
);

// --- Brand mark ---------------------------------------------------------------

export const MediscanMark = ({
  className,
}: {
  className?: string;
}): JSX.Element => (
  <>
    {/* dark shell (and the always-dark sign-in page) */}
    <Image
      src="/logoJunction.png"
      alt="Junction"
      width={64}
      height={64}
      priority
      className={cn(
        "size-8 rounded-md object-contain [.light_&]:hidden",
        className,
      )}
    />
    {/* light shell only */}
    <Image
      src="/logoLight.png"
      alt="Junction"
      width={64}
      height={64}
      className={cn(
        "hidden size-8 rounded-md object-contain [.light_&]:block",
        className,
      )}
    />
  </>
);

// --- Navigation ---------------------------------------------------------------

export const DashboardIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </Icon>
);

export const WorklistIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1.2" className="fill-current" stroke="none" />
    <circle cx="4.5" cy="12" r="1.2" className="fill-current" stroke="none" />
    <circle cx="4.5" cy="18" r="1.2" className="fill-current" stroke="none" />
  </Icon>
);

export const PatientsIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19a5.2 5.2 0 0 0-3-4.7" />
  </Icon>
);

export const StudiesIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M3.5 9h17M9 3.5v17" />
    <circle cx="15" cy="15" r="2" />
  </Icon>
);

export const UploadStudyIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M12 16V5m0 0-3.5 3.5M12 5l3.5 3.5" />
    <path d="M4 14v3.5A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V14" />
  </Icon>
);

export const AdminIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M12 3 4.5 6v5c0 4.4 3 8.3 7.5 10 4.5-1.7 7.5-5.6 7.5-10V6Z" />
    <path d="M9 12.5 11 14.5 15.5 10" />
  </Icon>
);

export const ConsultIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H9l-4 3.5v-3.5H6.5" />
  </Icon>
);

export const HospitalIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M4 20V8l8-4 8 4v12" />
    <path d="M4 20h16M10 20v-4h4v4" />
    <path d="M12 7v3M10.5 8.5h3" />
  </Icon>
);

export const CalendarIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </Icon>
);

export const WhatsappIcon = ({
  className,
}: {
  className?: string;
}): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    className={cn("size-4", className)}
    fill="currentColor"
    aria-hidden
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24Zm-3.6 4.42c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.43 1.03 2.6.13.17 1.77 2.7 4.3 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29-.25-.12-1.48-.73-1.71-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.37-.77-1.87-.2-.48-.41-.42-.56-.43-.14 0-.31-.01-.48-.01Z" />
  </svg>
);

// --- Specialty glyphs (Suggested Appointments) --------------------------------

export const LungsIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M12 3v8" />
    <path d="M12 7c-.5 2-2 2.5-3.5 3C6 11 5 13 5 16a3 3 0 0 0 4 2.8c1-.4 1.5-1.3 1.5-2.6V9" />
    <path d="M12 7c.5 2 2 2.5 3.5 3C18 11 19 13 19 16a3 3 0 0 1-4 2.8c-1-.4-1.5-1.3-1.5-2.6V9" />
  </Icon>
);

export const HeartIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M12 20s-7-4.3-7-9.3A4 4 0 0 1 12 7a4 4 0 0 1 7 3.7C19 15.7 12 20 12 20Z" />
    <path d="M7.5 12h2l1-2 1.5 4 1-2h3.5" />
  </Icon>
);

export const BoneIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M7 17a2 2 0 1 1-1.7-2L14 6.3A2 2 0 1 1 17 5a2 2 0 1 1 1.7 2L10 15.7A2 2 0 1 1 7 17Z" />
  </Icon>
);

export const StethoscopeIcon = (props: IconProps): JSX.Element => (
  <Icon {...props}>
    <path d="M5 4v5a4 4 0 0 0 8 0V4" />
    <path d="M9 13v2a5 5 0 0 0 10 0v-2" />
    <circle cx="19" cy="9" r="2" />
  </Icon>
);

export const SpecialtyIcon = ({
  specialty,
  className,
}: {
  specialty: string;
  className?: string;
}): JSX.Element => {
  switch (true) {
    case /pulmo|mushk|lung|respir/i.test(specialty):
      return <LungsIcon className={className} />;
    case /kardio|cardio|zemr|heart/i.test(specialty):
      return <HeartIcon className={className} />;
    case /ortope|ortho|kock|bone|skelet/i.test(specialty):
      return <BoneIcon className={className} />;
    default:
      return <StethoscopeIcon className={className} />;
  }
};
