import React from 'react';
import ReactDOM from 'react-dom/client';
//import './index.css'
import App from './App.jsx'
import CrimeReportForm from './Components/Form/CrimeReportForm.jsx'
import TrackComplaint from './Components/Form/TrackComplaint.jsx'
import PoliceViewComplaint from './Components/Form/PoliceViewComplaint.jsx'
const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
)