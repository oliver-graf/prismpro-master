//
// Copyright (c) 2018 Nutanix Inc. All rights reserved.
//
// FetchUtils - Utility functions to make common fetch calls
//

// Libs
import axios from 'axios';
import _ from 'lodash';

// ---------------
// Fetch Constants
// ---------------

export const FETCH_HEADERS = {
  'Content-Type': 'application/json;charset=UTF-8'
};

export const API_METHOD = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

export const INTENT = {
  KIND: 'kind',
  NAME: 'name',
  UUID: 'uuid',
  STATUS: 'status',
  RESOURCES: 'resources',
  METADATA: 'metadata',
  API_VERSION: 'api_version',
  SPEC_VERSION: 'spec_version',
  SPEC: 'spec'
};

/**
 * Wrapper for common API fetch requests.
 * @param {Object} options - The fetch options to add to the request
 * (data, method, url, etc.). See this page for the full list of options:
 * https://github.com/axios/axios
 * @returns {Promise} - The resolved/rejected promise.
 */
export function basicFetch(
  options = {
    method: API_METHOD.GET,
    url: ''
  }) {
  if (!options.headers) {
    options.headers = FETCH_HEADERS;
  }
  return axios(options);
}

/**
 * Determines if a fetch request should be made.
 * @private
 * @param {Object} state - A specific part of the current app state.
 * @returns {Boolean} - Whether a fetch request should be made or not.
 */
export function shouldFetch(state) {
  // Don't fetch if we are in the middle of a fetch request aleady.
  if (state && state.isFetching) {
    return false;
  }
  return true;
}

/**
 * Extracts and returns the error message from the given error.
 * @param {Object} error - an error object.
 * @returns {String} - Error message if any.
 */
export function getErrorMessage(error) {
  if (!error) {
    return;
  }
  if (_.isString(error)) {
    return error;
  }
  if (error.response) {
    const data = error && error.response && error.response.data;
    const msg = _.first(data && data.message_list);
    return msg && (_.first(msg.details && msg.details['spec.resources']) || msg.message);
  } else if (error.message) {
    return error.message;
  }
}
