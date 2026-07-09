// Small stroke-icon set (currentColor). Kept inline so there's no icon-lib dep.

interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const PlusIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const CloseIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const InfoIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={2.2} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="11" x2="12" y2="16" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const EyeIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M1.5 12S5 5.5 12 5.5 22.5 12 22.5 12 19 18.5 12 18.5 1.5 12 1.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOffIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M9.9 5.7A9.6 9.6 0 0 1 12 5.5c7 0 10.5 6.5 10.5 6.5a17 17 0 0 1-3.2 4" />
    <path d="M6.3 7.8A17 17 0 0 0 1.5 12S5 18.5 12 18.5a9.7 9.7 0 0 0 4-.8" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

export const InboxIcon = ({ size = 34, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={1.5} className={className} aria-hidden="true">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export const AlertIcon = ({ size = 34, className }: IconProps) => (
  <svg {...base(size)} strokeWidth={1.5} className={className} aria-hidden="true">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const RetryIcon = ({ size = 15, className }: IconProps) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
