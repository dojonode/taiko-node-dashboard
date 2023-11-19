import {createThemes} from "tw-colors";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [
    createThemes({
      original: {
        primaryColor: "#e81899", //taiko pink
        secondaryColor: "#ff9fe9", //taiko soft pink
        tertiaryColor: "#808080", //gray color
        backgroundColor: "#ffffff", //main background
        progressBarTextColor: "#808080",
        progressBarBackgroundColor: "#e0e0e0",
        cardBackgroundColor: "#f5f5f5", //card background
        cardTitleColor: "#e81899",
        cardBodyTextColor: "#6b6b6b",
        cardSubBodyColor: "#b3b3b3",
        settingsBtnColor: "#9baab2",
        settingsInputBackgroundColor: "#ebebeb",
        settingsPrimaryTextColor: "#000", // black
        settingsSecondaryTextColor: "#374151", // blueish gray color
      },
      paper: {
        primaryColor: "#e81899",
        secondaryColor: "#f8c4cf",
        tertiaryColor: "#808080",
        backgroundColor: "#FFF9EB",
        textColor: "#444444",
        nodeTypesColorActive: "#E81899",
        progressBarFillColor: "#F8C4CF",
        progressBarBackgroundColor: "#E0E7EC",
        cardBackgroundColor: "#f5f5f5",
        cardTitleColor: "#E81899",
        cardSubBodyColor: "#9A989F",
        settingsAccentColor: "#E0E7EC",
        settingsBtnColor: "#9baab2",
      },
      light: {
        primaryColor: "#e81899",
        secondaryColor: "#f8c4cf",
        tertiaryColor: "#808080",
        backgroundColor: "#FFFFFD",
        textColor: "#444444",
        nodeTypesColorActive: "#E81899",
        progressBarFillColor: "#F8C4CF",
        progressBarBackgroundColor: "#E0E7EC",
        cardBackgroundColor: "#f5f5f5",
        cardTitleColor: "#E81899",
        cardSubBodyColor: "#9A989F",
        settingsAccentColor: "#E0E7EC",
        settingsBtnColor: "#9baab2",
      },
      dark: {
        primaryColor: "#e81899",
        secondaryColor: "#f8c4cf",
        tertiaryColor: "#cecece",
        backgroundColor: "#1a1b1b",
        textColor: "#F4F4F4",
        nodeTypesColorActive: "#E81899",
        progressBarFillColor: "#E13A8C",
        progressBarBackgroundColor: "#707D75",
        cardBackgroundColor: "#444444",
        cardTitleColor: "#ec4899",
        cardSubBodyColor: "#BDC0BA",
        settingsAccentColor: "#707D75",
        settingsBtnColor: "#9baab2",
      },
    }),
  ],
};
