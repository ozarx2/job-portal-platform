import React, { useEffect, useState } from 'react';
import JobSelect from '../components/JobSelect';
import ApplicationForm from '../components/ApplicationForm';
import CandidateList from '../components/CandidateList';
import axios from 'axios';

export default function AgentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [applications, setApplications] = useState([]);

  
 
 useEffect(() => {
  // Temporarily bypass API to verify dropdown rendering
  setJobs([
    { _id: '1', title: 'Test Job 1' },
    { _id: '2', title: 'Test Job 2' }
  ]);
}, []);
    
    // Fetch available jobs from your backend
   // axios.get('/api/jobs').then((res) => {
    //  console.log('Jobs API Response:', res.data);
     // setJobs(res.data.jobs); // or setJobs(res.data) depending on what you see
    //})
    //.catch(console.error);
      //       } , []);

  const handleApplicationSubmit = (appData) => {
    axios.post('/api/applications', appData)
      .then(res => {
        setApplications(prev => [...prev, res.data]);
        alert("Application submitted!");
      })
      .catch(err => {
        console.error(err);
        alert("Failed to submit.");
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Agent Dashboard</h1>
      <JobSelect jobs={jobs} selectedJob={selectedJob} setSelectedJob={setSelectedJob} />
      <ApplicationForm selectedJobId={selectedJob} onSubmit={handleApplicationSubmit} />
      <CandidateList applications={applications} />
    </div>
  );
}
