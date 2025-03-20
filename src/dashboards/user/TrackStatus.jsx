import { useEffect, useState } from "react";

const TrackStatus = () => {
  const [user, setUser] = useState(null); // Store user data
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Fetch user data from localStorage or authentication context
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    if (!loggedInUser) {
      console.error("User not logged in. Cannot fetch status.");
      return; // Stop execution if the user is not logged in
    }

    setUser(loggedInUser);
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/status"); // Adjust API endpoint
      if (!response.ok) throw new Error("Failed to fetch status");

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  return (
    <div>
      {user ? (
        <p>Status: {status ? status.message : "Loading..."}</p>
      ) : (
        <p>Please log in to view your status.</p>
      )}
    </div>
  );
};

export default TrackStatus;
