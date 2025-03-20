import React, { useState, useEffect } from "react";

const ReportCrime = () => {
  const [formData, setFormData] = useState({
    incidentType: "",
    date: "",
    time: "",
    district: "",
    subdivision: "",
    description: "",
    suspect: "",
    victim: "",
    witness: "",
    evidence: [],
  });

  const [districts, setDistricts] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  //Fetch Logged-in user-id
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser")); // Fetch user data
    if (user) {
        setLoggedInUser(user);
    }
  }, []);

  // Fetch districts from backend
  useEffect(() => {
    const fetchDistricts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/crime/districts");
            if (!response.ok) throw new Error("Failed to fetch districts");
            const data = await response.json();
            setDistricts(data.map(d => d.district)); // Ensure proper mapping
        } catch (error) {
            console.error("❌ Error fetching districts:", error);
        }
    };

    fetchDistricts();
  }, []);

  // ✅ Fetch Subdivisions When District Changes
  useEffect(() => {
    if (!formData.district) {
        setSubdivisions([]);
        return;
    }

    const fetchSubdivisions = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/crime/subdivisions?district=${formData.district}`);
            if (!response.ok) throw new Error("Failed to fetch subdivisions");
            const data = await response.json();
            setSubdivisions(data); // Assuming backend returns an array of subdivision names
        } catch (error) {
            console.error("❌ Error fetching subdivisions:", error);
        }
    };

    fetchSubdivisions();
  }, [formData.district]); 

  // Set default date and time
  useEffect(() => {
    const today = new Date();
    setFormData((prev) => ({
      ...prev,
      date: today.toISOString().split("T")[0],
      time: today.toTimeString().slice(0, 5),
    }));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle file uploads
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      evidence: Array.from(e.target.files),
    }));
  };

  //function that work after form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📌 Form Data Before Submission:", formData);

    // Ensure userId is available
    if (!loggedInUser || !loggedInUser.id) {
        alert("⚠️ User is not logged in. Please log in to submit a report.");
        console.error("❌ Missing user ID");
        return;
    }

    // Validate required fields
    if (!formData.incidentType || !formData.date || !formData.time ||
        !formData.district || !formData.subdivision || !formData.description) {
        alert("⚠️ Please fill all required fields.");
        console.error("❌ Missing required fields:", formData);
        return;
    }

    try {
        // Add userId to the form data
        const reportData = {
            ...formData,
            userId: loggedInUser.id,  // Include user ID
        };

        console.log("📌 Final Data Sent to Backend:", reportData);

        const response = await fetch("http://localhost:5000/api/crime/report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reportData),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            console.error("❌ Backend Error:", errorResponse);
            throw new Error(`HTTP error! Status: ${response.status} - ${errorResponse.error}`);
        }

        console.log("✅ Crime Report Submitted Successfully");
        alert("Crime Report Submitted Successfully!");

        // Reset form
        setFormData({
            incidentType: "",
            date: "",
            time: "",
            district: "",
            subdivision: "",
            description: "",
            suspect: "",
            victim: "",
            witness: "",
            evidence: [],
        });

    } catch (error) {
        console.error("❌ Error submitting crime report:", error);
        alert("Failed to submit crime report. Check console for details.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 rounded-t-lg">
        <h2 className="text-2xl font-bold text-white text-center">Online Crime Report Form</h2>
        <p className="text-blue-100 text-center text-sm mt-1">All information will be kept confidential</p>
      </div>

      <div className="bg-white p-6 rounded-b-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Information Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Incident Information
            </h3>
            
            {/* Incident Type */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Incident Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select 
                  id="incidentType" 
                  value={formData.incidentType} 
                  onChange={handleChange} 
                  required 
                  className="block w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
                >
                  <option value="">Select Incident Type</option>
                  <option value="Theft">Theft</option>
                  <option value="Assault">Assault</option>
                  <option value="Fraud">Fraud</option>
                  <option value="Harassment">Harassment</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date" 
                  id="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <input 
                  type="time" 
                  id="time" 
                  value={formData.time} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location Details
            </h3>
            
            {/* District Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="district"
                  value={formData.district}
                  onChange={(e) => {
                    setFormData({ ...formData, district: e.target.value, subdivision: "" });
                    console.log("✅ Selected District:", e.target.value);
                  }}
                  required
                  className="block w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
                >
                  <option value="">-- Select District --</option>
                  {districts.map((district, index) => (
                    <option key={index} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Subdivision Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Subdivision <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="subdivision"
                  value={formData.subdivision}
                  onChange={(e) => {
                    setFormData({ ...formData, subdivision: e.target.value });
                    console.log("✅ Selected Subdivision:", e.target.value);
                  }}
                  disabled={!formData.district || subdivisions.length === 0}
                  required
                  className={`block w-full px-4 py-2 pr-8 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !formData.district || subdivisions.length === 0
                      ? "bg-gray-100 text-gray-500 border border-gray-300 cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  <option value="">-- Select Subdivision --</option>
                  {subdivisions.map((subdivision, index) => (
                    <option key={index} value={subdivision}>
                      {subdivision}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              {!formData.district && (
                <p className="text-xs text-blue-600 mt-1">Please select a district first</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Crime Details
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea 
                id="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                rows="4"
                placeholder="Please provide detailed information about the incident..."
              ></textarea>
            </div>

            {/* Suspect, Victim, Witness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Suspect Details
                </label>
                <input 
                  type="text" 
                  id="suspect" 
                  value={formData.suspect} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Description of suspect(s) if any"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Victim Details
                </label>
                <input 
                  type="text" 
                  id="victim" 
                  value={formData.victim} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Details of victim(s) if different from reporter"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Witness Details
              </label>
              <input 
                type="text" 
                id="witness" 
                value={formData.witness} 
                onChange={handleChange} 
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="Information about any witnesses"
              />
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Evidence
            </h3>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Upload Evidence (Photos, Documents, etc.)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="evidence" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload files</span>
                      <input 
                        id="evidence" 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="sr-only" 
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>
              {formData.evidence.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{formData.evidence.length} file(s) selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md transition-all flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportCrime;