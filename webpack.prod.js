const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: [
    './src/scripts/index.js',
  ],
  mode: 'production',
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
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ]
      },
    ]
  },
  output: {
    path: path.resolve('public'),
    filename: 'cc-3d.js',
  },
  plugins: [
    new CleanWebpackPlugin([ 'dist' ]),
    new HtmlWebpackPlugin({
			title: 'Formlab 3D model calculator example',
			template: './src/templates/index.html'
		}),
    new MiniCssExtractPlugin({
      filename: 'cc-3d.css',
      chunkFilename: 'cc-3d.css',
    }),
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: { warnings: false },
        sourceMap: false,
        output: {
          comments: false,
        },
      },
    }),
  ],
};
