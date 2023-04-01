const path = require('path');

const config = {
  entry: './src/js/index.js',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'omessenger.min.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

module.exports = config;
