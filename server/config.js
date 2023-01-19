module.exports = {
  dbDev: "mongodb://localhost:27017/spisko",
  distributionRoot: "build",
  routes: "./server/routes/",
  secret: process.env.NODE_ENV === "production" ? process.env.TOKEN_SECRET : "secret",
  browserPath: process.env.NODE_ENV === 'production' ? process.env.CHROME_PATH : '/Users/ivanv/Applications/Chromium.app/Contents/MacOS/Chromium',//; '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
};