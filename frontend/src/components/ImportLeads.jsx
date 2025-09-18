import React, { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import axios from "axios";

export default function ImportLeads({ onImportSuccess }) {
  const [fileData, setFileData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const schemaFields = ["name", "phone", "location", "status"];

  // Handle file upload (CSV or Excel)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isCsv = fileName.endsWith('.csv');

    if (isExcel) {
      setFileType("excel");
      // Parse Excel file for mapping
      handleExcelMapping(file);
    } else if (isCsv) {
      setFileType("csv");
      // For CSV files, parse locally for mapping
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setFileData(results.data);
          setHeaders(Object.keys(results.data[0]));
        },
      });
    } else {
      alert("Please select a CSV or Excel file");
    }
  };

  // Handle Excel file parsing for mapping
  const handleExcelMapping = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (jsonData.length > 0) {
          setFileData(jsonData);
          setHeaders(Object.keys(jsonData[0]));
        } else {
          alert("Excel file appears to be empty or invalid");
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Error parsing Excel file. Please check the file format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };


  // Map header to schema field
  const handleMappingChange = (csvHeader, field) => {
    setMapping({ ...mapping, [csvHeader]: field });
  };

  // Submit import with mapping (works for both CSV and Excel)
  const handleImport = async () => {
    setUploading(true);

    // Map and validate data
    const mappedData = fileData.map((row) => {
      const obj = {};
      Object.keys(mapping).forEach((header) => {
        const field = mapping[header];
        if (field && row[header] !== undefined && row[header] !== '') {
          obj[field] = String(row[header]).trim();
        }
      });
      return obj;
    }).filter(row => {
      // Filter out rows that don't have required fields
      return row.name && row.phone;
    });

    // Check if we have valid data
    if (mappedData.length === 0) {
      alert("❌ No valid leads found. Please ensure you have mapped 'Name' and 'Phone' fields and they contain data.");
      setUploading(false);
      return;
    }

    // Show validation summary
    const invalidRows = fileData.length - mappedData.length;
    if (invalidRows > 0) {
      const proceed = confirm(`Found ${mappedData.length} valid leads out of ${fileData.length} rows.\n${invalidRows} rows will be skipped (missing name or phone).\n\nDo you want to proceed with importing ${mappedData.length} leads?`);
      if (!proceed) {
        setUploading(false);
        return;
      }
    }

    try {
      const res = await axios.post(
        "http://35.192.180.25:5000/api/crm/leads/import",
        { mappedData },
        { 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const { count, totalProcessed, skipped, errors } = res.data;
      let message = `✅ ${count} leads imported successfully from ${fileType.toUpperCase()} file!`;
      
      if (skipped > 0) {
        message += `\n\n📊 Summary:\n• Total rows processed: ${totalProcessed}\n• Successfully imported: ${count}\n• Skipped (invalid data): ${skipped}`;
      }
      
      if (errors && errors.length > 0) {
        message += `\n\n⚠️ Some issues found:\n${errors.join('\n')}`;
      }
      
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(""), 8000);
      setFileData([]);
      setHeaders([]);
      setMapping({});
      setFileType("");
      if (onImportSuccess) onImportSuccess();
    } catch (err) {
      console.error("Error importing leads:", err);
      console.error("Full error response:", err.response?.data);
      
      let errorMsg = "Unknown error";
      let errorDetails = "";
      
      if (err.response?.data) {
        errorMsg = err.response.data.message || err.response.data.error || "Server error";
        if (err.response.data.details) {
          errorDetails = `\n\nDetails: ${JSON.stringify(err.response.data.details, null, 2)}`;
        }
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorDetails = `\n\nErrors:\n${err.response.data.errors.join('\n')}`;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      alert(`❌ Failed to import leads: ${errorMsg}${errorDetails}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border mb-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-bold mb-2">Import Leads</h3>
      <p className="text-sm text-gray-600 mb-3">
        Upload CSV or Excel files and map columns to lead fields before importing
      </p>
      
      <input 
        type="file" 
        accept=".csv,.xlsx,.xls" 
        onChange={handleFileUpload}
        className="mb-3"
        disabled={uploading}
      />

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-3">
          {successMessage}
        </div>
      )}

      {uploading && (
        <div className="text-blue-600">Processing file...</div>
      )}

      {headers.length > 0 && (
        <div className="mt-3">
          <h4 className="font-semibold mb-2">
            Map {fileType.toUpperCase()} Columns to Lead Fields
          </h4>
          <div className="bg-white p-3 rounded border">
            <div className="mb-3 text-sm text-gray-600">
              Found {fileData.length} rows. Map your columns to the required lead fields:
            </div>
            {headers.map((header) => (
              <div key={header} className="flex items-center mb-2">
                <span className="w-40 font-medium">{header}</span>
                <span className="mx-2">→</span>
                <select
                  className="border p-1 rounded"
                  value={mapping[header] || ""}
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                >
                  <option value="">-- Ignore --</option>
                  {schemaFields.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {/* Data Preview */}
            <div className="mt-4">
              <h5 className="font-medium mb-2">Preview (first 3 rows):</h5>
              <div className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(mapping).filter(h => mapping[h]).map(header => (
                        <th key={header} className="text-left p-1 font-medium">
                          {mapping[header]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fileData.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.keys(mapping).filter(h => mapping[h]).map(header => (
                          <td key={header} className="p-1">
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleImport}
                disabled={uploading}
              >
                {uploading ? "Importing..." : `Import ${fileData.length} Leads`}
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => {
                  setFileData([]);
                  setHeaders([]);
                  setMapping({});
                  setFileType("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {headers.length === 0 && !uploading && (
        <div className="text-gray-500 text-sm">
          Select a CSV or Excel file to see column mapping options
        </div>
      )}
    </div>
  );
}
