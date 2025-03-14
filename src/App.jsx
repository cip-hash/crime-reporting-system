import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CrimeReportForm from "./Components/Form/CrimeReportForm";
import TrackComplaint from "./Components/Form/TrackComplaint";
import PoliceViewComplaint from "./Components/Form/PoliceViewComplaint";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrackComplaint />} /> 
        <Route path="/CrimeReportForm" element={<CrimeReportForm />} />
        <Route path="/TrackComplaint" element={<TrackComplaint />} />
        <Route path="/PoliceViewComplaint" element={<PoliceViewComplaint />} />
      </Routes>
    </Router>
  );
}

export default App;
