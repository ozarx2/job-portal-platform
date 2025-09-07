import React from 'react';

export default function JobSelect({ jobs, selectedJob, setSelectedJob }) {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Select Job:</label>
      <select
        className="w-full p-2 border rounded"
        value={selectedJob}
        onChange={(e) => setSelectedJob(e.target.value)}
      >
        <option value="">-- Select a job --</option>
        {Array.isArray(jobs) && jobs.length > 0 ? (
  jobs.map((job) => (
    <option key={job._id} value={job._id}>
      {job.title} ({job._id})
    </option>
  ))
) : (
  <option disabled>No jobs found</option>
)}

        
      </select>
    </div>
  );
}
