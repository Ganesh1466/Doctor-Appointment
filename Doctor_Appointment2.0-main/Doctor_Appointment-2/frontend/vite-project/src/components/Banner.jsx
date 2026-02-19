import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    const navigate =useNavigate()
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-white pb-40  px-6'>
    <div className="bg-[#1E3A8A] text-white rounded-2xl flex flex-col md:flex-row items-center justify-between w-full max-w-[1300px]  md:h-[450px] shadow-lg px-6 py-6 pt-20 md:px-16 md:py-0 ">

        
        {/* Left Side: Text + Button */}
        <div className='flex flex-col md:pl-15  items-center md:items-start text-center md:text-left space-y-4'>
          <p className='text-3xl md:text-5xl font-bold leading-tight'>Book Appointment</p>
          <p className='text-3xl md:text-5xl font-bold leading-tight'>With 100+ Trusted Doctors</p>
          <button onClick={()=>{navigate('./login'); scrollTo(0,0)}} className='mt-6 bg-white text-blue-900 font-semibold px-6 py-3 rounded-full hover:bg-blue-200 hover:scale-105 transition-transform duration-300'>
            Create Account
          </button>
        </div>

        {/* Right Side: Image */}
       <div className="mt-8 md:mt-0 flex justify-center md:justify-end w-full">
  <img
    src={assets.appointment_img}
    alt="Appointment"
    className="w-[380px] md:pb-13 sm:w-[420px] md:w-[450px] h-auto object-contain drop-shadow-lg pb-0 mb-0"
  />
</div>

      </div>
    </div>
  )
}

export default Banner
