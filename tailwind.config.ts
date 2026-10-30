import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1630",
        body: "#55607A",
        navy: "#17307A",
        // Figma color styles on the landing frame (skyline / hills).
        bunting: "#0F1838",
        "east-bay": "#3A4A80",
        "footer-bg": "#0E1630",
        "footer-text": "#C9D1E8",
        "on-dark-muted": "#DCE4FA",
        "page-bg": "#F4F6FA",
        surface: "#FFFFFF",
        "surface-tint": "#E7ECF8",
        border: "#D9E0EB",
        "border-strong": "#B8C2D6",
        "cta-red": "#D9342B",
        "whatsapp-green": "#128C4A",
        teal: "#1BB0AA",
        "teal-light": "#7FE0D8",
        "success-text": "#0F7B5F",
        "success-tint": "#DDF3F1",
        "warning-text": "#9A5B00",
        "warning-tint": "#FFF4DC",
        // Alternative purple/gold palette (unused by designs, available for future)
        "brand-purple": "#453F78",
        "brand-gold": "#D4A72C",
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
          "0 7px 0 rgba(14,22,48,0.12), 0 12px 0 rgba(14,22,48,0.10)",
        "form-card": "0 12px 0 rgba(14,22,48,0.10)",
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
