import React from 'react'
import { Route, Routes } from "react-router-dom"
import Home from './pages/Home'
import Doctor from './pages/Doctor'
import Contact from './pages/Contact'
import About from './pages/About'
import Appointment from './pages/Appointment'
import MyAppointment from './pages/MyAppointment'
import Myprofile from './pages/Myprofile'
import Relateddoctor from './components/Relateddoctor'
import Login from './pages/Login'

import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorLogin from './pages/DoctorLogin'
import AdminLogin from './pages/AdminLogin'
import AllAppointments from './pages/AllAppointments'
import AllDoctors from './pages/AllDoctors'
import AddDoctor from './pages/AddDoctor'
import DeleteDoctor from './pages/DeleteDoctor'
import AllUsers from './pages/AllUsers'


import { AuthProvider, useAuth } from './context/AuthContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const adminToken = sessionStorage.getItem('adminToken');
  if (!adminToken) {
    return <Navigate to="/admin-login" />;
  }
  return children;
};

const DoctorProtectedRoute = ({ children }) => {
  const doctor = sessionStorage.getItem('doctorData');
  if (!doctor) {
    return <Navigate to="/doctor-login" />;
  }
  return children;
};

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctor />} />
        <Route path='/doctors/:speciality' element={<Doctor />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
        <Route path="/doctor/:speciality" element={<Relateddoctor />} />

        {/* Protected Routes */}
        <Route path='/appointment/:docId' element={<ProtectedRoute><Appointment /></ProtectedRoute>} />
        <Route path='/my-appointments' element={<ProtectedRoute><MyAppointment /></ProtectedRoute>} />
        <Route path='/my-profile' element={<ProtectedRoute><Myprofile /></ProtectedRoute>} />
        <Route path='/admin-dashboard' element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path='/all-appointments' element={<AdminRoute><AllAppointments /></AdminRoute>} />
        <Route path='/all-doctors' element={<AdminRoute><AllDoctors /></AdminRoute>} />
        <Route path='/add-doctor' element={<AdminRoute><AddDoctor /></AdminRoute>} />
        <Route path='/delete-doctor' element={<AdminRoute><DeleteDoctor /></AdminRoute>} />
        <Route path='/all-users' element={<AdminRoute><AllUsers /></AdminRoute>} />
        <Route path='/doctor-dashboard' element={<DoctorProtectedRoute><DoctorDashboard /></DoctorProtectedRoute>} />
        <Route path='/user-dashboard' element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

        <Route path='/login' element={<Login />} />
        <Route path='/doctor-login' element={<DoctorLogin />} />
        <Route path='/admin-login' element={<AdminLogin />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
