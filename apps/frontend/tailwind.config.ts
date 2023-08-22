import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,jsx,js,tsx}"],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      blue: "#1fb6ff",
      purple: "#7e5bef",
      pink: "#ff49db",
      orange: "#ff7849",
      green: "#13ce66",
      yellow: "#ffc82c",
      "gray-dark": "#273444",
      gray: "#8492a6",
      "gray-light": "#d3dce6",
      primary: "#74dbb8",

      secondary: "#99e1ef",

      accent: "#3f41ba",

      neutral: "#131b20",

      "base-100": "#272244",

      info: "#9bd0f8",

      success: "#198047",

      warning: "#e1940e",

      error: "#e92042",
    },
    fontFamily: {
      sans: ["Graphik", "sans-serif"],
      serif: ["Merriweather", "serif"],
    },
    extend: {
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
} satisfies Config;
