import apiCall from "./apiCall";

/** 
 * Lambda function to fetch job listings from the Jobs API.
 * This function handles both GET and POST requests.
 * 
 * * @param {Object} event - The Lambda event object containing request details.
 * * @returns {Promise<Object>} - The response object containing job listings or error message.
 * * @throws {Error} - Throws an error if the request fails or if required parameters are missing.
 **/

export async function handler(event) {

  const params = event.httpMethod === "POST"
    ? JSON.parse(event.body)
    : event.queryStringParameters;

  const { data, error } = await apiCall({
    endpoint: '/v2/list',
    method: 'GET',
    params,
    headers: {
      'X-RapidAPI-Key': process.env.JOBS_API_KEY,
      'X-RapidAPI-Host': 'jobs-api14.p.rapidapi.com',
    },
    baseURL: 'https://jobs-api14.p.rapidapi.com',
  });
  
  if (error) {
    return {
      statusCode: error.status || 500,
      body: JSON.stringify({ message: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  };
};
