import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // -----------------------------------------------------------------------
      // Brand colour palette
      // -----------------------------------------------------------------------
      colors: {
        // Sidebar / brand surface
        beige: {
          DEFAULT: "#D3CBBE",
          light: "#E2DDD4",
          dark: "#B8B0A2",
        },
        // Primary dark surface
        obsidian: {
          DEFAULT: "#000000",
          soft: "#0A0A0A",
          muted: "#111111",
        },
        // Neutral text tones
        stone: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
        },
        // Accent — used sparingly for interactive states
        accent: {
          DEFAULT: "#C8BFB0",
          hover: "#B5AA99",
        },
      },

      // -----------------------------------------------------------------------
      // Typography
      // -----------------------------------------------------------------------
      fontFamily: {
        // Geometric sans-serif for UI chrome, labels, and navigation
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        // High-contrast serif for the hero headline
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // -----------------------------------------------------------------------
      // Spacing & sizing extensions
      // -----------------------------------------------------------------------
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "sidebar": "42%",
      },

      // -----------------------------------------------------------------------
      // Border radius
      // -----------------------------------------------------------------------
      borderRadius: {
        "4xl": "2rem",
      },

      // -----------------------------------------------------------------------
      // Box shadows — glassmorphism & glow effects
      // -----------------------------------------------------------------------
      boxShadow: {
        "glass": "0 4px 30px rgba(0, 0, 0, 0.1)",
        "glass-dark": "0 8px 32px rgba(0, 0, 0, 0.37)",
        "glow-beige": "0 0 80px 20px rgba(211, 203, 190, 0.12)",
        "glow-beige-lg": "0 0 140px 40px rgba(211, 203, 190, 0.08)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },

      // -----------------------------------------------------------------------
      // Backdrop blur
      // -----------------------------------------------------------------------
      backdropBlur: {
        xs: "2px",
      },

      // -----------------------------------------------------------------------
      // Background images — radial glow for the pyramid hero
      // -----------------------------------------------------------------------
      backgroundImage: {
        "radial-glow":
          "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(211,203,190,0.15) 0%, transparent 70%)",
        "radial-glow-sm":
          "radial-gradient(ellipse 40% 25% at 50% 75%, rgba(211,203,190,0.10) 0%, transparent 65%)",
      },

      // -----------------------------------------------------------------------
      // Keyframe animations
      // -----------------------------------------------------------------------
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
