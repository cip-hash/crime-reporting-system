import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Login_Register/Home";
import Register from "./Components/Login_Register/Register";
import Login from "./Components/Login_Register/Login";
import CrimeReportForm from "./Components/Form/CrimeReportForm";
import TrackComplaint from "./Components/Form/TrackComplaint";
import PoliceViewComplaint from "./Components/Form/PoliceViewComplaint";
//import Dashboard from "./Components/Dashboard"; <Route path="/dashboard" element={<Dashboard />} />



function App() {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/CrimeReportForm" element={<CrimeReportForm/>}/>
        <Route path="/TrackComplaint" element={<TrackComplaint/>}/>
        <Route path="/PoliceViewComplaint" element={<PoliceViewComplaint/>}/>
      </Routes>
    </Router>
  );
}

export default App;