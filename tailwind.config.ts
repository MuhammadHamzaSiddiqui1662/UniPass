import type { Config } from "tailwindcss";

/**
 * Colour values live in app/globals.css as space-separated RGB channels.
 * Scale steps follow Figma frames 5:84 (purple) and 5:160 (golden):
 *   50=0, 100=0.5, 150=1, 200=1.5, 300=2, 400=3, 500=4,
 *   600=5 (brand), 700=6, 800=7, 900=8, 950=8.5, 975=9, 990=9.5.
 * Slate keys are the spec sheet (frame 2:4). 300 and 500 are not on that sheet.
 */
const channel = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: channel("primary-600"),
          50: channel("primary-50"),
          100: channel("primary-100"),
          150: channel("primary-150"),
          200: channel("primary-200"),
          300: channel("primary-300"),
          400: channel("primary-400"),
          500: channel("primary-500"),
          600: channel("primary-600"),
          700: channel("primary-700"),
          800: channel("primary-800"),
          900: channel("primary-900"),
          950: channel("primary-950"),
          975: channel("primary-975"),
          990: channel("primary-990"),
        },
        secondary: {
          DEFAULT: channel("secondary-600"),
          50: channel("secondary-50"),
          100: channel("secondary-100"),
          150: channel("secondary-150"),
          200: channel("secondary-200"),
          300: channel("secondary-300"),
          400: channel("secondary-400"),
          500: channel("secondary-500"),
          600: channel("secondary-600"),
          700: channel("secondary-700"),
          800: channel("secondary-800"),
          900: channel("secondary-900"),
          950: channel("secondary-950"),
          975: channel("secondary-975"),
          990: channel("secondary-990"),
        },
        slate: {
          50: channel("slate-50"),
          100: channel("slate-100"),
          200: channel("slate-200"),
          400: channel("slate-400"),
          600: channel("slate-600"),
          700: channel("slate-700"),
          800: channel("slate-800"),
          900: channel("slate-900"),
        },
        success: {
          DEFAULT: channel("success"),
          tint: channel("success-tint"),
        },
        warning: {
          DEFAULT: channel("warning"),
          tint: channel("warning-tint"),
        },
        error: {
          DEFAULT: channel("error"),
          tint: channel("error-tint"),
        },
        info: {
          DEFAULT: channel("info"),
          tint: channel("info-tint"),
        },
        // WhatsApp's own green. Not a UniPass brand colour.
        whatsapp: channel("whatsapp"),
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        body: ["var(--font-hanken)", "sans-serif"],
      },
      borderRadius: {
        chip: "13px",
        caption: "6px",
        input: "10px",
        note: "12px",
        card: "16px",
        panel: "18px",
        featured: "20px",
        "form-card": "22px",
        pill: "32px",
      },
      boxShadow: {
        "header-pill":
          "0 7px 0 rgb(var(--primary-900) / 0.12), 0 12px 0 rgb(var(--primary-900) / 0.10)",
        "form-card": "0 12px 0 rgb(var(--primary-900) / 0.10)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
