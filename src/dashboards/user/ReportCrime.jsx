import React, { useState, useEffect } from "react";

const ReportCrime = () => {
  const [formData, setFormData] = useState({
    // Complainant Information
    complainantName: "",
    complainantPhone: "",
    //complainantEmail: "",
    relationToVictim: "",
    
    // Victim Information
    victimName: "",
    victimPhone: "",
    victimAgeGender: "",
    victimRelation: "",
    
    // Incident Details
    incidentType: "",
    title: "",
    date: "",
    time: "",
    district: "",
    subdivision: "",
    exactAddress: "",
    description: "",
    
    // Suspect Information
    suspect: "",
    suspectMarks: "",
    suspectComplexion: "",
    suspectAddress: "",
    
    // Witness Details
    witness: "",
    witnessContact: "",
    witnessStatement: "",
    
    // Existing fields
    victim: "",
  });
  
  const [complaintId, setComplaintId] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  
  //Fetch Logged-in user-id
  useEffect(() => {
    const user = sessionStorage.getItem("user_email"); // Fetch user data
    if (user) {setLoggedInUser(user);}
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
    const file = e.target.files[0];
    if (file) {
      setEvidenceFiles((prevFiles) => [...prevFiles, file]);
    }
    e.target.value = "";
  };
  
  const handleFileRemove = (index) => {
    setEvidenceFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  
  //function that work after form submission
  const handleSubmit = async (e) => {   
    e.preventDefault();
    const formPayload = new FormData();
    
    const complaintIdResponse = await fetch("http://localhost:5000/api/crime/generate_complaint_id");
    const complaintIdGenerated = await complaintIdResponse.json();
    setComplaintId(complaintIdGenerated.complaintId);
    
    // Add all form data to payload
    formPayload.append("complaintId", complaintIdGenerated.complaintId);
    
    // Complainant Info
    formPayload.append("complainantName", formData.complainantName);
    formPayload.append("complainantPhone", formData.complainantPhone);
    formPayload.append("relationToVictim", formData.relationToVictim);
    
    // Victim Info
    formPayload.append("victimName", formData.victimName);
    formPayload.append("victimPhone", formData.victimPhone);
    formPayload.append("victimAgeGender", formData.victimAgeGender);
    formPayload.append("victimRelation", formData.victimRelation);
    
    // Incident Details
    formPayload.append("district", formData.district);
    formPayload.append("subdivision", formData.subdivision);
    formPayload.append("exactAddress", formData.exactAddress);
    formPayload.append("incidentType", formData.incidentType);
    formPayload.append("date", formData.date);
    formPayload.append("time", formData.time);
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    
    // Suspect Info
    formPayload.append("suspect", formData.suspect);
    formPayload.append("suspectMarks", formData.suspectMarks);
    formPayload.append("suspectComplexion", formData.suspectComplexion);
    formPayload.append("suspectAddress", formData.suspectAddress);
    
    // Witness Info
    formPayload.append("witness", formData.witness);
    formPayload.append("witnessContact", formData.witnessContact);
    formPayload.append("witnessStatement", formData.witnessStatement);
    
    // Legacy fields (kept for compatibility)
    formPayload.append("victim", formData.victim);
    
    // Evidence files
    evidenceFiles.forEach((file) => formPayload.append("evidenceFiles", file));
    
    // 🔹 Fetch email from sessionStorage instead of adding to form payload
    const userEmail = sessionStorage.getItem("user_email");

    console.log("📌 Form Data Before Submission:", formPayload);
    
    // Ensure user email is available
    if (!userEmail) {
        alert("⚠️ User is not logged in. Please log in to submit a report.");
        console.error("❌ Missing user email");
        return;
    }
    
    // Validate required fields
    if (!formData.incidentType || !formData.date || !formData.time ||
        !formData.district || !formData.subdivision || !formData.description ||
        !formData.complainantName || !formData.complainantPhone) {
        alert("⚠️ Please fill all required fields.");
        console.error("❌ Missing required fields:", formData);
        return;
    }
    
    try {
        const response = await fetch("http://localhost:5000/api/crime/report", {
            method: "POST",
            body: formPayload,
            headers: {
                "user-email": userEmail, // 🔹 Send email in headers instead of body
            },
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
            complainantName: "",
            complainantPhone: "",
            relationToVictim: "",
            victimName: "",
            victimPhone: "",
            victimAgeGender: "",
            victimRelation: "",
            incidentType: "",
            title: "",
            date: "",
            time: "",
            district: "",
            subdivision: "",
            exactAddress: "",
            description: "",
            suspect: "",
            suspectMarks: "",
            suspectComplexion: "",
            suspectAddress: "",
            witness: "",
            witnessContact: "",
            witnessStatement: "",
            victim: "",
        });
        setEvidenceFiles([]);
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
        {complaintId && (
          <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-200 text-blue-800">
            Complaint submitted successfully! Your Complaint ID: <b>{complaintId}</b>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1️⃣ Complainant Information Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
               Complainant Information (Person Filing the Complaint)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="complainantName" 
                  value={formData.complainantName} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  id="complainantPhone" 
                  value={formData.complainantPhone} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your phone number" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email Address (Optional but useful for updates)
                </label>
                <input 
                  type="email" 
                  id="complainantEmail" 
                  value={formData.complainantEmail} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="For case updates (optional)" 
                />
              </div> */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Relation to Victim (If filing on behalf of someone else)
                </label>
                <input 
                  type="text" 
                  id="relationToVictim" 
                  value={formData.relationToVictim} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Self, Family, Witness, etc." 
                />
              </div>
            </div>
          </div>
          
          {/* 2️⃣ Victim Information Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
               Victim Information 
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Full Name
                </label>
                <input 
                  type="text" 
                  id="victimName" 
                  value={formData.victimName} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Victim's full name if not yourself" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone Number (Optional, if different from complainant)
                </label>
                <input 
                  type="tel" 
                  id="victimPhone" 
                  value={formData.victimPhone} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Victim's contact number" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Age/Gender (Important for case classification)
                </label>
                <input 
                  type="text" 
                  id="victimAgeGender" 
                  value={formData.victimAgeGender} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., 35/Male, 28/Female" 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Relation to Complainant
                </label>
                <input 
                  type="text" 
                  id="victimRelation" 
                  value={formData.victimRelation} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Family, Friend, Neighbor, etc." 
                />
              </div>
            </div>
            
            {/* Keeping the existing victim field for compatibility */}
            <input type="hidden" id="victim" value={formData.victim} onChange={handleChange} />
          </div>

          {/* 3️⃣ Incident Information Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
               Incident Details 
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
                  <option value="Harassment">Harassment</option>
                  <option value="Murder">Murder</option>
                  <option value="Murder for Gain">Murder for Gain</option>
                  <option value="Dacoity">Dacoity</option>
                  <option value="Robbery">Robbery</option>
                  <option value="Grave Burglary">Grave Burglary</option>
                  <option value="Grave Theft">Grave Theft</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {formData.incidentType === "Other" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Incident Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Please specify the type of incident"
                />
              </div>
            )}
            
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
            
            {/* Location fields */}
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
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Exact Address <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="exactAddress" 
                value={formData.exactAddress} 
                onChange={handleChange} 
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="Street address, landmark, etc." 
              />
            </div>
            
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
                placeholder="What happened? Who was involved? Any injuries or damages?"
              ></textarea>
            </div>
          </div>

          {/* 4️⃣ Suspect Information Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
               Suspect Information 
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Name & Description (If available)
                </label>
                <input 
                  type="text" 
                  id="suspect" 
                  value={formData.suspect} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Name, age, gender, height, etc." 
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Identifying Marks
                </label>
                <input 
                  type="text" 
                  id="suspectMarks" 
                  value={formData.suspectMarks} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Tattoos, scars, etc." 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Complexion
                </label>
                <input 
                  type="text" 
                  id="suspectComplexion" 
                  value={formData.suspectComplexion} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 px-4 py-2"
                  />
                </div>
                    </div>

<div>
  <label className="block text-gray-700 text-sm font-medium mb-1">
    Last Known Address (If known)
  </label>
  <input 
    type="text" 
    id="suspectAddress" 
    value={formData.suspectAddress} 
    onChange={handleChange} 
    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
    placeholder="Suspect's address or area they frequent" 
  />
</div>
</div>

{/* 5️⃣ Witness Details Section */}
<div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
     Witness Details 
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Name & Contact Details
      </label>
      <input 
        type="text" 
        id="witness" 
        value={formData.witness} 
        onChange={handleChange} 
        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
        placeholder="Witness name" 
      />
    </div>
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Contact Number
      </label>
      <input 
        type="text" 
        id="witnessContact" 
        value={formData.witnessContact} 
        onChange={handleChange} 
        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
        placeholder="Witness contact number" 
      />
    </div>
  </div>
  
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Statement (Brief description of what they saw or heard)
    </label>
    <textarea 
      id="witnessStatement" 
      value={formData.witnessStatement} 
      onChange={handleChange} 
      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
      rows="3" 
      placeholder="What did the witness observe?"
    ></textarea>
  </div>
</div>

{/* 6️⃣ Evidence Submission Section */}
<div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
     Evidence Submission
  </h3>
  
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-medium mb-1">
      Upload Photos, Videos, or Documents
    </label>
    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
      <div className="space-y-1 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex text-sm text-gray-600">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
            <span>Upload a file</span>
            <input 
              id="file-upload" 
              name="file-upload" 
              type="file" 
              className="sr-only" 
              onChange={handleFileChange}
              accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">
          PNG, JPG, PDF, DOC up to 10MB
        </p>
      </div>
    </div>
  </div>
  
  {evidenceFiles.length > 0 && (
    <div className="mb-4">
      <h4 className="font-medium text-sm text-gray-700 mb-2">Uploaded Files:</h4>
      <ul className="space-y-2">
        {evidenceFiles.map((file, index) => (
          <li key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">{file.name}</span>
            </div>
            <button 
              type="button" 
              onClick={() => handleFileRemove(index)}
              className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

{/* Submit Button */}
<div className="flex justify-center">
  <button 
    type="submit" 
    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
  >
    Submit Crime Report
  </button>
</div>
 


</form>
      </div>
    </div>
  );
};

export default ReportCrime;



