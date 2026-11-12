import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fetih 1453 kimliği
        zumrut: "#0E3B24",
        gece: "#0A2416",
        al: { DEFAULT: "#B3261E", koyu: "#8E1D17" },
        mat: "#C9A227",
        fildisi: "#F6F3EA",
        krem: "#E9E2CC",
        cizgi: "#DDD5BF",
        murekkep: "#14181B",
        kursun: "#5B6460",
        kirmizi: {
          DEFAULT: "#C0392B",
          dark: "#96281B",
          light: "#E74C3C",
        },
        yesil: {
          DEFAULT: "#1A4D2E",
          dark: "#0F2D1A",
          light: "#2D7A4A",
        },
        altin: {
          DEFAULT: "#D4AF37",
          dark: "#B8960C",
          light: "#F0CB5A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        baslik: ["'Barlow Condensed'", "Inter", "sans-serif"],
        zarif: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;