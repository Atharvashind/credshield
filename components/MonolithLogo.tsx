import type { SVGProps } from "react";

/**
 * MonolithLogo
 *
 * An abstract geometric triangle / pyramid mark that serves as the brand
 * icon.  Rendered as an inline SVG so it inherits `currentColor` and scales
 * cleanly at any size.
 */
export function MonolithLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Monolith logo"
      role="img"
      {...props}
    >
      {/* Outer triangle */}
      <polygon
        points="16,2 30,28 2,28"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Inner triangle — creates the layered pyramid depth */}
      <polygon
        points="16,9 25,26 7,26"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Centre vertical axis line */}
      <line
        x1="16"
        y1="9"
        x2="16"
        y2="26"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
