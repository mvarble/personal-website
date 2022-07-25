module.exports = {
  presets: [
    ["@babel/preset-env", { exclude: ["proposal-dynamic-import"] }], 
    "@babel/preset-typescript",
  ],
}
