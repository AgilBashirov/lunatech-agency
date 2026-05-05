import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

const iconClass = "h-6 w-6 text-cyan-300/90";

const stroke = 1.45;

export function IconWeb({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(iconClass, className)}
      aria-hidden
      {...props}
    >
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="M2.5 8.5h19" />
      <circle cx="5.5" cy="6.75" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="8" cy="6.75" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="6.75" r="0.85" fill="currentColor" stroke="none" />
      <path d="M6 12.5h11M6 15.5h8M6 18.5h10" />
    </svg>
  );
}

export function IconDesign({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(iconClass, className)}
      aria-hidden
      {...props}
    >
      <rect x="3" y="3.5" width="11.5" height="9.5" rx="1.5" />
      <rect x="9.5" y="11" width="11.5" height="9.5" rx="1.5" />
      <path d="M6 7h5.5M6 9.5h4" />
      <path d="M13 14.5h6M13 17h5" />
    </svg>
  );
}

export function IconBranding({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(iconClass, className)}
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMotion({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(iconClass, className)}
      aria-hidden
      {...props}
    >
      <path
        d="M12.5 2L4.5 13.5H10l-1.5 8.5L19.5 9h-6.2L12.5 2z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function IconGovernment({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(iconClass, className)}
      aria-hidden
      {...props}
    >
      {/* Classical pillared building — pediment, four columns, base, steps. */}
      <path d="M3.5 8.25L12 3.5l8.5 4.75" />
      <path d="M4.5 8.25h15" />
      <path d="M6.5 10.5v7M10 10.5v7M14 10.5v7M17.5 10.5v7" />
      <path d="M3.5 17.5h17" />
      <path d="M2.75 20.25h18.5" />
    </svg>
  );
}
