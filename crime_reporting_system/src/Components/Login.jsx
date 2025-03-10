import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      console.log("Login successful:", response.data);
      
      // Example: Save token in localStorage or sessionStorage
      sessionStorage.setItem("authToken", response.data.token);

      // Redirect to dashboard/homepage after login
      navigate("/dashboard");
    } catch (error) {
      setErrors(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100">
      <div className="bg-white p-10 rounded-lg shadow-md w-[450px]">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Login to Your Account
        </h2>
        {errors && <p className="text-red-500 text-center mb-4">{errors}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-700 text-lg">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-700 text-lg">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 text-lg disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-5 text-gray-600 text-lg">
          Don't have an account? <Link to="/register" className="text-blue-500">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
