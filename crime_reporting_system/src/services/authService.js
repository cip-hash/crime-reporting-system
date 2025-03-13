import axios from "axios";
import { useState, useEffect } from "react";

const API_URL = "http://localhost:5000/api/auth";

// Register User
export const register = async (userData) => {
    return await axios.post(`${API_URL}/register`, userData);
};

// Login User
export const login = async (userData) => {
    return await axios.post(`${API_URL}/login`, userData);
};

// ✅ Add the missing `useAuth` function
export const useAuth = () => {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const storedRole = sessionStorage.getItem("userRole");
        if (storedRole) {
            setUserRole(storedRole);
        }
    }, []);

    return userRole;
};
