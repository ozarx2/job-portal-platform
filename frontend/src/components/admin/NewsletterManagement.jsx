import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewsletterManagement = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [sendingResults, setSendingResults] = useState(null);

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await axios.get(`${API_BASE_URL}/email/newsletter/subscribers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSubscriberCount(response.data.subscriberCount);
      }
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSendingResults(null);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${API_BASE_URL}/email/newsletter/send`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
        setSendingResults(response.data.results);
        setFormData({ title: '', content: '' });
        fetchSubscriberCount(); // Refresh subscriber count
      } else {
        setMessage(response.data.message || 'Failed to send newsletter');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Newsletter sending error:', error);
      setMessage(error.response?.data?.message || 'Failed to send newsletter');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${API_BASE_URL}/email/test`, {
        email: 'test@example.com',
        type
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setMessage(`Test ${type} email sent successfully!`);
        setMessageType('success');
      } else {
        setMessage(`Failed to send test ${type} email`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Test email error:', error);
      setMessage(`Failed to send test ${type} email`);
      setMessageType('error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Newsletter Management
          </h2>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl font-semibold">
            {subscriberCount} Subscribers
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 shadow-sm ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
              Newsletter Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
              placeholder="Enter newsletter title"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-bold text-gray-800 mb-3 tracking-wide">
              Newsletter Content (HTML)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={10}
              className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
              placeholder="Enter newsletter content (HTML supported)"
            />
            <p className="mt-2 text-sm text-gray-600">
              You can use HTML tags for formatting. Example: &lt;h2&gt;Heading&lt;/h2&gt;, &lt;p&gt;Paragraph&lt;/p&gt;, &lt;a href="#"&gt;Link&lt;/a&gt;
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Newsletter...
                </div>
              ) : (
                'Send Newsletter'
              )}
            </button>

            <button
              type="button"
              onClick={() => testEmail('welcome')}
              className="px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 font-semibold"
            >
              Test Welcome
            </button>

            <button
              type="button"
              onClick={() => testEmail('newsletter')}
              className="px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 font-semibold"
            >
              Test Newsletter
            </button>
          </div>
        </form>

        {sendingResults && (
          <div className="mt-6 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sending Results</h3>
            <div className="space-y-2">
              {sendingResults.map((result, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <span className="font-medium">{result.email}</span>
                  <span className="text-sm">
                    {result.success ? '✅ Sent' : `❌ Failed: ${result.error}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManagement;


