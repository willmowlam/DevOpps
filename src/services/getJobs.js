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

  try {
    const response = await fetch('/.netlify/functions/getJobs', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(params),
    });

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.message || 'Unknown error');
      err.status = response.status;
      throw err;
    }

    return { response: { data }, error: null };
  } catch (error) {
    return { response: null,     
      error: {
        status: error.status || -1,
        message: error.message || 'Unknown error',
      }, 
    };
  }

};

export default getJobs;