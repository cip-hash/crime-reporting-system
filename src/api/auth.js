import axios from "axios";
import API_BASE_URL from "../config";

// User Registration API
export const registerUser = async (name, email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/register`, { name, email, password });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

// User Login API
export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};