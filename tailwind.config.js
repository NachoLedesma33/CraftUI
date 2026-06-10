/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "editor-base": { raw: "(min-width: 0px)" },
        "editor-sm": { raw: "(min-width: 640px)" },
        "editor-md": { raw: "(min-width: 768px)" },
        "editor-lg": { raw: "(min-width: 1024px)" },
        "editor-xl": { raw: "(min-width: 1280px)" },
      },
      colors: {
        editor: {
          canvas: "#f5f0eb",
          sidebar: "#ffffff",
          toolbar: "#fafafa",
          border: "#000000",
          accent: "#ef4444",
          "accent-alt": "#3b82f6",
        },
      },
      borderWidth: {
        3: "3px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      fontFamily: {
        sans: [
          '"Segoe UI"',
          '"Inter"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: [
          '"Fira Code"',
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      boxShadow: {
        brutal: "3px 3px 0px #000",
        "brutal-sm": "2px 2px 0px #000",
        "brutal-lg": "5px 5px 0px #000",
      },
    },
  },
  plugins: [],
};
