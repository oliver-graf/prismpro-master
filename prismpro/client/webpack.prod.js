//
// Copyright (c) 2018 Nutanix Inc. All rights reserved.
//
// Webpack production build
//
/* eslint-env node */

const config = require('./webpack.common.js');
const webpack = require('webpack');

const prodConfig = Object.assign({}, config, {
  bail: true,
  mode: 'production'
});

module.exports = prodConfig;
