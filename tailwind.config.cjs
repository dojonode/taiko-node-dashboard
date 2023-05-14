const { createThemes } = require('tw-colors');

module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [
    createThemes({
      original: {
        primaryColor: "#fc0fc0", //taiko pink
        secondaryColor: "#ff9fe9", //taiko soft pink
        backgroundColor: "#f5f5f5", //main background
        cardBackgroundColor: "#f5f5f5", //card background
        bodyColor: "#420d4794",
        subBodyColor: "#b3b3b3",
        settingsBtnColor: "#9baab2",
        settingsBackgroundColor: "#f4cfff",
        settingsButtonColorActive: "#fffacf",
      },
      light: {},
      paper: {},
      dark: {},
    })
  ],
};
