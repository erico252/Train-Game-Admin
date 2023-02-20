const path = require('path');

module.exports = {
  mode: "development",
  entry: './src/app.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx'],
  },
  output: {
    filename: 'script.js',
    path: path.resolve(__dirname, 'dist'),
  },
};