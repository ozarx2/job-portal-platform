import React, { useState } from 'react';
import axios from 'axios';

export default function LeadsUpload() {
  const [file, setFile] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-ie0pgclfa-shamseers-projects-613ceea2.vercel.app/api';

  const handleFile = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select an Excel file');

    const token = localStorage.getItem('token');
    if (!token) return alert('Login required');

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/crm/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert(`Created ${res.data.createdCount} leads`);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-2">
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Upload Leads</button>
    </form>
  );
}
