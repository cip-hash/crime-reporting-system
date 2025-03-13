import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CrimeReportForm from './Components/Form/CrimeReportForm.jsx'
import TrackComplaint from './Components/Form/TrackComplaint.jsx'
import PoliceViewComplaint from './Components/Form/PoliceViewComplaint.jsx'
import Register from './Components/Login_Register/Register.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CrimeReportForm/>
    <PoliceViewComplaint />
    <TrackComplaint/>
  </StrictMode>,
)
