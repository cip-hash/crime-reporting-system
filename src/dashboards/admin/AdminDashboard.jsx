import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react"; 
import { 
  FiMap, 
  FiUsers, 
  FiShield, 
  FiFileText, 
  FiMenu, 
  FiX, 
  FiHome, 
  FiBarChart2, 
  FiSettings,
  FiLogOut,
  FiBell,
  FiUser
} from "react-icons/fi";
import ManagePolice from "./ManagePolice";
import ManageUsers from "./ManageUsers";
import FinalReports from "./FinalReports";
import AdminHeatmap from "../admin/AdminHeatmap";


 


export default function AdminDashboard() {
  
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [profileOpen, setProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [userCount,setUserCount]=useState(0);
    
    const isActive = (path) => {
        return location.pathname.includes(path) ? "bg-blue-700 text-white" : "";
    };
    
    //logic for fetching user count 
    useEffect(() => {
      console.log("✅ AdminDashboard Component Mounted");
      const fetchUserCount = async () => {
          try {
              const response = await fetch("http://localhost:5000/api/admin/user-count");
              const data = await response.json();
  
              if (response.ok) {
                  console.log("Fetched user count:", data); // Debugging log
                  setUserCount(Number(data.userCount));  // ✅ Ensure it’s a number
              } else {
                  console.error("Failed to fetch user count:", data.error);
              }
          } catch (error) {
              console.error("Error fetching user count:", error);
          }
      };
  
      fetchUserCount();
  }, []);
  
  

    // Stats initialized to zero
    const stats = [
        { title: "Total Reports", value: "0", icon: <FiFileText className="text-blue-500" size={24} /> },
        { title: "Active Cases", value: "0", icon: <FiShield className="text-green-500" size={24} /> },
        { title: "Registered Users", value: userCount, icon: <FiUsers className="text-purple-500" size={24} /> },
        { title: "Crime Hotspots", value: "0", icon: <FiMap className="text-red-500" size={24} /> }
    ];

    const handleLogout = () => {
        // Add your logout logic here
        console.log("Logging out...");
        // Usually you would clear tokens, cookies, etc.
        navigate("/login");
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden bg-blue-900 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">Crime Report System</h1>
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-white focus:outline-none"
                >
                    {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 transition-transform duration-300 ease-in-out
                w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white fixed md:relative h-full z-10
                overflow-y-auto flex flex-col
            `}>
                <div className="p-5">
                    <div className="flex items-center justify-center md:justify-start mb-8">
                        <div className="bg-white p-2 rounded-full">
                            <FiShield className="text-blue-900 text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold ml-3">Admin Portal</h1>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-xs uppercase text-blue-300 font-semibold tracking-wider mb-2 pl-4">Main</p>
                        <button 
                            to="/admin" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200${activeTab === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'}`}
                            onClick={() => setActiveTab("dashboard")}   
                            //  ${isActive("/admin") && !isActive("/admin/heatmap") && !isActive("/admin/manage-police") && !isActive("/admin/manage-users") && !isActive("/admin/view-reports") ? "bg-blue-700" : ""}`}
                        >
                            <FiHome /> <span>Dashboard</span>
                        </button>
                        <button 
                       className={`flex items-center px-4 py-3 w-full rounded-lg ${activeTab === 'heatmap' ? 'bg-blue-700' : 'hover:bg-blue-700'}`} 
                       onClick={() => setActiveTab("heatmap")}>
                       <FiMap className="mr-3" /> Crime Heatmap
                   </button>
                   {/* ADD */}


                    <button 
    className={`flex items-center px-4 py-3 w-full rounded-lg ${activeTab === 'finalReports' ? 'bg-blue-700' : 'hover:bg-blue-700'}`} 
    onClick={() => setActiveTab("finalReports")}>
    <FiFileText className="mr-3" /> View Reports
</button> 


                        {/* // { <Link> 
                        //     to="/admin/view-reports" 
                        //     className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isActive("/admin/view-reports")}`}
                        // >
                        //     <FiFileText /> <span>View Reports</span>
                        // </Link> }
                        /*<Link 
                            to="/admin/statistics" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isActive("/admin/statistics")}`}
                        >
                            <FiBarChart2 /> <span>Statistics</span>
                        </Link> */} 
                        
                        <p className="text-xs uppercase text-blue-300 font-semibold tracking-wider mt-6 mb-2 pl-4">Administration</p>
                        <button 
                       className={`flex items-center px-4 py-3 w-full rounded-lg ${activeTab === 'managePolice' ? 'bg-blue-700' : 'hover:bg-blue-700'}`} 
                       onClick={() => setActiveTab("managePolice")}>
                       <FiShield className="mr-3" /> Manage Police
                   </button>
                        {/* <Link 
                            to="/admin/manage-users" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isActive("/admin/manage-users")}`}
                        >
                            <FiUsers /> <span>Manage Users</span>
                        </Link> */}
                        {/* <Link 
                            to="/admin/settings" 
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${isActive("/admin/settings")}`}
                        >
                            <FiSettings /> <span>Settings</span>
                        </Link> */}
                    </div>
                </div>
                
                {/* Logout Button at bottom of sidebar (without user profile section) */}
                <div className="p-4 mt-auto border-t border-blue-700">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        <FiLogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
                        
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 hidden md:flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800">Crime Reporting System</h1>
                    
                    {/* Header Right: Notifications & Profile */}
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button className="bg-blue-100 p-2 rounded-full relative hover:bg-blue-200 transition-colors duration-200">
                                <FiBell className="text-blue-600" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    0
                                </span>
                            </button>
                        </div>
                        
                        {/* Profile Button */}
                        <div className="relative">
                            <button 
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full pl-2 pr-3 py-1 transition-colors duration-200"
                            >
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                                <span className="text-sm font-medium text-gray-700">Admin</span>
                            </button>
                            
                            {/* Profile Dropdown */}
                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border">
                                    <div className="px-4 py-2 border-b">
                                        <p className="font-semibold text-gray-700">Admin</p>
                                        <p className="text-xs text-gray-500">admin123@gmail.com</p>
                                    </div>
                                    {/* <Link to="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <div className="flex items-center space-x-2">
                                            <FiUser size={14} />
                                            <span>My Profile</span>
                                        </div>
                                    </Link> 
                                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <div className="flex items-center space-x-2">
                                            <FiSettings size={14} />
                                            <span>Settings</span>
                                        </div>
                                    </Link>*/}
                                    <div className="border-t my-1"></div>
                                    <button 
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <FiLogOut size={14} />
                                            <span>Logout</span>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="p-6">
  {activeTab === "dashboard" && (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 font-semibold">{stat.title}</p>
                <h2 className="text-2xl font-bold text-gray-800">{stat.value}</h2>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </>
  )}

  {activeTab === "heatmap" && <AdminHeatmap />}
  {activeTab === "finalReports" && <FinalReports />}
  {activeTab === "managePolice" && <ManagePolice />}
  {activeTab === "manageUsers" && <ManageUsers />}
</main>

            </div>
        </div>
    );
}
// import { useState, useEffect } from "react";
// import { FiMap, FiShield, FiMenu, FiX, FiLogOut } from "react-icons/fi";
// import AdminHeatmap from "../admin/AdminHeatmap";
// import ManagePolice from "./ManagePolice";

// export default function AdminDashboard() {
//     const [sidebarOpen, setSidebarOpen] = useState(true);
//     const [activeTab, setActiveTab] = useState("heatmap");
//     const [userCount, setUserCount] = useState(0);

//     useEffect(() => {
//         const fetchUserCount = async () => {
//             try {
//                 const response = await fetch("http://localhost:5000/api/admin/user-count");
//                 const data = await response.json();
//                 if (response.ok) {
//                     setUserCount(Number(data.userCount));
//                 } else {
//                     console.error("Failed to fetch user count:", data.error);
//                 }
//             } catch (error) {
//                 console.error("Error fetching user count:", error);
//             }
//         };
//         fetchUserCount();
//     }, []);

//     return (
//         <div className="flex h-screen bg-gray-50">
//             {/* Sidebar */}
//             <div className={`w-64 bg-blue-900 text-white fixed md:relative h-full z-10 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//                 <div className="p-5 flex justify-between">
//                     <h1 className="text-2xl font-bold">Admin Portal</h1>
//                     <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-white">
//                         {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
//                     </button>
//                 </div>
//                 <nav className="p-4 space-y-4">
//                     <button 
//                         className={`flex items-center px-4 py-3 w-full rounded-lg ${activeTab === 'heatmap' ? 'bg-blue-700' : 'hover:bg-blue-700'}`} 
//                         onClick={() => setActiveTab("heatmap")}>
//                         <FiMap className="mr-3" /> Crime Heatmap
//                     </button>
//                     <button 
//                         className={`flex items-center px-4 py-3 w-full rounded-lg ${activeTab === 'managePolice' ? 'bg-blue-700' : 'hover:bg-blue-700'}`} 
//                         onClick={() => setActiveTab("managePolice")}>
//                         <FiShield className="mr-3" /> Manage Police
//                     </button>
//                 </nav>
//                 <div className="p-4 mt-auto border-t border-blue-700">
//                     <button className="w-full flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-600 py-2 px-4 rounded-lg">
//                         <FiLogOut size={18} /> <span>Logout</span>
//                     </button>
//                 </div>
//             </div>
            
//             {/* Main Content */}
//             <div className="flex-1 overflow-auto p-6">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Dashboard</h2>
//                 <div className="bg-white p-6 rounded-lg shadow">
//                     {activeTab === "heatmap" ? <AdminHeatmap /> : <ManagePolice />}
//                 </div>
//             </div>
//         </div>
//     );
// }
