/**
 * PyramidHero
 *
 * The centrepiece of the dark column.  Renders an SVG pyramid with layered
 * depth lines and a CSS radial glow beneath it to simulate the 3-D asset
 * aesthetic from the design brief.
 *
 * The pyramid floats on a subtle animation loop.  The glow pulses
 * independently to create a sense of depth without being distracting.
 */
export function PyramidHero() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* ------------------------------------------------------------------ */}
      {/* Radial glow — rendered behind the pyramid                          */}
      {/* ------------------------------------------------------------------ */}
      <div
        aria-hidden="true"
        className="
          absolute bottom-0 left-1/2 -translate-x-1/2
          w-[480px] h-[200px]
          bg-radial-glow
          animate-pulse-glow
          pointer-events-none
        "
      />

      {/* ------------------------------------------------------------------ */}
      {/* Secondary, tighter glow ring                                        */}
      {/* ------------------------------------------------------------------ */}
      <div
        aria-hidden="true"
        className="
          absolute bottom-4 left-1/2 -translate-x-1/2
          w-[280px] h-[80px]
          bg-radial-glow-sm
          blur-xl
          pointer-events-none
        "
      />

      {/* ------------------------------------------------------------------ */}
      {/* Pyramid SVG                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10 animate-float w-[220px] md:w-[320px]">
        <svg
          viewBox="0 0 320 280"
          width="100%"
          height="auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Monolith pyramid — institutional treasury vault"
          role="img"
        >
          <defs>
            {/* Face gradients to simulate lighting */}
            <linearGradient
              id="face-left"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#D3CBBE" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#D3CBBE" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient
              id="face-right"
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#D3CBBE" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#D3CBBE" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="face-front" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#D3CBBE" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#D3CBBE" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="base-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D3CBBE" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#D3CBBE" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#D3CBBE" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Apex point: (160, 20) */}
          {/* Base corners: left (40, 240), right (280, 240) */}
          {/* Back-left base: (100, 200), Back-right base: (220, 200) */}

          {/* Left face */}
          <polygon
            points="160,20 40,240 130,240"
            fill="url(#face-left)"
            stroke="#D3CBBE"
            strokeWidth="0.5"
            strokeOpacity="0.4"
          />

          {/* Right face */}
          <polygon
            points="160,20 280,240 190,240"
            fill="url(#face-right)"
            stroke="#D3CBBE"
            strokeWidth="0.5"
            strokeOpacity="0.25"
          />

          {/* Front face (centre) */}
          <polygon
            points="160,20 130,240 190,240"
            fill="url(#face-front)"
            stroke="#D3CBBE"
            strokeWidth="0.5"
            strokeOpacity="0.5"
          />

          {/* Depth lines — horizontal cross-sections */}
          {[60, 100, 140, 180].map((y) => {
            const progress = (y - 20) / (240 - 20);
            const halfWidth = progress * 120;
            const x1 = 160 - halfWidth;
            const x2 = 160 + halfWidth;
            return (
              <line
                key={y}
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="#D3CBBE"
                strokeWidth="0.4"
                strokeOpacity="0.2"
              />
            );
          })}

          {/* Base line */}
          <line
            x1="40"
            y1="240"
            x2="280"
            y2="240"
            stroke="url(#base-grad)"
            strokeWidth="1"
          />

          {/* Apex dot */}
          <circle cx="160" cy="20" r="2" fill="#D3CBBE" fillOpacity="0.6" />
        </svg>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Tagline beneath the pyramid                                         */}
      {/* ------------------------------------------------------------------ */}
      <p
        className="
          relative z-10 mt-6
          font-sans text-xs tracking-[0.25em] uppercase
          text-stone-600
        "
      >
        Treasury · Yield · Clarity
      </p>
    </div>
  );
}
