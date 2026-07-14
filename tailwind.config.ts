import type { Config } from "tailwindcss";

/**
 * dgloss ブランドデザインガイド（dgloss-standards/BRAND.md）準拠のトークン。
 * Primary=青#2563EB を主役、Accent=紫#7C3AED はアクセント（小面積）。
 * PECO/SPM の黄橙は使用しない。
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB", // Primary（青）
          dark: "#1D4ED8",
          light: "#EFF6FF",
        },
        violet: {
          DEFAULT: "#7C3AED", // Accent（紫）
          light: "#F5F3FF",
        },
        good: "#059669", // 成功
        warn: "#F59E0B", // 注意
        bad: "#DC2626", // エラー/危険
        ink: "#1A1A1A", // 文字（標準）
        muted: "#64748B", // 文字（サブ）
        faint: "#94A3B8", // 文字（極薄）
        line: "#E2E8F0", // ボーダー
        surface: "#F8FAFC", // 面/カード
      },
    },
  },
  plugins: [],
};

export default config;
