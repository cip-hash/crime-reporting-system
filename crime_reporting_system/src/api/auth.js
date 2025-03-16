import axios from "axios";
import API_BASE_URL from "../config"; // Import the API base URL

// ✅ User Registration API
export const registerUser = async (name, email, password, role = "user") => {
    try {
        
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { name, email, password, role });

        return response.data;
    } catch (error) {
        console.error("❌ Registration Error:", error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
};

// ✅ User Login API
export const loginUser = async (email, password) => {
    try {
        
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });

        if (response.data.token) {
            // Save token and role in local storage for authentication
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("role", response.data.user.role);
        }

        return response.data;
    } catch (error) {
        console.error("❌ Login Error:", error.response?.data || error.message);
        return { success: false, message: error.response?.data?.message || "Login failed" };
    }
};

// ✅ Logout Function (Clears Token)
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};
