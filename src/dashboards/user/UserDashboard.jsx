import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, FileText, Send, Bell, LogOut, Settings, Shield } from "lucide-react";
import ReportCrime from "./ReportCrime";
import TrackStatus from "./TrackStatus";
import MyReports from "./MyReports";
import Chatbot from "./Chatbot";
import Sos from "./Sos";
import Reports from "./Reports";


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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white p-6 flex flex-col shadow-xl">
        <div class
        
        Name="mb-10 flex items-center">
          <Shield className="w-8 h-8 mr-3 text-blue-200" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crime Reporting</h1>
            <p className="text-blue-200 text-sm mt-1 font-light">Citizen Portal</p>
          </div>
        </div>

        <nav className="space-y-3 flex-grow">
          <h3 className="text-xs uppercase text-blue-300 font-semibold ml-3 mb-3 tracking-wider">Main Menu</h3>
          <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "report" 
                ? "bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg border-l-4 border-blue-400" 
                : "hover:bg-blue-800/50 text-blue-100"
            }`}
            onClick={() => setActiveTab("report")}
          >
            <Send size={18} className={`mr-3 ${activeTab === "report" ? "text-blue-300" : ""}`} /> 
            <span className="font-medium">Report a Crime</span>
          </button>
          
          <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "status" 
                ? "bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg border-l-4 border-blue-400" 
                : "hover:bg-blue-800/50 text-blue-100"
            }`}
            onClick={() => setActiveTab("status")}
          >
            <FileText size={18} className={`mr-3 ${activeTab === "status" ? "text-blue-300" : ""}`} /> 
            <span className="font-medium">View Crime Status</span>
          </button>

          <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "sos" 
                ? "bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg border-l-4 border-blue-400" 
                : "hover:bg-blue-800/50 text-blue-100"
            }`}
            onClick={() => setActiveTab("sos")}
          >
            <FileText size={18} className={`mr-3 ${activeTab === "sos" ? "text-blue-300" : ""}`} /> 
            <span className="font-medium">SOS</span>
          </button>


          <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "user-report" 
                ? "bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg border-l-4 border-blue-400" 
                : "hover:bg-blue-800/50 text-blue-100"
            }`}
            onClick={() => setActiveTab("user-report")}
          >
            <FileText size={18} className={`mr-3 ${activeTab === "user-report" ? "text-blue-300" : ""}`} /> 
            <span className="font-medium">View Complaint report</span>
          </button>

          
          {/* <button
            className={`flex items-center p-3 w-full rounded-lg transition-all duration-200 ${
              activeTab === "reports" 
                ? "bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg border-l-4 border-blue-400" 
                : "hover:bg-blue-800/50 text-blue-100"
            }`}
            onClick={() => setActiveTab("reports")}
          >
            <Home size={18} className={`mr-3 ${activeTab === "reports" ? "text-blue-300" : ""}`} /> 
            <span className="font-medium">My Reports</span>
          </button> */}
        </nav>
        
        {/* Footer Navigation */}
        <div className="mt-auto border-t border-blue-700/50 pt-4 space-y-2">
          {/* <button className="flex items-center p-3 w-full rounded-lg hover:bg-blue-800/40 text-blue-100 transition-all duration-200 group">
            <Settings size={18} className="mr-3 group-hover:rotate-45 transition-transform duration-300" /> Settings
          </button> */}
          <button 
            onClick={handleLogout}
            className="flex items-center p-3 w-full rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-100 transition-all duration-200"
          >
            <LogOut size={18} className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white h-16 border-b flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {activeTab === "report" && (
              <>
                <Send size={20} className="mr-2 text-blue-600" /> 
                Report a Crime
              </>
            )}
            {/* {activeTab === "status" && (
              <>
                <FileText size={20} className="mr-2 text-blue-600" /> 
                View Crime Status
              </>
            )}
            {activeTab === "reports" && (
              <>
                <Home size={20} className="mr-2 text-blue-600" /> 
                My Reports
              </>
            )} */}
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* <div className="text-sm text-gray-500 mr-4 hidden md:block">
              Welcome back, User
            </div> 
            <button className="relative p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200">
              <Bell size={20} />
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center shadow-sm">0</span>
            </button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
              U
            </div> */}
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-100">
  <div className="bg-white rounded-xl shadow-sm p-6 h-full border border-gray-200">
    {activeTab === "report" && <ReportCrime />}
    {activeTab === "status" && <TrackStatus />}
    {activeTab === "sos" && <Sos />}
    {activeTab === "user-report" && <Reports />}
    <Chatbot />  {/* Chatbot Component */}
  </div>
</main>



      </div>
    </div>
  );
};

export default UserDashboard;