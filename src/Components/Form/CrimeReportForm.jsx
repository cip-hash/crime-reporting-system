import React, { useState } from "react";
import styles from './CrimeReportForm.module.scss'; // SCSS module import

const CrimeReportForm = () => {
  const [formData, setFormData] = useState({
    incidentType: "",
    date: "",
    time: "",
    location: "",
    title: "",
    description: "",
    suspectDetails: "",
    victimDetails: "",
    witnessDetails: "",
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to generate complaint ID
  const generateComplaintId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `CMP${timestamp}${randomNum}`;
  };

  // Form field handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file selection and add file to state
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEvidenceFiles((prevFiles) => [...prevFiles, file]);
    }
    e.target.value = ""; // Reset input value to allow same file to be selected again
  };

  // Remove specific file
  const handleFileRemove = (index) => {
    setEvidenceFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Form submission
  // Form submission with API call
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  const complaintIdGenerated = generateComplaintId();
  setComplaintId(complaintIdGenerated);

  try {
    // Create FormData to send both fields and files
    const formPayload = new FormData();
    formPayload.append("complaintId", complaintIdGenerated);
    formPayload.append("incidentType", formData.incidentType);
    formPayload.append("date", formData.date);
    formPayload.append("time", formData.time);
    formPayload.append("location", formData.location);
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    formPayload.append("suspectDetails", formData.suspectDetails);
    formPayload.append("victimDetails", formData.victimDetails);
    formPayload.append("witnessDetails", formData.witnessDetails);

    // Append all files
    evidenceFiles.forEach((file) => {
      formPayload.append("evidenceFiles", file);
    });

    // Make API POST call
    const response = await fetch("http://localhost:4000/upload_complaint", {
      method: "POST",
      body: formPayload,
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message); // Show success message
    } else {
      alert(result.message || "Failed to submit complaint.");
    }

  } catch (error) {
    console.error("Error submitting complaint:", error);
    alert("An error occurred while submitting the complaint.");
  } finally {
    // Reset form and file inputs after submission
    setFormData({
      incidentType: "",
      date: "",
      time: "",
      location: "",
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
              <option value="Theft">Theft</option>
              <option value="Assault">Assault</option>
              <option value="Cybercrime">Cybercrime</option>
              <option value="Harassment">Harassment</option>
              <option value="Domestic Violence">Domestic Violence</option>
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

          {/* Location */}
          <div className={styles['form-group']}>
            <label>Location <span>*</span></label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
          </div>

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
