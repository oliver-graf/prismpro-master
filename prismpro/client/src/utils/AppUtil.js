//
// Copyright (c) 2019 Nutanix Inc. All rights reserved.
//
// Common app utility functions
//

/**
 * Checks if an IP addr is valid
 * @param {String} ipAddress - ip addr
 * @returns {Bool} true if the address is valid
 */
export function isValidIP(ipAddress) {
  if (!ipAddress) {
    return false;
  }
  // It is okay to pass 79 chars limit so we won't break regex
  /* eslint-disable */
  if (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ipAddress)) {
    /* eslint-enable */
    return true;
  }
  return false;
}
