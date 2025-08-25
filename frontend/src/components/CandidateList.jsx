import React from 'react';

export default function CandidateList({ applications }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Submitted Candidates</h2>
      <table className="w-full table-auto border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Resume</th>
            <th className="border p-2">Job ID</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app, index) => (
            <tr key={index}>
              <td className="border p-2">{app.name}</td>
              <td className="border p-2">{app.email}</td>
              <td className="border p-2">{app.phone}</td>
              <td className="border p-2"><a href={app.resumeLink} target="_blank" rel="noopener noreferrer">View</a></td>
              <td className="border p-2">{app.jobId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
