// Utility function to generate simple 6-digit job IDs
export const generateJobId = (jobId) => {
  if (!jobId) return '000000';
  
  // Convert ObjectId to simple 6-digit number
  // Take last 6 characters of the ObjectId and convert to number, then format
  const idString = jobId.toString();
  const lastSix = idString.slice(-6);
  
  // Convert hex to decimal and ensure it's 6 digits
  let numericId = parseInt(lastSix, 16);
  if (isNaN(numericId)) {
    // Fallback: use a hash of the string
    let hash = 0;
    for (let i = 0; i < idString.length; i++) {
      const char = idString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    numericId = Math.abs(hash) % 1000000;
  }
  
  // Ensure it's always 6 digits with leading zeros
  return numericId.toString().padStart(6, '0');
};

// Alternative: Use a simple counter-based approach
let jobCounter = 100000;
export const generateSequentialJobId = () => {
  return (jobCounter++).toString().padStart(6, '0');
};

// For display purposes - format job ID with prefix
export const formatJobId = (jobId, prefix = 'JOB') => {
  const simpleId = generateJobId(jobId);
  return `${prefix}-${simpleId}`;
};
