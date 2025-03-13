import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Register from "./Components/Register";
import Login from "./Components/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Components/Unauthorized"; 

// Import dashboards
import AdminDashboard from "./dashboards/admin/AdminDashboard";
import PoliceDashboard from "./dashboards/police/PoliceDashboard";
import UserDashboard from "./dashboards/user/UserDashboard";

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/police/dashboard"
              element={<ProtectedRoute role="police"><PoliceDashboard /></ProtectedRoute>}
            />
            <Route
              path="/user/dashboard"
              element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
