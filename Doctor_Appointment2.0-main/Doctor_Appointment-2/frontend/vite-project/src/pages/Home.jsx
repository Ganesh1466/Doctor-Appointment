import React from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Footer from '../components/Footer'

import MyAppointment from './MyAppointment'

const Home = () => {
  const { isAdmin } = useAuth();
  return (
    <div>
      <Navbar />
      <Header />
      <SpecialityMenu />
      <div className='flex justify-center mt-4'>
        {isAdmin && (
          <button onClick={() => window.location.href = '/admin-dashboard'} className='bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-900'>
            Admin Panel
          </button>
        )}
      </div>
      <TopDoctors />
      <Footer />

    </div>
  )
}

export default Home
