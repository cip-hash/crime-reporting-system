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

// return (
//     <div>
//         <h2>Report a Crime</h2>
//         <form onSubmit={handleSubmit}>
//             <input type="text" placeholder="Incident Type" value={formData.incidentType} onChange={(e) => setFormData({...formData, incidentType: e.target.value})} />
//             <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
//             <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} />
//             <input type="text" placeholder="District" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} />
//             <input type="text" placeholder="Subdivision" value={formData.subdivision} onChange={(e) => setFormData({...formData, subdivision: e.target.value})} />
//             <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
//             <button type="submit">Submit Report</button>
//         </form>
//     </div>
// );
// };


  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6 mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">Online Crime Report Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Incident Type */}
        <div>
          <label className="font-semibold">Incident Type *</label>
          <select id="incidentType" value={formData.incidentType} onChange={handleChange} required className="w-full border p-2 rounded-md">
            <option value="">Select Incident Type</option>
            <option value="Theft">Theft</option>
            <option value="Assault">Assault</option>
            <option value="Fraud">Fraud</option>
            <option value="Harassment">Harassment</option>
          </select>
        </div>

        {/* Date & Time */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-semibold">Date *</label>
            <input type="date" id="date" value={formData.date} onChange={handleChange} required className="w-full border p-2 rounded-md" />
          </div>
          <div className="flex-1">
            <label className="font-semibold">Time *</label>
            <input type="time" id="time" value={formData.time} onChange={handleChange} required className="w-full border p-2 rounded-md" />
          </div>
        </div>

      
{/* District Dropdown */}
<label>
    Select District:
    <select
        value={formData.district}
        onChange={(e) => {
            setFormData({ ...formData, district: e.target.value, subdivision: "" }); // Reset subdivision when district changes
            console.log("✅ Selected District:", e.target.value); // Debugging line
        }}
    >
        <option value="">-- Select District --</option>
        {districts.map((district, index) => (
            <option key={index} value={district}>
                {district}
            </option>
        ))}
    </select>
</label>

{/* Subdivision Dropdown */}
<label>
    Select Subdivision:
    <select
        value={formData.subdivision}
        onChange={(e) => {
            setFormData({ ...formData, subdivision: e.target.value });
            console.log("✅ Selected Subdivision:", e.target.value); // Debugging line
        }}
        disabled={!formData.district || subdivisions.length === 0}
    >
        <option value="">-- Select Subdivision --</option>
        {subdivisions.map((subdivision, index) => (
            <option key={index} value={subdivision}>
                {subdivision}
            </option>
        ))}
    </select>
</label>


        {/* Description */}
        <div>
          <label className="font-semibold">Description *</label>
          <textarea id="description" value={formData.description} onChange={handleChange} required className="w-full border p-2 rounded-md" rows="3"></textarea>
        </div>

        {/* Suspect, Victim, Witness */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="font-semibold">Suspect Details</label>
            <input type="text" id="suspect" value={formData.suspect} onChange={handleChange} className="w-full border p-2 rounded-md" />
          </div>
          <div className="flex-1">
            <label className="font-semibold">Victim Details</label>
            <input type="text" id="victim" value={formData.victim} onChange={handleChange} className="w-full border p-2 rounded-md" />
          </div>
        </div>

        <div>
          <label className="font-semibold">Witness Details</label>
          <input type="text" id="witness" value={formData.witness} onChange={handleChange} className="w-full border p-2 rounded-md" />
        </div>

        {/* File Upload */}
        <div>
          <label className="font-semibold">Upload Evidence</label>
          <input type="file" id="evidence" multiple onChange={handleFileChange} className="w-full border p-2 rounded-md" />
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
          Submit Report
        </button>
      </form>
    </div>
  );
};


export default ReportCrime;