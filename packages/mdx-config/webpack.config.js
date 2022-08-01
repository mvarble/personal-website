const path = require('node:path');

const DEVELOPMENT = (
  process && process.env && process.env.NODE_ENV === 'development'
)

module.exports = {
  mode: DEVELOPMENT ? 'development' : 'production',
  target: 'node',
  entry: './src/extend-options.ts',
  output: { 
    path: path.join(__dirname, 'dist'),
    filename: 'extend-options.js',
    library: { type: 'umd' },
  },
  module: {
    rules: [
      { 
        test: /\.(j|t)s$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ["@babel/preset-env", { exclude: ["proposal-dynamic-import"] }], 
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },
  resolve: { extensions: ['.js', '.ts'] },
  externals: {
  },
}
