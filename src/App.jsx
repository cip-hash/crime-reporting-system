import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Register from "./Components/Register";
import Login from "./Components/Login";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Components/Unauthorized";

// Import dashboards
import AdminDashboard from "./dashboards/admin/AdminDashboard";
import ManagePolice from "./dashboards/admin/ManagePolice";  // ✅ Import this
import PoliceDashboard from "./dashboards/police/PoliceDashboard";
import UserDashboard from "./dashboards/user/UserDashboard";
import ReportCrime from "./dashboards/user/ReportCrime";
import TrackStatus from "./dashboards/user/TrackStatus";
import MyReports from "./dashboards/user/MyReports";

import PoliceHeatmap from "./dashboards/police/PoliceHeatmap";
import AdminHeatmap from "./dashboards/admin/AdminHeatmap";
import SuspectFinder from './dashboards/police/SuspectFinder';
import FinalReports from "./dashboards/admin/FinalReports";

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
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/manage-police" element={<ManagePolice />} />
              <Route path="/admin/heatmap" element={<AdminHeatmap />} />
              <Route path="/admin/view-reports" element={<FinalReports />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["police"]} />}>
              <Route path="/police/heatmap" element={<PoliceHeatmap />} />
              <Route path="/police/dashboard" element={<PoliceDashboard />} />
              <Route path="/police/suspect-finder" element={<SuspectFinder />} />
            </Route>


            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/report-crime" element={<ReportCrime />} />
              <Route path="/user/track-status" element={<TrackStatus />} />
              <Route path="/user/my-reports" element={<MyReports />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
