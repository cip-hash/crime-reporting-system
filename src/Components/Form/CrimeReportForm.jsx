import React, { useState, useEffect } from "react";
import styles from './CrimeReportForm.module.scss';

const CrimeReportForm = () => {
  const [formData, setFormData] = useState({
    district: "",
    subdivision: "",
    incidentType: "",
    date: "",
    time: "",
    district: "",
    subdivision:"",
    title: "",
    description: "",
    suspectDetails: "",
    victimDetails: "",
    witnessDetails: "",
  });
  const [districts, setDistricts] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch Districts on component mount
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch("http://localhost:4000/get_districts");
        const data = await response.json();
        setDistricts(data.districts);
      } catch (error) {
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, []);

  // Fetch Subdivisions when District is selected
  useEffect(() => {
    if (formData.district) {
      const fetchSubdivisions = async () => {
        try {
          const response = await fetch(`http://localhost:4000/get_subdivisions?district=${encodeURIComponent(formData.district)}`);
          const data = await response.json();
          setSubdivisions(data.subdivisions);
        } catch (error) {
          console.error("Error fetching subdivisions:", error);
        }
      };
      fetchSubdivisions();
    } else {
      setSubdivisions([]);
    }
  }, [formData.district]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Step 1: Get new complaint ID from backend
      const complaintIdResponse = await fetch("http://localhost:4000/generate_complaint_id");
      const complaintIdData = await complaintIdResponse.json();
      const complaintIdGenerated = complaintIdData.complaintId;
      setComplaintId(complaintIdGenerated);
  
      // Step 2: Prepare form data
      const formPayload = new FormData();
      formPayload.append("complaintId", complaintIdGenerated);
      formPayload.append("district", formData.district);
      formPayload.append("subdivision", formData.subdivision);
      formPayload.append("incidentType", formData.incidentType);
      formPayload.append("date", formData.date);
      formPayload.append("time", formData.time);
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("suspectDetails", formData.suspectDetails);
      formPayload.append("victimDetails", formData.victimDetails);
      formPayload.append("witnessDetails", formData.witnessDetails);
      evidenceFiles.forEach((file) => formPayload.append("evidenceFiles", file));
  
      // Step 3: Submit complaint form
      const response = await fetch("http://localhost:4000/upload_complaint", {
        method: "POST",
        body: formPayload,
      });
  
      const result = await response.json();
      alert(result.message || "Complaint submitted successfully!");
  
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("An error occurred while submitting the complaint.");
    } finally {
      // Reset form
      setFormData({
        district: "",
        subdivision: "",
        incidentType: "",
        date: "",
        time: "",
        title: "",
        description: "",
        suspectDetails: "",
        victimDetails: "",
        witnessDetails: "",
      });
      setEvidenceFiles([]);
      setLoading(false);
    }
  };
  return (
    <div className={styles['crime-report-container']}>
      <div className={styles['crime-report-card']}>
        <h1 className={styles['form-title']}>Online Crime Report Form</h1>

        {complaintId && (
          <div className={styles['success-message']}>
            Complaint submitted successfully! Your Complaint ID: <b>{complaintId}</b>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles['form-body']}>

          {/* Incident Type */}
          <div className={styles['form-group']}>
            <label>Incident Type <span>*</span></label>
            <select name="incidentType" value={formData.incidentType} onChange={handleChange} required>
              <option value="">Select Incident Type</option>
              <option value="Murder">Murder</option>
              <option value="Murder for Gain">Murder for Gain</option>
              <option value="Dacoity">Dacoity</option>
              <option value="Robbery">Robbery</option>
              <option value="Grave Burglary">Grave Burglary</option>
              <option value="Grave Theft">Grave </option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Custom Title if "Other" */}
          {formData.incidentType === "Other" && (
            <div className={styles['form-group']}>
              <label>Incident Title <span>*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
          )}

          {/* Date & Time */}
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>Date <span>*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className={styles['form-group']}>
              <label>Time <span>*</span></label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} required />
            </div>
          </div>

         {/* 
          <div className={styles['form-group']}>
            <label>Location <span>*</span></label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>
          */} {/* District Dropdown */}
          <div className={styles['form-group']}>
            <label>District <span>*</span></label>
            <select name="district" value={formData.district} onChange={handleChange} required>
              <option value="">Select District</option>
              {districts.map((dist, idx) => (
                <option key={idx} value={dist}>{dist}</option>
              ))}
            </select>
          </div>

          {/* Subdivision Dropdown */}
          {formData.district && (
            <div className={styles['form-group']}>
              <label>Subdivision <span>*</span></label>
              <select name="subdivision" value={formData.subdivision} onChange={handleChange} required>
                <option value="">Select Subdivision</option>
                {subdivisions.map((sub, idx) => (
                  <option key={idx} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}
          {/* Description */}
          <div className={styles['form-group']}>
            <label>Description <span>*</span></label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} required></textarea>
          </div>

          {/* Details */}
          <div className={styles['form-row']}>
            {["suspectDetails", "victimDetails", "witnessDetails"].map((field, idx) => (
              <div key={idx} className={styles['form-group']}>
                <label>{field.replace(/([A-Z])/g, ' $1')}</label>
                <textarea name={field} rows="2" value={formData[field]} onChange={handleChange}></textarea>
              </div>
            ))}
          </div>

          {/* Evidence Upload Section */}
          <div className={styles['form-group']}>
            <label>Upload Evidence</label>
            <input type="file" id="hidden-file-input" onChange={handleFileChange} accept="image/*,video/*,application/pdf" style={{ display: "none" }} />

            <button
              type="button"
              className={styles['add-file-btn']}
              onClick={() => document.getElementById('hidden-file-input').click()}
            >
              Add File
            </button>

            {/* Display uploaded files with remove option */}
            {evidenceFiles.length > 0 && (
              <ul className={styles['file-list']}>
                {evidenceFiles.map((file, index) => (
                  <li key={index} className={styles['file-item']}>
                    {file.name}
                    <button
                      type="button"
                      className={styles['remove-file-btn']}
                      onClick={() => handleFileRemove(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <div className={styles['form-actions']}>
            <button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CrimeReportForm;