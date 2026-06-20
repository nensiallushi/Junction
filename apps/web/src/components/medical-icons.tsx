/**
 * Custom medical + navigation glyphs. `@zenncore/icons` has no clinical icons,
 * so these are inline `currentColor` SVGs (size via `className`, default `size-4`).
 * Consistent 24×24 line style across the nav; specialty glyphs tint to the
 * severity color of their appointment badge.
 */

import { cn } from "@zenncore/utils";
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

// --- Brand mark ---------------------------------------------------------------

export const MediscanMark = ({
  className,
}: {
  className?: string;
}): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    className={cn("size-8", className)}
    aria-hidden
    fill="none"
  >
    <rect
      x="1.5"
      y="1.5"
      width="21"
      height="21"
      rx="6"
      className="fill-primary"
    />
    <path
      d="M5 13h2.5l1.5-5 3 9 2-7 1.5 3H19"
      stroke="white"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
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
