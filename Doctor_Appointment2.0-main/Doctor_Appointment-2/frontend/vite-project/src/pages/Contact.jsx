import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <Navbar />

      {/* Top Heading */}
      <div className="text-center my-10">
        <p className="text-2xl font-bold text-gray-800">CONTACT US</p>
      </div>

      {/* Image + Office Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-10 px-6 md:px-16">

        {/* Left Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={assets.contact_image}
            className="w-full max-w-sm rounded-xl shadow-md"
          />
        </div>

        {/* Right Content */}
        <div className="w-full md:w-1/2 text-gray-800">

          {/* Office Details */}
          <h3 className="text-2xl font-semibold mb-3">OUR OFFICE</h3>

          <p className="mb-2">00000 Willms Station</p>
          <p className="mb-2">Suite 000, Washington, USA</p>

          <p className="mt-4 mb-2">Tel: (000) 000-0000</p>
          <p>Email: greatstackdev@gmail.com</p>

          {/* Spacing */}
          <div className="my-8" />

          {/* Careers Section */}
          <h2 className="text-2xl font-semibold mb-3">CAREERS AT PRESCRIPTO</h2>
          <p className="mb-5">Learn more about our teams and job openings.</p>

          {/* Button */}
          <button className="px-6 py-2 border border-black rounded-md hover:bg-black hover:text-white transition-all">
            Explore Jobs
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact
