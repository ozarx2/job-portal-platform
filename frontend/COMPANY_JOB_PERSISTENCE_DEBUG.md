# Company/Job Persistence Debug Guide

## Issue: Company and Job assignments showing as "Not assigned" in Reports

### Root Cause Analysis
The issue could be at any of these points:
1. **Data not being saved** from Agent Dashboard
2. **Data not being persisted** to database
3. **Data not being fetched** correctly in Reports
4. **Data structure mismatch** between save and fetch

## 🔧 **Enhanced Debugging Tools Added**

### 1. **Agent Dashboard Debugging**
- **Enhanced Save Logging**: Shows company/job data being saved
- **API Response Logging**: Shows server response after save
- **Force Refresh**: Updates UI immediately after save

### 2. **Reports Debugging**
- **API Test Button**: Tests the API endpoint directly
- **Data Inspection**: Shows what data is being received
- **Test Data Button**: Adds test data for immediate verification

## 🧪 **Step-by-Step Debugging Process**

### **Step 1: Test Data Saving (Agent Dashboard)**
1. Go to **Agent Dashboard → CRM tab**
2. Edit a lead and change status to "Shortlisted"
3. Select a company and job from dropdowns
4. Click "Save"
5. **Check console logs** for:
   ```
   Saving lead data: {companyName: "...", jobTitle: "..."}
   Company ID: "..."
   Company Name: "..."
   Job ID: "..."
   Job Title: "..."
   Save response: {...}
   ```

### **Step 2: Test Data Retrieval (Reports)**
1. Go to **Reports → Shortlisted tab**
2. Click **"Test API"** button
3. **Check console logs** for:
   ```
   All leads from API: {...}
   Shortlisted leads from API: [...]
   API Lead 0: {companyName: "...", jobTitle: "..."}
   ```

### **Step 3: Test Display (Reports)**
1. Click **"Add Test Data"** button
2. **Verify**: Company and job should show immediately
3. If they show, the display logic works
4. If they don't show, there's a display issue

## 🎯 **Expected Results**

### **If Data is Being Saved Correctly:**
- Console shows company/job data in save logs
- API test shows company/job data in response
- Reports display the assignments

### **If Data is NOT Being Saved:**
- Console shows empty/undefined values in save logs
- Need to check the save function logic

### **If Data is Saved but Not Retrieved:**
- Save logs show data being sent
- API test shows empty/undefined values
- Need to check backend API

### **If Data is Retrieved but Not Displayed:**
- API test shows correct data
- Display shows "Not assigned"
- Need to check display logic

## 🔍 **Common Issues and Solutions**

### **Issue 1: Data Not Being Saved**
**Symptoms**: Save logs show empty values
**Solution**: Check if company/job dropdowns are working
**Fix**: Ensure dropdowns are populated and selections are made

### **Issue 2: Data Not Being Persisted**
**Symptoms**: Save logs show data, but API test shows empty values
**Solution**: Check backend API endpoint
**Fix**: Verify the API is saving companyName/jobTitle fields

### **Issue 3: Data Not Being Fetched**
**Symptoms**: API test shows empty values
**Solution**: Check if the API endpoint returns the fields
**Fix**: Verify the backend is returning companyName/jobTitle

### **Issue 4: Data Not Being Displayed**
**Symptoms**: API test shows data, but display shows "Not assigned"
**Solution**: Check display logic
**Fix**: Verify the field names match (companyName vs company_name)

## 📋 **Debugging Checklist**

### **Agent Dashboard:**
- [ ] Company dropdown is populated
- [ ] Job dropdown is populated
- [ ] Selections are made
- [ ] Save button is clicked
- [ ] Console shows save data
- [ ] Console shows API response

### **Reports:**
- [ ] "Test API" button shows data
- [ ] "Add Test Data" button works
- [ ] Display shows assignments
- [ ] Console shows fetched data

### **Data Flow:**
- [ ] Agent Dashboard → Database
- [ ] Database → Reports
- [ ] Reports → Display

## 🚀 **Quick Fixes**

### **Fix 1: Force Data Refresh**
```javascript
// In Agent Dashboard, after saving
await fetchLeads(); // Refresh the leads data
```

### **Fix 2: Force UI Update**
```javascript
// In Reports, after fetching
setShortlistedLeads(updatedData); // Force state update
```

### **Fix 3: Test Data Structure**
```javascript
// Check if data structure matches
console.log('Lead data structure:', {
  companyName: lead.companyName,
  jobTitle: lead.jobTitle,
  companyId: lead.companyId,
  jobId: lead.jobId
});
```

## 📊 **Expected Data Structure**

The lead object should contain:
```javascript
{
  _id: "lead_id",
  name: "Candidate Name",
  status: "Shortlisted",
  companyName: "Company Name",    // Required for display
  jobTitle: "Job Title",         // Required for display
  companyId: "company_id",       // Optional
  jobId: "job_id"                // Optional
}
```

## 🎯 **Success Criteria**

The system is working correctly when:
1. **Agent Dashboard**: Company/job selections are saved
2. **Database**: Data is persisted with companyName/jobTitle
3. **Reports**: Data is fetched and displayed correctly
4. **Console**: All debug logs show the expected data

## 🔧 **Next Steps**

1. **Run the debugging process** using the tools provided
2. **Identify the specific issue** from the console logs
3. **Apply the appropriate fix** based on the issue
4. **Test the complete flow** from Agent Dashboard to Reports
5. **Verify the data persistence** is working correctly

The enhanced debugging tools will help you identify exactly where the issue is occurring in the data flow.
