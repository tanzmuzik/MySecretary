const path = require('path');
const fs = require('fs');

module.exports = {
  entry: {
    panel: './src/panel/script.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  devtool: 'source-map',
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.done.tap('CopyJSXPlugin', () => {
          // JSXファイルをそのままコピー
          const srcJsx = path.resolve(__dirname, 'src/jsx/main.jsx');
          const distJsx = path.resolve(__dirname, 'dist/main.jsx');
          if (fs.existsSync(srcJsx)) {
            fs.copyFileSync(srcJsx, distJsx);
          }
        });
      }
    }
  ]
};
