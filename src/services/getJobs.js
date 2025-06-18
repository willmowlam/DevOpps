import axios from 'axios';

/**
 * getJobs from Jobs API (via Rapid API).
 * 
 * 
 * @param params An object of parameters {query, location, remoteOnly, datePosted, employmentTypes, nextPage}
 * @returns An array of job objects
 * 
 * See: https://rapidapi.com/Pat92/api/jobs-api14
 * 
 **/
const getJobs = async (params) => {

  // If there isn't a nextPage token then we need at least a query and location
  if (!params.nextPage){
    if (!params.query) {
      throw new Error('The query parameter is required.');
    }

    if (!params.location) {
      throw new Error('The location parameter is required.');
    }
  }

  const resource = {
    method: 'GET',
    url: 'https://jobs-api14.p.rapidapi.com/v2/list',
    params: { ...params },
    headers: {
      'X-RapidAPI-Key': import.meta.env.VITE_JOBS_API_KEY,
      'X-RapidAPI-Host': 'jobs-api14.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(resource);
    return { response, error: null };
  } catch (error) {
    console.error(error);
    return { response: null, error: error.message || 'Unknown error' };
  }

};

export default getJobs;