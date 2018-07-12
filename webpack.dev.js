const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: [
    './src/scripts/index.js',
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          'style-loader',
          'css-loader',
        ]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Formlab 3D model calculator example',
      template: './src/templates/index.html'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase:  './src/templates/',
    watchContentBase: true,
    hot: true,
  }
};
