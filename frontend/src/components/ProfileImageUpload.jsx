import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ProfileImageUpload = ({ currentImage, onImageUpdate, onError }) => {
  const [image, setImage] = useState(currentImage);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const currentImageUrl = useRef(null);
  const fileInputRef = useRef(null);

  // Update local state when prop changes
  useEffect(() => {
    setImage(currentImage);
  }, [currentImage]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (currentImageUrl.current) {
        URL.revokeObjectURL(currentImageUrl.current);
      }
    };
  }, []);

  // Helper function to safely create object URL
  const getImageUrl = (imageFile) => {
    if (!imageFile) {
      return null;
    }
    
    // If it's already a URL string, return it (handle both relative and absolute URLs)
    if (typeof imageFile === 'string') {
      // If it's a relative URL, make it absolute
      if (imageFile.startsWith('/uploads/')) {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        return `${API_BASE_URL}${imageFile}`;
      }
      return imageFile;
    }
    
    // If it's not a File object, return null
    if (!(imageFile instanceof File)) {
      return null;
    }
    
    // Clean up previous URL
    if (currentImageUrl.current) {
      URL.revokeObjectURL(currentImageUrl.current);
    }
    
    // Create new URL
    try {
      const url = URL.createObjectURL(imageFile);
      currentImageUrl.current = url;
      return url;
    } catch (error) {
      console.error('Error creating object URL:', error);
      return null;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file instanceof File) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        setMessageType('error');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage('Image file size must be less than 5MB');
        setMessageType('error');
        return;
      }
      
      setImage(file);
      setMessage('Image selected successfully');
      setMessageType('success');
      
      // Notify parent component
      if (onImageUpdate) {
        onImageUpdate(file);
      }
    } else {
      setImage(null);
      if (onImageUpdate) {
        onImageUpdate(null);
      }
    }
  };

  const clearImage = () => {
    // Clean up object URL
    if (currentImageUrl.current) {
      URL.revokeObjectURL(currentImageUrl.current);
      currentImageUrl.current = null;
    }
    
    // Clear the image
    setImage(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setMessage('Profile image removed');
    setMessageType('success');
    
    // Notify parent component
    if (onImageUpdate) {
      onImageUpdate(null);
    }
  };

  const uploadImage = async () => {
    if (!image || !(image instanceof File)) {
      setMessage('Please select an image first');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profileImage', image);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_BASE_URL}/users/profile-image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 15000
      });

      setMessage('Profile image uploaded successfully!');
      setMessageType('success');
      
      // Notify parent component with the uploaded image path
      if (onImageUpdate) {
        onImageUpdate(response.data.profileImage);
      }

    } catch (error) {
      console.error('Profile image upload error:', error);
      let errorMessage = 'Failed to upload profile image';
      
      if (error.response?.status === 413) {
        errorMessage = 'File size too large. Please select a smaller image.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid image file. Please select a valid image.';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again.';
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Profile Picture
      </h3>
      
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {image && getImageUrl(image) ? (
              <img
                src={getImageUrl(image)}
                alt="Profile"
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.warn('Failed to load profile image');
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          />
          <p className="mt-1 text-sm text-gray-500">
            Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
          </p>
          
          {image && image instanceof File && (
            <div className="mt-3 flex space-x-2">
              <button
                type="button"
                onClick={uploadImage}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload Image'}
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="px-4 py-2 text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      
      {message && (
        <div className={`mt-4 p-3 rounded-lg ${
          messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
