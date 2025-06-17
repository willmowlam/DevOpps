import { useState, useEffect } from 'react';
import getJobs from "../services/getJobs.js";
import JobSearchResults from "../components/JobSearch/Results.jsx";
import EmploymentTypes from '../components/JobSearch/EmploymentTypes.jsx';
import JobDetails from './JobDetails.jsx';
import {Spinner} from "@nextui-org/react";
import Pagination from "../components/JobSearch/Pagination.jsx";

function JobSearch() {

  const [selectedJob, setSelectedJob] = useState(null);
  const handleJobSelection = (job) => {
    setSelectedJob(job);
    window.scrollTo({ top:0 }); // Go to top of job details page
  };

  const handleBackToSearch = () => {
    setSelectedJob(null);
    window.scrollTo({ top:0 }); // Go to top of search form
  }

  // Job search results
  const [jobs, setJobs] = useState([]);

  // Cache each page of job search results
  const [pageCache, setPageCache] = useState({});

  // Store the next page tokens for pagination
  const [nextPageTokens, setNextPageTokens] = useState({0: null}); 

  // Test for initial render
  const [initialRender, setInitialRender] = useState(true);

  // Test for reset state (eg. when the user clears the form)
  const [isReset, setReset] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    query: '',
    location: '',
    distance: '',
    remoteOnly: false,
    datePosted: '',
    employmentTypes: '',
  });

  // Get querystring values and set form data on first render or do a default initial search
  useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const qsTitle = queryString.get('title') || '';
    const qsLocation = queryString.get('location') || '';
    if (qsTitle && qsLocation) {
      setFormData({
        query: qsTitle,
        location: qsLocation,
      });
    } else {
      setFormData({
        query: 'Software Developer',
        location: 'UK',
      });
    }
    document.title = `devOpps - Job Search`;
  }, []);

  // Track if a search is in progress to disable buttons and prevent accidental multi-searching 
  const [isSearching, setIsSearching] = useState(false);

  // Index for pagination
  const [page, setPage] = useState(0);

  // Listen for the page to change and rerun the search when it does
  useEffect(() => {
    // But not if we are already searching
    if (!initialRender && !isSearching) {
      handleJobSearch();
    }
  }, [page, initialRender]);

  // Set initialRender to false after first render
  useEffect(() => {
    setInitialRender(false);
  }, []);


  // Handle form input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: checked,
    }));
  };

  // Handle Clear button
  const handleJobSearchClear = () => {
    setFormData({ query: '', location: '' });
    setReset(true);
    setPageCache({}); // Clear the cache
  };

  // Handle form submission
  const handleJobSearch = async (requestedPage = page) => {

    // Show cached results if available
    if (pageCache[requestedPage]) {
      setJobs(pageCache[requestedPage]);
      return;
    }

    setIsSearching(true);

    // Get query and location from URL if provided
    const queryString = new URLSearchParams(window.location.search);
    const qsTitle = queryString.get('title');
    const qsLocation = queryString.get('location');

    let query;
    let location;

    if (!formData.query) {
      query = qsTitle;
    } else {
      query = formData.query;
    }

    if (!formData.location) {
      location = qsLocation;
    } else {
      location = formData.location;
    }

    // So long as we have a query and location, we can search
    if (query && location) {

      //console.log(formData)

      // Get jobs from API
      const response = await getJobs({
        query: query,
        location: location,
        distance: formData.distance,
        remoteOnly: formData.remoteOnly ? 'true' : 'false',
        datePosted: formData.datePosted,
        employmentTypes: formData.employmentTypes,
        index: page
      });

      // Update jobs array
      setJobs(response.data.jobs);
      // console.log(response);

      // Add this page's results to the cache
      setPageCache((prevCache) => ({
        ...prevCache,
        [requestedPage]: response.data.jobs,
      }));

      // Track we have done a search
      setReset(false);
    }

    // Remove the query string from the URL
    const urlWithoutQueryString = window.location.pathname;
    window.history.replaceState({}, document.title, urlWithoutQueryString);

    setIsSearching(false);
  };

  // Handle form submission
  const handleSearchFormSubmit = async (event) => {
    event.preventDefault();
    setPage(0);
    setPageCache({}); // Clear the cache
    await handleJobSearch();
  }

  // Back to top button
  const [showButton, setShowButton] = useState(false)

  useEffect( () => {
    const handleScrollBtnVisibility = () => {
      window.pageYOffset > 300 ? setShowButton(true) : setShowButton(false);
    };

    window.addEventListener("scroll", handleScrollBtnVisibility);

    return () => {
      window.removeEventListener("scroll", handleScrollBtnVisibility);
    };
    }, []);

    const handleScrollToTop = () => {
      window.scrollTo({ top:0, behavior:"smooth"});
    };

  return (

    <>
    <div className="bg-indigo-500 py-24 mx-auto results-header">
      <div className ="container mx-auto max-w-[1280px] px-6">
        <h1 className="text-3xl font-semibold leading-7 text-white sm:text-4xl">Job Search</h1>
        <p className="mt-3 leading-6 text-white">Unlock Your IT Career: Find Your Next Opportunity Here</p>
      </div>
      </div>

      <div className="max-w-[1280px] container mx-auto mb-1 px-6">

        {selectedJob ? (
          <>
            <button onClick={handleBackToSearch} className="rounded-md bg-indigo-600 px-3 py-2 my-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Back to Search</button>
            <JobDetails selectedJob={selectedJob} />
          </>
        ) : (
          <div className="flex flex-col md:flex-row lg:flex-row">
            <aside className="w-full md:w-3/12">

              <form onSubmit={handleSearchFormSubmit} className="bg-white rounded-lg p-2 mr-2">
                <div className="space-y-12">
                  <div className="border-b border-gray-900/10 pb-6">
                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                      <div className="col-span-full">
                        <label htmlFor="query" className="block text-sm font-medium leading-6 text-gray-900 text-left">
                          Job Title
                        </label>
                        <div className="mt-2">
                          <select
                            value={formData.query}
                            onChange={handleInputChange}
                            name="query"
                            className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            required
                          >
                            <option value="">Select a Role</option>
                            <option value="Software Developer">Software Developer</option>
                            <option value="Front End Developer">Front End Developer</option>
                            <option value="Back End Developer">Back End Developer</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Cloud Architect">Cloud Architect</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-full">
                        <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900 text-left">
                          Location
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.location}
                            onChange={handleInputChange}
                            name="location"
                            type="text"
                            placeholder="City, Country"
                            className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            required />
                        </div>
                      </div>

                      <div className="col-span-full">
                        <label htmlFor="Distance" className="block text-sm font-medium leading-6 text-gray-900 text-left">
                          Distance (km)
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.distance || ''}
                            onChange={handleInputChange}
                            name="distance"
                            type="text"
                            placeholder="Distance from location (optional)"
                            className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div className="col-span-full">
                        <div className="mt-2">
                          <label htmlFor="remoteOnly" className="text-sm font-medium leading-6 text-gray-900 text-left">
                            Remote Only
                          </label>
                          <input
                            checked={formData.remoteOnly || false}
                            onChange={handleCheckboxChange}
                            name="remoteOnly"
                            type="checkbox"
                            placeholder="Distance from location (optional)"
                            className="rounded-md border-0 py-1.5 ml-3 px-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>

                      <div className="col-span-full">
                        <label htmlFor="datePosted" className="block text-sm font-medium leading-6 text-gray-900 text-left">
                          Posted
                        </label>
                        <div className="mt-2">
                          <select
                            value={formData.datePosted}
                            onChange={handleInputChange}
                            name="datePosted"
                            className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          >
                            <option value="">Show jobs posted...</option>
                            <option value="today">Today</option>
                            <option value="3days">Last 3 days</option>
                            <option value="week">One week</option>
                            <option value="month">One month</option>
                          </select>
                        </div>
                      </div>

                      <EmploymentTypes value={formData.employmentTypes || ''} onChange={handleInputChange} />

                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-start gap-x-6">
                  <button type="button"
                    onClick={handleJobSearchClear}
                    className="rounded-md px-3 py-2 text-sm font-semibold bg-gray-200 text-gray-600 hover:bg-gray-300 focus:ring-gray-400">
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:disabled:bg-indigo-600 disabled:opacity-25">
                    Find Jobs
                  </button>
                </div>
              </form>

            </aside>

            <section className="w-full md:w-9/12">

              <Pagination page={page} setPage={setPage} isSearching={isSearching} jobsLength={jobs.length} />

              <div className="mt-9">
                {
                  // Show appropriate messages or results
                  isSearching ? <Spinner className='load-spinner'/> : (jobs.length === 0 && !isSearching && !isReset) ? "No jobs found" : <JobSearchResults jobs={jobs} handleJobSelection={handleJobSelection} />
                }
              </div>

              <Pagination page={page} setPage={setPage} isSearching={isSearching} jobsLength={jobs.length} scrollToTop={true} />

              {showButton && (
                <div className={`scrollToTop`}>
                  <button className='fixed bottom-5 right-7 z-50 cursor-pointer p-4' onClick={handleScrollToTop}><i className="fa-regular fa-circle-up text-indigo-500 text-large"></i></button>
                </div>
              )}
            </section>
            
          </div>
        )}
      </div>
    </>
  );
}

export default JobSearch;
