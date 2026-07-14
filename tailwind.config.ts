import type { Config } from "tailwindcss";

/**
 * dgloss 経営 AI OS。shadcn/ui のトークン（CSS変数）を dgloss ブランドにマッピングし、
 * 既存の dgloss ユーティリティ（brand/violet/good/warn/bad/ink/muted/line/surface/faint）も維持。
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // shadcn/ui 標準トークン
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // dgloss ブランドトークン（BRAND.md 準拠・維持）
        brand: { DEFAULT: "#2563EB", dark: "#1D4ED8", light: "#EFF6FF" },
        violet: { DEFAULT: "#7C3AED", light: "#F5F3FF" },
        good: "#059669",
        warn: "#F59E0B",
        bad: "#DC2626",
        ink: "#1A1A1A",
        muted: { DEFAULT: "#64748B", foreground: "hsl(var(--muted-foreground))" },
        faint: "#94A3B8",
        line: "#E2E8F0",
        surface: "#F8FAFC",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
