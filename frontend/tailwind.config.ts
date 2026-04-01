import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        base: "#06080d",
        panel: "#0c1017",
        raised: "#121820",
        accent: "#06d6a0",
        negative: "#ff6b6b",
        info: "#4dabf7",
        warning: "#ffd43b",
      },
    },
  },
  plugins: [],
};
export default config;
