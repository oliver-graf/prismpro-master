//
// Copyright (c) 2018 Nutanix Inc. All rights reserved.
//
// Dev build webpack config
//

const config = require('./webpack.common.js');

const devConfig = Object.assign({}, config, {
  devtool: 'cheap-module-eval-source-map',
  mode: 'development'
});

module.exports = devConfig;
