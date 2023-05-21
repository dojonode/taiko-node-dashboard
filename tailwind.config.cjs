const { createThemes } = require('tw-colors');

module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [
    createThemes({
      original: {
        primaryColor: "#fc0fc0", //taiko pink
        secondaryColor: "#ff9fe9", //taiko soft pink
        tertiaryColor: "#808080", //gray color
        backgroundColor: "#ffffff", //main background
        progressBarTextColor: "#808080",
        progressBarBackgroundColor: "#e0e0e0",
        cardBackgroundColor: "#f5f5f5", //card background
        cardTitleColor: "#fc0fc0",
        cardBodyTextColor: "#6b6b6b",
        cardSubBodyColor: "#b3b3b3",
        settingsBtnColor: "#9baab2",
        settingsInputBackgroundColor: "#ebebeb",
        settingsPrimaryTextColor: "#000", // black
        settingsSecondaryTextColor: "#374151", // blueish gray color
      },
      paper: {
        primaryColor: "#fc0fc0",
        secondaryColor: "#f8c4cf",
        tertiaryColor: "#808080",
        backgroundColor: "#fffdf3",
        progressBarTextColor: "#808080",
        progressBarBackgroundColor: "#E0E7EC",
        cardBackgroundColor: "#f5f5f5",
        cardTitleColor: "#808080",
        cardBodyTextColor: "#1A1B1B",
        cardSubBodyColor: "#9A989F",
        settingsBtnColor: "#9baab2",
        settingsInputBackgroundColor: "#ebebeb",
        settingsPrimaryTextColor: "#000", // black
        settingsSecondaryTextColor: "#374151",
      },
      light: {},
      dark: {
        primaryColor: "#fc0fc0",
        secondaryColor: "#f8c4cf",
        tertiaryColor: "#cecece",
        backgroundColor: "#1a1b1b",
        progressBarTextColor: "#1a1b1b",
        progressBarBackgroundColor: "#707D75",
        cardBackgroundColor: "#444444",
        cardTitleColor: "#FFFFFD",
        cardBodyTextColor: "#FFFFFD",
        cardSubBodyColor: "#BDC0BA",
        settingsBtnColor: "#9baab2",
        settingsInputBackgroundColor: "#9c9c9c",
        settingsPrimaryTextColor: "#fafafa", // white
        settingsSecondaryTextColor: "#fff",
      },
    })
  ],
};
