const axios = require('axios');

/**
 * Generic API call utility for multiple providers.
 * 
 * @param {Object} options
 * @param {string} options.endpoint - The API endpoint (relative or absolute URL)
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.data=null] - Request body data (for POST, PUT, etc.)
 * @param {Object} [options.params=null] - Query parameters
 * @param {Object} [options.headers={}] - Custom headers
 * @param {string} [options.baseURL] - Override base URL for this request
 * @param {Object} [options.axiosConfig={}] - Additional Axios config
 * @returns {Promise<{data: any, error: null}|{data: null, error: {status: number, message: string}}>}
 */

const apiCall = async ({
  endpoint,
  method = 'GET',
  data = null,
  params = null,
  headers = {},
  baseURL,
  axiosConfig = {},
}) => {
  try {
    const response = await axios({
      method,
      url: endpoint,
      baseURL,
      data,
      params,
      headers,
      timeout: 10000,
      ...axiosConfig,
    });
    return { data: response.data, error: null };
  } catch (error) {
    if (error.response) {
      // Server responded with a status code outside 2xx
      return {
        data: null,
        error: {
          status: error.response.status,
          message: error.response.data?.message || 'Server error',
        },
      };
    } else if (error.request) {
      // No response received
      return {
        data: null,
        error: {
          status: -1,
          message: 'Network error',
        },
      };
    } else {
      // Something else happened
      return {
        data: null,
        error: {
          status: -1,
          message: error.message || 'Request failed',
        },
      };
    }
  }
};

module.exports = apiCall;