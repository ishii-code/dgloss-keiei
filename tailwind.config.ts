import type { Config } from "tailwindcss";

/**
 * dgloss OS 経営ダッシュボードのカラーパレット。
 * ワイヤーフレーム（dgloss-os-wireframe）準拠のブルー/パープル基調。
 * KGI①=権限移譲(brand), KGI②=状態(violet), KGI③=労働力(定量)。
 * 状態トークン good/warn/bad で自動化率・逸脱・ステータスを統一。
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB", // dgloss ブルー
          dark: "#1D4ED8",
          light: "#EFF6FF",
        },
        violet: {
          DEFAULT: "#7C3AED",
          light: "#F5F3FF",
        },
        good: "#16A34A",
        warn: "#D97706",
        bad: "#DC2626",
        ink: "#1B2030",
        muted: "#6F7488",
        line: "#E6E8F1",
        surface: "#F6F7FB",
      },
    },
  },
  plugins: [],
};

export default config;
