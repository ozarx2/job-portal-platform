import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography, Chip, Alert } from '@mui/material';
import axios from 'axios';

const LeadConversion = ({ lead, onConversion, onClose, open }) => {
  const [step, setStep] = useState(1); // 1: Email Collection, 2: Job Selection, 3: Confirmation
  const [email, setEmail] = useState('');
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available jobs when modal opens
  useEffect(() => {
    if (open && step === 2) {
      fetchAvailableJobs();
    }
  }, [open, step]);

  const fetchAvailableJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('https://api.ozarx.in/api/jobs/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAvailableJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load available jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCollection = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(`https://api.ozarx.in/api/crm/leads/${lead._id}/collect-email`, 
        { email },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setStep(2);
      setError('');
    } catch (err) {
      console.error('Error collecting email:', err);
      setError(err.response?.data?.message || 'Failed to collect email');
    } finally {
      setLoading(false);
    }
  };

  const handleJobSelection = () => {
    if (!selectedJob) {
      setError('Please select a job position');
      return;
    }
    setStep(3);
    setError('');
  };

  const handlePreUserCreation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`https://api.ozarx.in/api/crm/leads/${lead._id}/convert-to-preuser`, 
        { 
          email,
          jobId: selectedJob._id,
          jobTitle: selectedJob.title,
          companyName: selectedJob.company
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess('Pre-user created successfully! Welcome email sent.');
      setTimeout(() => {
        onConversion(response.data);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error creating pre-user:', err);
      setError(err.response?.data?.message || 'Failed to create pre-user');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setEmail('');
    setSelectedJob(null);
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getStatusChip = (status) => {
    const statusColors = {
      'New': { color: 'default', label: 'New' },
      'Contacted': { color: 'primary', label: 'Contacted' },
      'Interested': { color: 'info', label: 'Interested' },
      'Shortlisted': { color: 'success', label: 'Shortlisted' },
      'Email Collected': { color: 'warning', label: 'Email Collected' },
      'Pre-User': { color: 'secondary', label: 'Pre-User' },
      'User-Created': { color: 'success', label: 'User Created' }
    };
    
    const config = statusColors[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: '600px' },
        maxHeight: '90vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 24,
        p: 3
      }}>
        <Typography variant="h5" gutterBottom>
          Lead Conversion: {lead.name}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {getStatusChip(lead.status)}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Phone: {lead.phone} | Location: {lead.location || 'N/A'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Step 1: Email Collection */}
        {step === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 1: Collect Email Address
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This lead is shortlisted. Please collect their email address to proceed with conversion.
              </Typography>
              
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleEmailCollection}
                  disabled={loading || !email}
                >
                  {loading ? 'Collecting...' : 'Collect Email'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Job Selection */}
        {step === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 2: Select Job Position
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Choose the job position for this candidate. They will receive a personalized welcome email.
              </Typography>
              
              {loading ? (
                <Typography>Loading available jobs...</Typography>
              ) : (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Job Position</InputLabel>
                  <Select
                    value={selectedJob?._id || ''}
                    onChange={(e) => {
                      const job = availableJobs.find(j => j._id === e.target.value);
                      setSelectedJob(job);
                    }}
                    label="Select Job Position"
                  >
                    {availableJobs.map((job) => (
                      <MenuItem key={job._id} value={job._id}>
                        {job.title} - {job.company} ({job.location})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedJob && (
                <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Job Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Position:</strong> {selectedJob.title}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Company:</strong> {selectedJob.company}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Location:</strong> {selectedJob.location}
                  </Typography>
                  {selectedJob.salary && (
                    <Typography variant="body2">
                      <strong>Salary:</strong> {selectedJob.salary}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Description:</strong> {selectedJob.description?.substring(0, 100)}...
                  </Typography>
                </Card>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setStep(1)} disabled={loading}>
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleJobSelection}
                  disabled={loading || !selectedJob}
                >
                  Continue
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Step 3: Confirm Conversion
              </Typography>
              
              <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.50' }}>
                <Typography variant="subtitle2" gutterBottom color="success.main">
                  Pre-User Creation Summary:
                </Typography>
                <Typography variant="body2">
                  <strong>Candidate:</strong> {lead.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {email}
                </Typography>
                <Typography variant="body2">
                  <strong>Job Position:</strong> {selectedJob.title}
                </Typography>
                <Typography variant="body2">
                  <strong>Company:</strong> {selectedJob.company}
                </Typography>
              </Card>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This will:
              </Typography>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li>Create a pre-user account with temporary credentials</li>
                <li>Send a personalized welcome email with job details</li>
                <li>Update the lead status to "Pre-User"</li>
                <li>Track the conversion for analytics</li>
              </ul>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button onClick={() => setStep(2)} disabled={loading}>
                  Back
                </Button>
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={handlePreUserCreation}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Pre-User'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Modal>
  );
};

export default LeadConversion;
