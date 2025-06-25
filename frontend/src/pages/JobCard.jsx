// src/components/jobs/JobCard.jsx
import React from 'react';

const JobCard = ({ title, company, location, salary }) => {
  return (
    <div style={{
      border: '1px solid #ccc',
      padding: '1rem',
      margin: '1rem 0',
      borderRadius: '8px',
    }}>
      <h3>{title}</h3>
      <p>{company} - {location}</p>
      <p><strong>Salary:</strong> {salary}</p>
      <button>Apply Now</button>
    </div>
  );
};

export default JobCard;
