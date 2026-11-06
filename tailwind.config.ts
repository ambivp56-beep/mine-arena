import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        grass: "#5db136", grassdark: "#3f7d20", dirt: "#7a4b25", dirtdark: "#4a2c14",
        plank: "#b8793a", gold: "#ffc21a", ember: "#f08a12", stone: "#c9c9d1",
        night: "#0b1a10", panel: "#14261a",
      },
      fontFamily: { pixel: ["var(--font-pixel)", "monospace"], body: ["var(--font-body)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
