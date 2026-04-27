/**
 * GeometricTexture
 *
 * A full-bleed SVG pattern overlay for the BrandingSidebar.
 * Uses a repeating triangle grid at very low opacity so it reads as a
 * subtle material texture rather than a graphic element.
 *
 * Rendered as a Server Component — no client-side JS required.
 */
export function GeometricTexture() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-[0.07]"
      >
        <defs>
          {/* 60 × 52 px equilateral-triangle grid tile */}
          <pattern
            id="triangle-grid"
            x="0"
            y="0"
            width="60"
            height="52"
            patternUnits="userSpaceOnUse"
          >
            {/* Row 1 — upward-pointing triangles */}
            <polygon
              points="0,52 30,0 60,52"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="0.6"
            />
            {/* Row 1 — downward-pointing triangles (interstitial) */}
            <polygon
              points="0,0 30,52 -30,52"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="0.6"
            />
            <polygon
              points="60,0 90,52 30,52"
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#triangle-grid)" />
      </svg>
    </div>
  );
}
