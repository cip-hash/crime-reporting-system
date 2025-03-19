import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, FileText, Send, Bell, LogOut, Settings } from "lucide-react";
import ReportCrime from "./ReportCrime";
import TrackStatus from "./TrackStatus";
import MyReports from "./MyReports";

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState("report");
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Clear any user authentication tokens from localStorage
    localStorage.removeItem("userToken");
    // Redirect to login page
    navigate("/login");
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6 flex flex-col shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Crime Reporting</h1>
          <p className="text-blue-200 text-sm mt-1">User Dashboard</p>
        </div>

        <nav className="space-y-2 flex-grow">
          <h3 className="text-xs uppercase text-blue-300 font-semibold ml-3 mb-2">Main Menu</h3>
          <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "report" 
                ? "bg-blue-700 shadow-md" 
                : "hover:bg-blue-800 text-blue-100"
            }`}
            onClick={() => setActiveTab("report")}
          >
            <Send size={18} className="mr-3" /> Report a Crime
          </button>
          
          <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "status" 
                ? "bg-blue-700 shadow-md" 
                : "hover:bg-blue-800 text-blue-100"
            }`}
            onClick={() => setActiveTab("status")}
          >
            <FileText size={18} className="mr-3" /> View Crime Status
          </button>
          
          <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "reports" 
                ? "bg-blue-700 shadow-md" 
                : "hover:bg-blue-800 text-blue-100"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            <Home size={18} className="mr-3" /> My Reports
          </button>
        </nav>
        
        {/* Footer Navigation */}
        <div className="mt-auto border-t border-blue-700 pt-4 space-y-2">
          <button className="flex items-center p-3 w-full rounded-lg hover:bg-blue-800 text-blue-100 transition-all duration-200">
            <Settings size={18} className="mr-3" /> Settings
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg hover:bg-blue-800 text-blue-100 transition-all duration-200"
          >
            <LogOut size={18} className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white h-16 border-b flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeTab === "report" && "Report a Crime"}
            {activeTab === "status" && "View Crime Status"}
            {activeTab === "reports" && "My Reports"}
          </h2>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">0</span>
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            {activeTab === "report" && <ReportCrime />}
            {activeTab === "status" && <TrackStatus />}
            {activeTab === "reports" && <MyReports />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;