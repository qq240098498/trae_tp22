/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
    },
    extend: {
      colors: {
        wood: {
          50: "#FBF7F2",
          100: "#F5F0E8",
          200: "#E8DCC8",
          300: "#D4BE9C",
          400: "#B8976E",
          500: "#9C7850",
          600: "#7E5F3F",
          700: "#604932",
          800: "#4A3728",
          900: "#33251B",
          950: "#1F1710",
        },
        safety: {
          orange: "#FF6B35",
          orangeLight: "#FF8C5E",
          orangeDark: "#E55A26",
        },
        steel: {
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
        },
        status: {
          good: "#10B981",
          warning: "#F59E0B",
          alert: "#EF4444",
        },
      },
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', '"Noto Sans SC"', "system-ui", "sans-serif"],
        body: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 16px -4px rgba(74, 55, 40, 0.15), 0 2px 4px -2px rgba(74, 55, 40, 0.1)",
        cardHover: "0 12px 32px -8px rgba(74, 55, 40, 0.25), 0 4px 8px -4px rgba(74, 55, 40, 0.15)",
        inset: "inset 0 2px 4px 0 rgba(74, 55, 40, 0.1)",
        glow: "0 0 20px -4px rgba(255, 107, 53, 0.5)",
      },
      backgroundImage: {
        "wood-grain": `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(74, 55, 40, 0.04) 2px,
            rgba(74, 55, 40, 0.04) 3px
          ),
          linear-gradient(135deg, #FBF7F2 0%, #F5F0E8 50%, #E8DCC8 100%)
        `,
        "wood-dark": `
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 3px
          ),
          linear-gradient(135deg, #4A3728 0%, #604932 50%, #4A3728 100%)
        `,
        "safety-gradient": "linear-gradient(135deg, #FF6B35 0%, #FF8C5E 100%)",
        "metal-gradient": "linear-gradient(180deg, #F3F4F6 0%, #D1D5DB 100%)",
      },
      borderRadius: {
        xl2: "14px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-soft": "bounceSoft 0.5s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
