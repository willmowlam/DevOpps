const { Redis } = require('@upstash/redis');
const apiCall = require('./apiCall');

/** 
 * Lambda function to fetch a single job from the Jobs API.
 * This function handles both GET and POST requests.
 * 
 * * @param {Object} event - The Lambda event object containing request details.
 * * @returns {Promise<Object>} - The response object containing the job data or error message.
 * * @throws {Error} - Throws an error if the request fails or if required parameters are missing.
 **/

exports.handler = async function(event) {

  const params = event.httpMethod === "POST"
    ? JSON.parse(event.body)
    : event.queryStringParameters;

  // Ensure the job ID is provided
  if (!params || !params.id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Job ID is required' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  // Check if job exists in the Redis cache first
  try {
    const redis = Redis.fromEnv();
    const cachedJob = await redis.get(`job:${params.id}`);
    
    if (cachedJob) {
      // Redis might return the data as an object or string - handle both
      let cachedData;
      if (typeof cachedJob === 'string') {
        try {
          cachedData = JSON.parse(cachedJob);
        } catch (parseError) {
          // Invalid cache entry, remove it and continue to API call
          await redis.del(`job:${params.id}`);
        }
      } else {
        cachedData = cachedJob;
      }
      
      if (cachedData) {
        return {
          statusCode: 200,
          body: JSON.stringify(cachedData),
          headers: { 
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Source': 'redis'
          }
        };
      }
    }
  } catch (redisError) {
    // Continue to API call if Redis fails
  }

  const { data, error } = await apiCall({
    endpoint: '/v2/bing/get',
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

  // Log API errors for monitoring
  if (data.hasError || (data.errors && data.errors.length > 0)) {
    console.error('API errors:', data.errors);
  }

  // Cache the job data in Redis for future requests (expires in 24 hours)
  try {
    const redis = Redis.fromEnv();
    await redis.set(`job:${params.id}`, JSON.stringify(data), { ex: 86400 });
  } catch (redisError) {
    // Don't fail the request if caching fails
  }

  return {
    statusCode: 200,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  };
};
