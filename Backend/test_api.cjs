const fetch = require("node-fetch");

const updateStatus = async () => {
    try {
        const complaintId = "CMP0000000001"; // Change to a valid ID
        const response = await fetch(`http://localhost:5000/api/police/update_complaint_status/${complaintId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Under Investigation" })
        });

        const data = await response.json();
        console.log("Response:", data);
    } catch (error) {
        console.error("Error:", error);
    }
};

updateStatus();
