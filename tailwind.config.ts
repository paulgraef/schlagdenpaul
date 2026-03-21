import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        "secondary-foreground": "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0.20)" },
          "50%": { boxShadow: "0 0 0 16px rgba(99, 102, 241, 0)" }
        },
        flipIn: {
          "0%": { transform: "rotateY(180deg)" },
          "100%": { transform: "rotateY(0deg)" }
        }
      },
      animation: {
        pulseGlow: "pulseGlow 1.8s ease-in-out infinite",
        flipIn: "flipIn 0.3s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
