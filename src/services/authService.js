const API_URL = "http://localhost:5000/api/auth"; // ✅ Ensure correct backend URL

export const register = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorText = await response.text(); // Log full error response
        console.error("❌ Registration Error:", errorText);
        throw new Error(errorText || "Registration failed");
    }

    return await response.json();
};

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        // ✅ Log the raw response before parsing
        const responseText = await response.text();
        console.log("🟢 Raw Login Response:", responseText);

        if (!response.ok) {
            console.error("❌ Login Request Failed:", responseText);
            throw new Error(responseText || "Invalid email or password");
        }

        return JSON.parse(responseText); // ✅ Ensure it's valid JSON before returning
    } catch (error) {
        console.error("❌ Login Function Error:", error);
        throw error;
    }
};

export const addPoliceOfficer = async (policeData) => {
    const response = await fetch(`${API_URL}/add-police`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policeData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Add Police Officer Error:", errorText);
        throw new Error(errorText || "Failed to add police officer");
    }

    return JSON.parse(errorText);
};
