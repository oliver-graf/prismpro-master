//
// Copyright (c) 2016 Nutanix Inc. All rights reserved.
//
// Environment and configuration for Prism SSP dev server.
// You can have your own local configuration by creating a file,
// 'my_local_config.js', that overrides this local config. Please see
// README.md for more information
//

'use strict';

// Local Config
//-------------
var env = {

  // Config settings for the app script.
  app: {
    // Listener port #
    listenerPort: 80,

    proxyHost: '',

    // Port to proxy to
    proxyPort: 9440,

    proxyProtocol: 'https',

    isHttps: false,

    // Automatically login
    autoLogin: true,

    simulatePrismPro: true,

    // User/Pass for auto login
    userName: 'admin',
    userPass: 'Nutanix/4u',

    // User/Pass for ssh to PC
    sshUserName: 'nutanix',
    sshPass: 'nutanix/4u'
  }
};

// Override for config
//--------------------

// Read the override for local config if there's any.
var localConfigOverride;
var CONFIG_FILE = './my_local_config';
try {
  console.log('Use custom configuration: ', CONFIG_FILE);
  localConfigOverride = require(CONFIG_FILE);
} catch(e) {
  console.log('Custom configuration not yet provided')
}

// Extend before exporting if there is any override provided
if (localConfigOverride) {
  env.app = Object.assign({}, env.app, localConfigOverride.app);
}

module.exports = env;
