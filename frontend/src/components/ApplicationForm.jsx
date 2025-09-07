import React, { useState } from 'react';

export default function ApplicationForm({ selectedJobId, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    education: '',
    age: '',
    experience: '',
    location: '',
    currentEmployer: '',
    skills: '',
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      alert('Please select a job first.');
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('jobId', selectedJobId);
    formData.append('education', form.education);
    formData.append('age', form.age);
    formData.append('experience', form.experience);
    formData.append('location', form.location);
    formData.append('currentEmployer', form.currentEmployer);
    formData.append('skills', form.skills);
    if (form.resume) {
      formData.append('resume', form.resume);
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 rounded shadow"
    >
      
      <div>
        <label className="block text-sm font-medium">Education</label>
        <input
          type="text"
          name="education"
          value={form.education}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Age</label>
        <input
          type="number"
          name="age"
          value={form.age}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Experience (years)</label>
        <input
          type="number"
          name="experience"
          value={form.experience}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Location</label>
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Current Employer</label>
        <input
          type="text"
          name="currentEmployer"
          value={form.currentEmployer}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Skills (comma-separated)</label>
        <input
          type="text"
          name="skills"
          value={form.skills}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Resume</label>
        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Submit Application
      </button>
    </form>
  );
}
