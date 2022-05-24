//
// Copyright (c) 2018 Nutanix Inc. All rights reserved.
//
// Entity Search component is a select component that queries the groups API to search for entities.
//

// Libs
import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

// Components
import {
  Select,
  Loader
} from 'prism-reactjs';

// Utils
import {
  basicFetch
} from '../utils/FetchUtils';

// From the docs
// Note that a "search.decode.values" property can be used to have the
// 'reserved' characters such as FIQL ',' or ';' characters passed as
// percent-encoded characters as part of the search property values.

// https://en.wikipedia.org/wiki/Percent-encoding
const reservedCharMap = {
  ',' : '%2C',
  ';' : '%3B',
  '=' : '%3D',
  '!' : '%21',
  '%' : '%25',
  '(' : '%28',
  ')' : '%29',
  '&' : '%38',
  '.' : '%2E'
  // DO NOT add '*' here. Why?
  // Because if the user types in gold*vm, then then it will
  // search for the embedded wildcard
};

/**
 * Escape FIQL characters found within a string
 * @private
 * @param {String} ch - the character to escape
 * @returns {String} the escaped character
 */
const _escapeCharForFIQL = (ch) => {
  return reservedCharMap[ch] || ch;
};

/**
 * Construct a case insensitive regex for a string, useful for filtering.
 * @param {String} str - the string to generate the regex for.
 * @returns {String} a case insensitive regex.
 */
const caseInsensitiveRegex = (str) => {
  if (!(str && str.length)) {
    return str;
  }
  // Escape all the regex special characters with a backslash so they are
  // interpreted as characters
  str = str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  let ret = '';
  const lc = str.toLowerCase();
  const uc = str.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    if (uc[i] !== lc[i]) {
      ret += `[${lc[i]}|${uc[i]}]`;
    } else {
      ret += _escapeCharForFIQL(str[i]);
    }
  }
  return ret;
};

/**
 * Extracts Data from a Group Member Item returned from the groups API.
 * @param {Object} item - a group member item object to extract the data attributes and values from.
 * @returns {Object} - the flattened data as a simple object of key value pairs.
 */
const extractGroupsData = (item) => {
  if (!item) {
    return;
  }
  const data = {};
  data.entity_id = item.entity_id;
  // Iterate and extract data for each option available
  (item.data).forEach((attribute) => {
    if (attribute.name.indexOf('list') > -1) {
      data[attribute.name] = _.get(attribute, 'values[0].values');
    } else {
      data[attribute.name] = _.get(attribute, 'values[0].values[0]');
    }
  });
  return data;
};


export default class EntitySearch extends React.Component {

  static propTypes = {
    /**
     * Function to handle entity selection changs.
     */
    onEntitiesChange: PropTypes.func,
    /**
     * Entity type to search for.
     */
    entityType: PropTypes.string.isRequired,
    /**
     * Either an array of entities if in multiple selection mode or an object for an already
     * selected object.
     */
    selectedEntities: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /**
     * Set to true to disable the search function being fired on focus.
     */
    disableSearchOnFocus: PropTypes.bool,
    /**
     * Optional ID attribute to use instead of entity_id.
     */
    idAttr: PropTypes.string,
    /**
     * Optional name attribute to use instead of vm_name.
     */
    nameAttr: PropTypes.string,
    /**
     * Optional function handler for selection.
     */
    onSelect: PropTypes.func,
    /**
     * Optional function handler for search that accepts the query string.
     */
    search: PropTypes.func,
    /**
     * Optional placeholder text to place in the input.
     */
    placeholder: PropTypes.string,
    /**
     * Optional string to display when content is not found.
     */
    notFoundContent: PropTypes.string,
    onError: PropTypes.func,
    /**
     * An optional data test attribute for testing to wrap this component.
     */
    'data-test': PropTypes.string
  }

  constructor(props) {
    super(props);

    this.state = {
      results: []
    };
    // Counter to keep track of the components fetches for handling when to cancel the loader.
    this.lastFetchId = 0;
  }

  /**
   * Search function that queries the search results for the specified query string.
   * @param {String} queryString - the string to fetch results for
   * @returns {Promise} that will be resolved once the resuts are stored in the state.
   */
  _search = (queryString) => {
    const idAttr = this.props.idAttr || 'entity_id';
    const fetchId = ++this.lastFetchId;
    return this.fetchResults(queryString).then(response => {
      if (fetchId !== this.lastFetchId) {
        // if the fetchId doesn't match the lastFetchId it means a new request has begun. No use
        // rendering. We will render the latest fetch request.
        return;
      }
      if (!response || !response.data) {
        return;
      }
      // Default handling of entity_results
      const entityResults = _.get(response.data, 'group_results[0].entity_results');
      const results = entityResults && entityResults.map(result => {
        const data = extractGroupsData(result);
        const itemName = data[this.props.nameAttr || 'vm_name'];
        const itemId = data[idAttr];
        return {
          value: itemId,
          title: itemName,
          lowercaseTitle: itemName && itemName.toLowerCase(),
          key: itemId,
          ip: data.ip_address || data.ip_addresses
        };
      });
      return this.setState({
        results,
        loading: false
      });
    });
  };

