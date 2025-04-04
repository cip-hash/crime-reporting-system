import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FinalReportForm from "./FinalReportForm";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PoliceViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const complaintRef = useRef(null);

  // Notes related state
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState("");
  
  // Final report related state
  const [showFinalReportForm, setShowFinalReportForm] = useState(false);
  const [currentComplaintForReport, setCurrentComplaintForReport] = useState(null);

  // Add these state variables with your other useState declarations
const [finalReports, setFinalReports] = useState({});
const [loadingReports, setLoadingReports] = useState({});

  const navigate = useNavigate();

  //for crime suspect
  const [crimeTypeInput, setCrimeTypeInput] = useState("");
  const [markInput, setMarkInput] = useState("");
  const [complexionInput, setComplexionInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

  const policeDistrict = sessionStorage.getItem("policedistrict");
  const policeSubdivision = sessionStorage.getItem("policesubdivision");
  const policeOfficerId = sessionStorage.getItem("policeid");
  console.log("Officer ID from session storage:", policeOfficerId);

  // Add this to your useEffect that runs on component mount
  useEffect(() => {
    if (!policeOfficerId) {
      console.warn("Officer ID is missing in session storage");
      // Don't set an error here, just log a warning
    }
    fetchComplaints();
  }, [refreshKey]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (complaintRef.current && !complaintRef.current.contains(event.target)) {
        setSelectedComplaintId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch detailed complaint info when selected complaint is under investigation
  useEffect(() => {
    if (selectedComplaintId) {
      const selectedComplaint = complaints.find(c => c.complaint_id === selectedComplaintId);
      if (selectedComplaint && selectedComplaint.status === "Under Investigation") {
        fetchComplaintDetails(selectedComplaintId);
        fetchNotes(selectedComplaintId);
        
      } else {
        setComplaintDetails(null);
        setDetailsError(null);
        setNotes([]);
      }
    }
  }, [selectedComplaintId, complaints]);

  const fetchComplaints = async () => {
    if (!policeDistrict || !policeSubdivision) {
      setError("District or subdivision not found. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get("http://localhost:5000/api/police/get_complaints", {
        params: { district: policeDistrict, subdivision: policeSubdivision },
      });
      setComplaints(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch complaints. Try again later.");
      setLoading(false);
      console.error("Error fetching complaints:", error);
    }
  };

  const fetchComplaintDetails = async (complaintId) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      
      console.log(`Fetching details for complaint: ${complaintId}`);
      
      const response = await axios.get(`http://localhost:5000/api/police/complaint_details/${complaintId}`);
      
      console.log("Response data:", response.data);
      setComplaintDetails(response.data);
      setDetailsLoading(false);
    } catch (error) {
      setDetailsLoading(false);
      setDetailsError("Failed to fetch complaint details. Please try again.");
      
      console.error("Error fetching complaint details:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Request error:", error.message);
      }
    }
  };

  // Notes related functions
  const fetchNotes = async (complaintId) => {
    try {
      setNotesLoading(true);
      setNotesError(null);
      
      const response = await axios.get(`http://localhost:5000/api/police/complaint_notes/${complaintId}`);
      
      setNotes(response.data);
      setNotesLoading(false);
    } catch (error) {
      setNotesLoading(false);
      setNotesError("Failed to fetch notes. Please try again.");
      console.error("Error fetching notes:", error);
    }
  };

  // Fixed addNote function
  const addNote = async () => {
    if (!noteText.trim()) {
      alert("Note cannot be empty");
      return;
    }
    
    // Get officer ID and ensure it's a number
    let officerId = parseInt(policeOfficerId, 10);
    
    if (isNaN(officerId)) {
      // Try to get from session storage again as a fallback
      const fallbackId = parseInt(sessionStorage.getItem("policeid"), 10);
      
      if (isNaN(fallbackId)) {
        // If still not available, show error and offer to continue with a placeholder
        const confirmAdd = window.confirm(
          "Officer ID is missing or invalid. Continue with a temporary ID? For proper tracking, please log out and log in again."
        );
        if (!confirmAdd) return;
        officerId = 999; // Use a placeholder ID
      } else {
        officerId = fallbackId;
      }
    }
    
    try {
      setNotesLoading(true);
      
      const noteData = {
        complaint_id: selectedComplaintId,
        officer_id: officerId,
        note_text: noteText
      };
      
      console.log("Sending note data:", noteData);
      
      const response = await axios.post("http://localhost:5000/api/police/add_note", noteData);
      
      console.log("Note added response:", response.data);
      
      setNoteText("");
      setIsAddingNote(false);
      fetchNotes(selectedComplaintId);
      alert("Note added successfully!");
    } catch (error) {
      console.error("Error adding note:", error);
      
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Failed to add note: ${error.response.data.error}`);
      } else {
        alert("Failed to add note. Please try again.");
      }
    } finally {
      setNotesLoading(false);
    }
  };

  const updateNote = async (noteId) => {
    if (!editNoteText.trim()) {
      alert("Note cannot be empty");
      return;
    }
    
    try {
      await axios.put(`http://localhost:5000/api/police/update_note/${noteId}`, {
        note_text: editNoteText
      });
      
      setEditingNoteId(null);
      setEditNoteText("");
      fetchNotes(selectedComplaintId);
      alert("Note updated successfully!");
    } catch (error) {
      alert("Failed to update note. Please try again.");
      console.error("Error updating note:", error);
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/police/delete_note/${noteId}`);
      
      fetchNotes(selectedComplaintId);
      alert("Note deleted successfully!");
    } catch (error) {
      alert("Failed to delete note. Please try again.");
      console.error("Error deleting note:", error);
    }
  };

  const handleStatusUpdate = async (complaintId, newStatus) => {
    if (!newStatus) {
      alert("Please select a status before updating.");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/police/update_complaint_status/${complaintId}`, {
        status: newStatus,
      });
      alert(`Status updated to "${newStatus}" successfully!`);
      setRefreshKey((prev) => prev + 1);
      
      // If status is being updated to "Under Investigation", fetch details immediately
      if (newStatus === "Under Investigation") {
        fetchComplaintDetails(complaintId);
      }
    } catch (error) {
      alert("Failed to update status.");
      console.error("Error updating status:", error);
    }
  };

  const handleStartInvestigation = async (complaintId) => {
    await handleStatusUpdate(complaintId, "Under Investigation");
  };
  
  // New function to handle opening the final report form
  const handleOpenFinalReportForm = (complaint) => {
    setCurrentComplaintForReport(complaint);
    setShowFinalReportForm(true);
  };
  
  // Function to handle form close
  const handleCloseFinalReportForm = () => {
    setShowFinalReportForm(false);
    setCurrentComplaintForReport(null);
  };
  
  // Function to handle successful form submission
  const handleFinalReportSubmitted = () => {
    setShowFinalReportForm(false);
    setCurrentComplaintForReport(null);
    // Refresh the complaints list
    setRefreshKey((prev) => prev + 1);
    alert("Final report submitted successfully!");
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Accepted", "Rejected"];
      case "Accepted":
        return ["Under Investigation"];
      case "Under Investigation":
        return ["Closed"];
      default:
        return [];
    }
  };

  // Helper function to check if a field exists and is not null/empty
  const hasValue = (obj, field) => {
    return obj && obj[field] !== null && obj[field] !== undefined && obj[field] !== "";
  };

  // Format date and time for notes
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  };

  // Render notes section
  const renderNotes = () => {
    if (notesLoading) {
      return <p className="text-center my-3">Loading notes...</p>;
    }
    
    if (notesError) {
      return (
        <div className="my-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-center">{notesError}</p>
          <button 
            className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
            onClick={() => fetchNotes(selectedComplaintId)}
          >
            Retry Loading Notes
          </button>
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-md">Investigation Notes ({notes.length})</h4>
          {!isAddingNote && (
            <button
              className="p-1 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-800 text-sm"
              onClick={() => setIsAddingNote(true)}
            >
              Add New Note
            </button>
          )}
        </div>
        
        {isAddingNote && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full p-2 border rounded-lg mb-2"
              rows="3"
              placeholder="Enter investigation note..."
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                className="p-1 px-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 text-sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNoteText("");
                }}
              >
                Cancel
              </button>
              <button
                className="p-1 px-3 bg-green-600 text-white rounded-lg hover:bg-green-800 text-sm"
                onClick={addNote}
              >
                Save Note
              </button>
            </div>
          </div>
        )}
        
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center italic">No notes added yet.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.note_id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                {editingNoteId === note.note_id ? (
                  <div>
                    <textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      className="w-full p-2 border rounded-lg mb-2"
                      rows="3"
                    ></textarea>
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-1 px-3 bg-gray-500 text-white rounded-lg hover:bg-gray-700 text-sm"
                        onClick={() => {
                          setEditingNoteId(null);
                          setEditNoteText("");
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="p-1 px-3 bg-green-600 text-white rounded-lg hover:bg-green-800 text-sm"
                        onClick={() => updateNote(note.note_id)}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mb-2">{note.note_text}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-gray-500">
                        <p>By: {note.officer_name || "Officer #" + note.officer_id}</p>
                        <p>Added: {formatDateTime(note.created_at)}</p>
                        {note.updated_at !== note.created_at && (
                          <p className="italic">Updated: {formatDateTime(note.updated_at)}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="p-1 px-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 text-xs"
                          onClick={() => {
                            setEditingNoteId(note.note_id);
                            setEditNoteText(note.note_text);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="p-1 px-2 bg-red-500 text-white rounded-lg hover:bg-red-700 text-xs"
                          onClick={() => deleteNote(note.note_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderDetailedInvestigation = (complaint) => {
    if (complaint.status !== "Under Investigation") {
      return null;
    }

    if (detailsLoading) {
      return (
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-center">Loading investigation details...</p>
        </div>
      );
    }

    if (detailsError) {
      return (
        <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-center text-red-600">{detailsError}</p>
          <button 
            className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
            onClick={() => fetchComplaintDetails(complaint.complaint_id)}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!complaintDetails) {
      return (
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-center">No investigation details available.</p>
        </div>
      );
    }

    // Merge data from complaint and complaintDetails to ensure we have all the information
    const mergedData = { ...complaint, ...complaintDetails };
    /*const fetchFinalReport = async (complaintId) => {
      // Set loading state for this specific complaint
      setLoadingReports(prev => ({...prev, [complaintId]: true}));
      
      try {
        const response = await axios.get(`http://localhost:5000/api/police/final-report/${complaintId}`);
        
        if (response.data) {
          setFinalReports(prev => ({...prev, [complaintId]: response.data}));
        }
      } catch (error) {
        console.error("Error fetching final report:", error);
        alert("Failed to fetch the final report. Please try again.");
      } finally {
        setLoadingReports(prev => ({...prev, [complaintId]: false}));
      }
    }; */
    
    // Add this function to generate and download the PDF
    const downloadFinalReport = async (complaintId) => {
      try {
        // Always fetch fresh data when downloading
        setLoadingReports(prev => ({...prev, [complaintId]: true}));
        
        const response = await axios.get(`http://localhost:5000/api/police/final-report/${complaintId}`);
        
        if (!response.data) {
          alert("Report data not available. Please try again.");
          setLoadingReports(prev => ({...prev, [complaintId]: false}));
          return;
        }
        
        // Store the fetched report
        const reportData = response.data;
        setFinalReports(prev => ({...prev, [complaintId]: reportData}));
        
        // Continue with PDF generation...
        const reportDiv = document.createElement('div');
        const complaint = complaints.find(c => c.complaint_id === complaintId);
        
        // Debug
        console.log("Report data for PDF:", reportData);
        console.log("Complaint data:", complaint);
        
        // Make sure all required fields have fallback values to prevent "undefined" in the PDF
        reportDiv.innerHTML = `
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="text-align: center; margin-bottom: 20px;">POLICE FINAL REPORT</h2>
            
            <div style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
              <p><strong>Complaint ID:</strong> ${complaintId}</p>
              <p><strong>Officer ID:</strong> ${reportData.officer_id || 'N/A'}</p>
              <p><strong>Incident Type:</strong> ${complaint?.incident_type || 'N/A'}</p>
              <p><strong>Date Filed:</strong> ${complaint?.date ? new Date(complaint.date).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Final Status:</strong> ${reportData.final_status || 'N/A'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="margin-bottom: 10px;">Final Report</h3>
              <p style="white-space: pre-wrap;">${reportData.report || 'No report content available'}</p>
            </div>
            
            ${reportData.remarks ? `
              <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 10px;">Remarks</h3>
                <p style="white-space: pre-wrap;">${reportData.remarks}</p>
              </div>
            ` : ''}
            
            <div style="margin-top: 40px;">
              <p style="text-align: right;">Date: ${reportData.created_at ? new Date(reportData.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              <p style="text-align: right; margin-top: 30px;">_______________________</p>
              <p style="text-align: right;">Officer Signature</p>
            </div>
          </div>
        `;
        
        document.body.appendChild(reportDiv);
        
        // Generate PDF from the temporary div
        const canvas = await html2canvas(reportDiv, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm (210mm)
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`Final_Report_${complaintId}.pdf`);
        
        // Remove the temporary div
        document.body.removeChild(reportDiv);
        
      }  catch (error) {
        console.error("Error in downloadFinalReport:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          alert(`Failed to generate PDF: ${error.response.data.error || error.message}`);
        } else {
          alert(`Failed to generate PDF: ${error.message}`);
        }
      } finally {
        setLoadingReports(prev => ({...prev, [complaintId]: false}));
      }
    };
    
    // Add a new function to check if the status indicates a final report exists
    // const hasFinalReport = (status) => {
    //   return status.startsWith("Closed(") || status === "Closed";
    // };
    
    // Modify the renderClosedComplaintActions function to include download option
   
  
    // Rest of your component remains the same
  

    return (
      <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-bold mb-3">Investigation Details</h3>
        <p><b>Police Station:</b> {mergedData.police_station || `${mergedData.district} - ${mergedData.subdivision}`}</p>
        <p><b>Case Title:</b> {mergedData.title || mergedData.incident_type}</p>
        
        <div className="mt-3 p-3 bg-white rounded border">
          <h4 className="font-bold text-md mb-2">Case Information:</h4>
          
          {/* Complainant Information Section */}
          <div className="mb-3">
            <p className="font-medium text-gray-700">Complainant Information:</p>
            {hasValue(mergedData, 'complainant_name') && <p><b>Name:</b> {mergedData.complainant_name}</p>}
            {hasValue(mergedData, 'complainant_phone') && <p><b>Phone:</b> {mergedData.complainant_phone}</p>}
            {hasValue(mergedData, 'complainant_email') && <p><b>Email:</b> {mergedData.complainant_email}</p>}
            {hasValue(mergedData, 'relation_to_victim') && <p><b>Relation to Victim:</b> {mergedData.relation_to_victim}</p>}
          </div>
          
          {/* Incident Details Section */}
          <div className="mb-3">
            <p className="font-medium text-gray-700">Incident Details:</p>
            <p><b>Incident Type:</b> {mergedData.incident_type}</p>
            {hasValue(mergedData, 'exact_address') && <p><b>Location:</b> {mergedData.exact_address}</p>}
            <p><b>Description:</b> {mergedData.description}</p>
          </div>
          
          {/* Suspect Information Section - Only show if any suspect field has data */}
          {(hasValue(mergedData, 'suspect') || hasValue(mergedData, 'suspect_marks') || 
            hasValue(mergedData, 'suspect_complexion') || hasValue(mergedData, 'suspect_address')) && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Suspect Details:</p>
              {hasValue(mergedData, 'suspect') && <p>{mergedData.suspect}</p>}
              {hasValue(mergedData, 'suspect_marks') && <p><b>Identifying Marks:</b> {mergedData.suspect_marks}</p>}
              {hasValue(mergedData, 'suspect_complexion') && <p><b>Complexion:</b> {mergedData.suspect_complexion}</p>}
              {hasValue(mergedData, 'suspect_address') && <p><b>Address:</b> {mergedData.suspect_address}</p>}
            </div>
          )}
          
          {/* Victim Information Section - Only show if any victim field has data */}
          {(hasValue(mergedData, 'victim_name') || hasValue(mergedData, 'victim_phone') || 
            hasValue(mergedData, 'victim_age_gender') || hasValue(mergedData, 'victim_relation') || 
            hasValue(mergedData, 'victim_details')) && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Victim Details:</p>
              {hasValue(mergedData, 'victim_name') && <p><b>Name:</b> {mergedData.victim_name}</p>}
              {hasValue(mergedData, 'victim_phone') && <p><b>Phone:</b> {mergedData.victim_phone}</p>}
              {hasValue(mergedData, 'victim_age_gender') && <p><b>Age/Gender:</b> {mergedData.victim_age_gender}</p>}
              {hasValue(mergedData, 'victim_relation') && <p><b>Relation:</b> {mergedData.victim_relation}</p>}
              {hasValue(mergedData, 'victim_details') && !hasValue(mergedData, 'victim_name') && <p>{mergedData.victim_details}</p>}
            </div>
          )}
          
          {/* Witness Information Section - Only show if any witness field has data */}
          {(hasValue(mergedData, 'witness') || hasValue(mergedData, 'witness_contact') || 
            hasValue(mergedData, 'witness_statement')) && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Witness Details:</p>
              {hasValue(mergedData, 'witness') && <p>{mergedData.witness}</p>}
              {hasValue(mergedData, 'witness_contact') && <p><b>Contact:</b> {mergedData.witness_contact}</p>}
              {hasValue(mergedData, 'witness_statement') && <p><b>Statement:</b> {mergedData.witness_statement}</p>}
            </div>
          )}
          
          {/* Evidence Files Section - Only show if there are files */}
          {mergedData.evidence_files && Array.isArray(mergedData.evidence_files) && mergedData.evidence_files.length > 0 && (
            <div className="mb-3">
              <p className="font-medium text-gray-700">Evidence Files:</p>
              <ul className="list-disc list-inside pl-2">
                {mergedData.evidence_files.map((file, index) => (
                  <li key={index}>
                    <a
                      href={`http://localhost:5173/backend/${file.replaceAll("\\", "/")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {file.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <h4 className="font-bold text-md">Investigation Actions:</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => navigate("/police/suspect-finder")}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-800"
            >
              Find Suspects
            </button>
          </div>
        </div>
        
        {/* Notes Section */}
        {renderNotes()}
      </div>
    );
  };
  //ADDING CODE
  const fetchFinalReport = async (complaintId) => {
    setLoadingReports(prev => ({...prev, [complaintId]: true}));
    
    try {
      console.log(`Fetching final report for complaint ID: ${complaintId}`);
      const response = await axios.get(`http://localhost:5000/api/police/final-report/${complaintId}`);
      
      console.log("Final report API response:", response.data);
      
      if (response.data) {
        setFinalReports(prev => ({...prev, [complaintId]: response.data}));
        return response.data; // Return the data for immediate use
      } else {
        console.warn("Empty response from final report API");
        return null;
      }
    } catch (error) {
      console.error("Error fetching final report:", error);
      if (error.response && error.response.status === 404) {
        alert("Final report not found for this complaint.");
      } else {
        alert("Failed to fetch the final report. Please try again.");
      }
      return null;
    } finally {
      setLoadingReports(prev => ({...prev, [complaintId]: false}));
    }
  };
  
  const downloadFinalReport = async (complaintId) => {
    // Check if we already have the report data
    if (!finalReports[complaintId]) {
      await fetchFinalReport(complaintId);
    }
    
    const reportData = finalReports[complaintId];
    if (!reportData) {
      alert("Report data not available. Please try again.");
      return;
    }
    
    try {
      // Create a formatted version of the report for PDF
      const reportDiv = document.createElement('div');
      const complaint = complaints.find(c => c.complaint_id === complaintId);
      
      reportDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="text-align: center; margin-bottom: 20px;">POLICE FINAL REPORT</h2>
          
          <div style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
            <p><strong>Complaint ID:</strong> ${complaintId}</p>
            <p><strong>Officer ID:</strong> ${reportData.officer_id}</p>
            <p><strong>Incident Type:</strong> ${complaint?.incident_type || 'N/A'}</p>
            <p><strong>Date Filed:</strong> ${complaint?.date ? new Date(complaint.date).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Final Status:</strong> ${reportData.final_status}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">Final Report</h3>
            <p style="white-space: pre-wrap;">${reportData.report}</p>
          </div>
          
          ${reportData.remarks ? `
            <div style="margin-bottom: 20px;">
              <h3 style="margin-bottom: 10px;">Remarks</h3>
              <p style="white-space: pre-wrap;">${reportData.remarks}</p>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px;">
            <p style="text-align: right;">Date: ${new Date(reportData.created_at).toLocaleDateString()}</p>
            <p style="text-align: right; margin-top: 30px;">_______________________</p>
            <p style="text-align: right;">Officer Signature</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(reportDiv);
      
      // Generate PDF from the temporary div
      const canvas = await html2canvas(reportDiv, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm (210mm)
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Final_Report_${complaintId}.pdf`);
      
      // Remove the temporary div
      document.body.removeChild(reportDiv);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };  
//OUTSIDE DETAILED

  // Add this function to check if the status indicates a final report exists
const hasFinalReport = (status) => {
  return status.startsWith("Closed(") || status === "Closed";
};

  const renderClosedComplaintActions = (complaint) => {
    if (complaint.status === "Closed") {
      return (
        <button
          onClick={() => handleOpenFinalReportForm(complaint)}
          className="w-full mt-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-800"
        >
          Fill Final Form
        </button>
      );
    } else if (hasFinalReport(complaint.status)) {
      // return (
      //   <button
      //     onClick={() => downloadFinalReport(complaint.complaint_id)}
      //     className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 flex items-center justify-center"
      //     disabled={loadingReports[complaint.complaint_id]}
      //   >
      //     {loadingReports[complaint.complaint_id] ? 
      //       "Loading..." : 
      //        <><span className="mr-1">⬇️</span> Download Final Report</>
      //     }
      //   </button>
      // );
    }
    return null;
  };
  
  const handleGetSuspects = async () => {
    const payload = {
      crime_type: crimeTypeInput,
      identifying_mark: markInput,
      complexion: complexionInput,
      last_known_address: addressInput,
    };
  
    try {
      const response = await axios.post("http://localhost:5000/api/police/find_suspects", payload);
      const suspects = response.data.data;
      if (suspects.length > 0) {
        // Display suspects
      } else {
        alert("No matching suspects found.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong while fetching suspects.");
    }
  };

  // Modified renderClosedComplaintActions
  
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Police Complaint Dashboard</h1>
      {/* Officer ID debug - helps with troubleshooting */}
      <div className="text-xs text-gray-500 text-center mb-4">
        {policeOfficerId ? `Logged in as Officer #${policeOfficerId}` : "Officer ID not found - Some features may be limited"}
      </div>
      
      {/* Final Report Form Modal */}
      {showFinalReportForm && currentComplaintForReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <FinalReportForm 
              complaintId={currentComplaintForReport.complaint_id}
              officerId={policeOfficerId}
              complaintData={currentComplaintForReport}
              onClose={handleCloseFinalReportForm}
              onSubmitSuccess={handleFinalReportSubmitted}
            />
          </div>
        </div>
      )}
      
      {loading ? (
        <p className="text-center">Loading complaints...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : complaints.length === 0 ? (
        <p className="text-center text-gray-500">No complaints found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((c) => (
            <div
              key={c.complaint_id}
              className={`p-4 border rounded-lg transition cursor-pointer ${
                selectedComplaintId === c.complaint_id ? "bg-blue-100 border-blue-500" : "bg-gray-100"
              }`}
              onClick={() => setSelectedComplaintId(c.complaint_id)}
            >
              <h4 className="font-semibold">ID: {c.complaint_id}</h4>
              <p>Type: {c.incident_type}</p>
              <p className={`font-medium ${
                c.status === "Under Investigation" ? "text-blue-600" : 
                c.status === "Closed" ? "text-green-600" : 
                c.status === "Rejected" ? "text-red-600" : "text-gray-600"
              }`}>
                Status: {c.status}
              </p>
              
              {selectedComplaintId === c.complaint_id && (
                <div ref={complaintRef} className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  {/* Always show basic information */}
                  <p><b>Date:</b> {new Date(c.date).toLocaleDateString()}</p>
                  <p><b>Time:</b> {c.time}</p>
                  <p><b>District:</b> {c.district}</p>
                  <p><b>Subdivision:</b> {c.subdivision}</p>
                  <p><b>Description:</b> {c.description}</p>
                  
                  {/* Render investigation details if status is "Under Investigation" */}
                  {renderDetailedInvestigation(c)}
  
                  <div className="mt-4">
                    <p><b>Current Status:</b> {c.status}</p>
                    
                    {c.status === "Accepted" && (
                      <button
                        className="w-full mt-2 p-2 bg-green-600 text-white rounded-lg hover:bg-green-800"
                        onClick={() => handleStartInvestigation(c.complaint_id)}
                      >
                        Start Investigation
                      </button>
                    )}
  
                    {getNextStatusOptions(c.status).length > 0 && (
                      <>
                        <label className="block mt-2 font-medium">Update Status:</label>
                        <select
                          className="w-full p-2 border rounded-lg mt-1"
                          value={status[c.complaint_id] || ""}
                          onChange={(e) => setStatus((prev) => ({ ...prev, [c.complaint_id]: e.target.value }))}
                        >
                          <option value="">Select Status</option>
                          {getNextStatusOptions(c.status).map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                        <button
                          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800"
                          onClick={() => handleStatusUpdate(c.complaint_id, status[c.complaint_id])}
                        >
                          Update Status
                        </button>
                      </>
                    )}
                    
                    {/* Show Fill Final Form button for Closed status */}
                    {renderClosedComplaintActions(c)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
  export default PoliceViewComplaint;