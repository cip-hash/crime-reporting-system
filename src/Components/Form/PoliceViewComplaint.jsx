import React, { useState, useEffect } from "react";
import styles from "./PoliceViewComplaint.module.scss";

const PoliceViewComplaint = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      const res = await fetch("http://localhost:4000/get_complaints", {method: "GET",});
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      alert("Failed to fetch complaints.");
    } finally {setLoading(false);}
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (complaintId) => {
    let selectedStatus = status[complaintId];

    if (!selectedStatus) {
      alert("Please select a status to update.");
      return;
    }

    // If 'Accepted', auto-convert to 'Under Investigation' before sending to backend
    if (selectedStatus === "Accepted") {
      selectedStatus = "Under Investigation";
    }

    try {
      const res = await fetch(`http://localhost:4000/update_complaint_status/${complaintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      alert("Status updated successfully!");
      await fetchComplaints(); // Refresh complaints after update

      // Clear status selection and collapse card
      setStatus((prev) => ({ ...prev, [complaintId]: "" }));
      setSelectedComplaintId(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  // Function to get allowed next statuses
  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "Pending":
        return ["Accepted", "Rejected"]; // From pending, choose either
      case "Under Investigation":
        return ["Closed"]; // From under investigation, only close
      default:
        return []; // If Rejected or Closed, no further action
    }
  };

  // Display logic: treat 'Accepted' as 'Under Investigation'
  const getDisplayStatus = (status) => {
    return status === "Accepted" ? "Under Investigation" : status;
  };

  return (
    <div className={styles["police-dashboard-container"]}>
      <h1 className={styles.heading}>Police Complaint Dashboard</h1>

      {loading ? (
        <p className="text-center">Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p className="text-center text-gray-500">No complaints found.</p>
      ) : (
        <div className={styles["complaint-grid"]}>
          {complaints.map((c) => (
            <div
              key={c.complaint_id}
              className={`${styles["complaint-card"]} ${
                selectedComplaintId === c.complaint_id ? styles.active : ""
              }`}
            >
              {/* Summary view */}
              <div
                onClick={() =>
                  setSelectedComplaintId(
                    selectedComplaintId === c.complaint_id ? null : c.complaint_id
                  )
                }
              >
                <h4><b>ID:</b> {c.complaint_id}</h4>
                <p><b>Type:</b> {c.incident_type}</p>
              </div>

              {/* Expanded details */}
              {selectedComplaintId === c.complaint_id && (
                <div className={styles["complaint-details"]}>
                  {c.title && <p><b>Title:</b> {c.title}</p>}
                  <p><b>Date:</b> {new Date(c.date).toLocaleDateString()}</p>
                  <p><b>Time:</b> {c.time}</p>
                  <p><b>District:</b> {c.district}</p>
                  <p><b>Subdivision:</b> {c.subdivision}</p>
                  <p><b>Description:</b> {c.description}</p>
                  {c.suspect_details && <p><b>Suspect:</b> {c.suspect_details}</p>}
                  {c.victim_details && <p><b>Victim:</b> {c.victim_details}</p>}
                  {c.witness_details && <p><b>Witness:</b> {c.witness_details}</p>}

                  {/* Evidence files */}
                  {c.evidence_files && c.evidence_files.length > 0 && (
                    <div className={styles["evidence-files"]}>
                      <p><b>Evidence Files:</b></p>
                      <ul>
                        {c.evidence_files.map((file, index) => (
                          <li key={index}>
                            <a
                              href={`http://localhost:4000/${file.replace("\\", "/")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.split("\\").pop()}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Status Section */}
                  <div
                    className={styles["status-section"]}
                    onClick={(e) => e.stopPropagation()} // Prevent collapsing when interacting
                  >
                    <p><b>Current Status:</b> {getDisplayStatus(c.status)}</p>

                    {/* Status update options */}
                    {getNextStatusOptions(getDisplayStatus(c.status)).length > 0 && (
                      <>
                        <label>Update Status:</label>
                        <select
                          value={status[c.complaint_id] || ""}
                          onChange={(e) =>
                            setStatus((prev) => ({
                              ...prev,
                              [c.complaint_id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select Status</option>
                          {getNextStatusOptions(getDisplayStatus(c.status)).map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))}
                        </select>
                        <button onClick={() => handleStatusUpdate(c.complaint_id)}>
                          Update Status
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoliceViewComplaint;
