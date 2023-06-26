module.exports = {
  purge: [],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      backgroundColor: {
        primary: "var(--color-bg-primary)",
        secondary: "var(--color-bg-secondary)",
        neumorphismprimary: "var(--color-bg-neumorphismprimary)",
        neumorphismsecondary: "var(--color-bg-neumorphismsecondary)",
        svgicon: "var(--color-svg-icon)",
        bghover: "var(--color-bg-hover)",
      },
      textColor: {
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        green: "var(--color-text-green)",
      },
      buttonColor: {
        primary: "var(--color-btn)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
