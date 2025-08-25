import React, { useState } from 'react';

export default function ApplicationForm({ selectedJobId, onSubmit }) {
  const [candidate, setCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    education: '',
    experience: '',
    age: '',
    location: '',
    currentEmployer: '',
    currentEmploymentStatus: '',
    skills: '',
  });

  const [resumeFile, setResumeFile] = useState(null);

  const handleChange = (e) => {
    setCandidate({ ...candidate, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedJobId) return alert("Please select a job first.");
    if (!resumeFile) return alert("Please upload a resume.");

    const formData = new FormData();
    formData.append("name", candidate.name);
    formData.append("email", candidate.email);
    formData.append("phone", candidate.phone);
    formData.append("password", candidate.password);
    formData.append("role", "candidate");
    formData.append("jobId", selectedJobId);
    formData.append("education", candidate.education);
    formData.append("experience", candidate.experience);
    formData.append("age", candidate.age);
    formData.append("location", candidate.location);
    formData.append("currentEmployer", candidate.currentEmployer);
    formData.append("currentEmploymentStatus", candidate.currentEmploymentStatus);
    formData.append("skills", candidate.skills);
    formData.append("resume", resumeFile);

    onSubmit(formData);

    setCandidate({
      name: '',
      email: '',
      phone: '',
      password: '',
      education: '',
      experience: '',
      age: '',
      location: '',
      currentEmployer: '',
      currentEmploymentStatus: '',
      skills: '',
    });
    setResumeFile(null);
  };

  return (
    <form className="space-y-4 mb-6" onSubmit={handleSubmit} encType="multipart/form-data">
      <input name="name" placeholder="Candidate Name" className="w-full p-2 border rounded" value={candidate.name} onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" className="w-full p-2 border rounded" value={candidate.email} onChange={handleChange} required />
      <input name="phone" placeholder="Phone" className="w-full p-2 border rounded" value={candidate.phone} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" className="w-full p-2 border rounded" value={candidate.password} onChange={handleChange} required />
      <input name="education" placeholder="Education Qualification" className="w-full p-2 border rounded" value={candidate.education} onChange={handleChange} />
      <input name="experience" type="number" placeholder="Experience (Years)" className="w-full p-2 border rounded" value={candidate.experience} onChange={handleChange} />
      <input name="age" type="number" placeholder="Age" className="w-full p-2 border rounded" value={candidate.age} onChange={handleChange} />
      <input name="location" placeholder="Location" className="w-full p-2 border rounded" value={candidate.location} onChange={handleChange} />
      <input name="currentEmployer" placeholder="Current Employer" className="w-full p-2 border rounded" value={candidate.currentEmployer} onChange={handleChange} />
      <select name="currentEmploymentStatus" className="w-full p-2 border rounded" value={candidate.currentEmploymentStatus} onChange={handleChange}>
        <option value="">-- Employment Status --</option>
        <option value="Employed">Employed</option>
        <option value="Unemployed">Unemployed</option>
      </select>
      <input name="skills" placeholder="Skills (comma separated)" className="w-full p-2 border rounded" value={candidate.skills} onChange={handleChange} />
      <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" required />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Application</button>
    </form>
  );
} 
