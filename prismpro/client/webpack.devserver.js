// We are using node's native package 'path'
// https://nodejs.org/api/path.html
const path = require('path');
const config = require('./webpack.common.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const devServerConfig = Object.assign({}, config, {
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    https: false,
    proxy: {
      "/": "http://localhost:80"
      // "/": "http://10.45.32.162:8080"
      //"/": "http://localhost:8080"
    },
    port: 3005
  },
  externals: {},
  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: '/',
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  mode: 'development',
  entry: path.join(path.resolve(__dirname, 'devserver'), 'index.js'),
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(path.resolve(__dirname, 'devserver/public'), 'index.html'),
    })
  ]
});

devServerConfig.module.rules.push({
  test: /\.jsx?$/,
  include: [
    path.join(__dirname, 'src'),
    path.join(__dirname, 'devserver')
  ],
  exclude: /node_modules/,
  loader: 'babel-loader'
});

module.exports = devServerConfig;
