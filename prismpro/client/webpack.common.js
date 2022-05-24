//
// Copyright (c) 2018 Nutanix Inc. All rights reserved.
//
// Webpack commom config
//
/* eslint-env node */
const path = require('path');
var webpack = require('webpack');


module.exports = {
  entry: {
    PrismProWebserver: path.resolve(__dirname, 'src/index.js')
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    libraryTarget: 'umd',
    chunkFilename: '[id].[hash].chunk.js',
    publicPath: 'build/'
  },
  externals: Object.assign({}),
  resolve: {
    modules: [
      path.join(__dirname, './node_modules'),
      path.join(__dirname, './src')
    ]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({ options: {} })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.join(__dirname, 'src')
        ],
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      // For loading fonts.
      // This is only needed for the styleguide.
      {
        test: /\.(woff|woff2|eot|eot\?iefix|ttf|svg|gif)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      }
    ]
  }
};
