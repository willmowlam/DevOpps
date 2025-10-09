/**
 * getJob from Jobs API (via Rapid API).
 * 
 * 
 * @param params An object of parameters {jobId: string}
 * @returns A single job object
 * 
 * See: https://rapidapi.com/Pat92/api/jobs-api14
 * 
 **/
const getJob = async (jobId) => {

  if (!jobId) {
    throw new Error('The job ID parameter is required.');
  }

  try {
    const response = await fetch('/.netlify/functions/getJob', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: jobId }),
    });

    // Check response status first
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return { 
      response: { data: data.data },
      error: null 
    };

  } catch (error) {
    return { 
      response: null, 
      error: { 
        status: error.status || -1,
        message: error.message || 'An error occurred while fetching job data.' 
      },
    };
  }

};

export default getJob;