  /**
   * The debounced search function
   */
  debouncedSearch = _.debounce(this._search, 300, {
    trailing: true,
    leading: false,
    maxWait: 800
  });

  /**
   * Event handler when a search is fired
   * @param {String} queryString - the string to fetch results for
   */
  onSearch = (queryString = '') => {
    if (!this.state.loading) {
      // Set the loading indicator to true until we get the debounced results.
      this.setState({ loading: true });
    }
    this.debouncedSearch(queryString);
    if (_.isFunction(this.props.search)) {
      // Call the optional search handler.
      this.props.search(queryString);
    }
  };

  /**
   * Handler for when a selection changes.
   * @param {String} id - id of the selected entity.
   * @param {Object} options - options returned by the select component.
   * @param {String} value - severity value of the selected checkbox
   */
  onSelect = (id, options) => {
    const { entityType, onEntitiesChange } = this.props;
    if (!onEntitiesChange) {
      return;
    }
    const entityInfo = {
      uuid: id,
      name: options.props.title,
      type: entityType,
      ip: options.props.ip
    };
    onEntitiesChange(entityInfo);
  };

  /**
   * Fetches search results for the specified query string
   * @param {String} query - string to search for.
   * @returns {Promise} - Fetch response Promise
   */
  fetchResults(query) {
    const { nameAttr, entityType } = this.props;
    const nameAttribute = nameAttr || 'vm_name';
    let filter = query ? `${nameAttribute}==.*${caseInsensitiveRegex(query)}.*` : '';
    if (entityType === 'action_rule') {
      // Only show webhook trigger
      const additionalFilters = 'is_enabled==true;trigger_type_name_list=cs=incoming_webhook_trigger';
      filter = filter ? `${filter};${additionalFilters}` : additionalFilters;
    }
    return basicFetch({
      url: '/api/nutanix/v3/groups',
      method: 'POST',
      data: JSON.stringify({
        entity_type: entityType,
        query_name: 'Groups search',
        grouping_attribute: ' ',
        group_count: 1,
        group_offset: 0,
        group_attributes: [],
        group_member_count: 100,
        group_member_offset: 0,
        group_member_sort_attribute: nameAttribute,
        group_member_sort_order: 'ASCENDING',
        group_member_attributes: [
          {
            attribute: nameAttribute
          },
          {
            attribute: 'ip_addresses'
          }
        ],
        filter_criteria: filter
      })
    }).then(resp => {
      if (resp && resp.data && resp.data.error) {
        if (this.props.onError) {
          this.props.onError({
            message: resp.data.error
          });
        }
      } else if (!resp || !resp.data) {
        if (this.props.onError) {
          this.props.onError({ message: 'There was an error making the request' });
        }
      }
      return Promise.resolve(resp);
    }).catch(e => {
      // eslint-disable-next-line no-console
      console.log(e);
      if (this.props.onError) {
        this.props.onError({ message: 'There was an error making the request' });
      }
    });
  }

  /**
   * Get the selected entities.
   * @return {Object} object with the selected options and values.
   */
  getSelections() {
    const { selectedEntities } = this.props;
    const entities = selectedEntities ? [selectedEntities] : [];
    const options = [];
    const values = [];
    _.forEach(entities, entity => {
      const id = entity.uuid;
      const name = entity.name;
      values.push(id);
      options.push({
        value: id,
        title: name,
        lowercaseTitle: name && name.toLowerCase(),
        key: id,
        ip: entity.ip
      });
    });
    return {
      options,
      values
    };
  }

  render() {
    const { results } = this.state;
    const { disableSearchOnFocus, onSelect, placeholder, notFoundContent, ...props } = this.props;
    // Get the current selections and default values to pass to the select.
    const selections = this.getSelections();
    const options = results || [];
    return (
      <div data-test={ this.props['data-test'] }>
        <Select
          onSearch={ this.onSearch }
          selectOptions={
            _.unionBy(selections.options, options, 'value')
          }
          filterOption={
            (input, option) => option.props.lowercaseTitle.indexOf(input.toLowerCase()) > -1
          }
          placeholder={ placeholder }
          notFoundContent={
            this.state.loading
              ? <Loader loading={ true } />
              : notFoundContent || 'No matches found.'
          }
          value={ selections.values }
          onSelect={ onSelect || this.onSelect }
          onFocus={ disableSearchOnFocus ? () => {
            // do nothing since it is disabled
          } : this.onSearch }
          onDeselect={ this.onDeselect }
          multiple={ false }
          // Add the data-test key as a class to the dropdown so QA can identify options
          dropdownClassName={ this.props['data-test'] }
          { ...props }
        />
      </div>
    );
  }

}
