import React from 'react'
import { assets } from '../assets/assets'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const About = () => {
  return (
    <div>
      <Navbar />

      <div className="flex flex-col md:flex-row items-center gap-10 p-6 md:p-16">
        
        <img 
          src={assets.about_image} 
          alt="About" 
          className="w-full max-w-md rounded-xl shadow-md"
        />

        <div className="space-y-4 text-gray-800">
          <h1 className="text-2xl font-bold text-black-400">ABOUT US</h1>

          <p>
            Welcome to Prescripto, your smart digital partner designed to bring next-level convenience 
            to your healthcare journey. In collaboration with leading private hospitals, Prescripto delivers 
            a premium, fast, and technology-driven medical experience—just like navigating a smooth, futuristic interface.
          </p>

          <p>
            At Prescripto, we understand that private healthcare demands speed, accuracy, and comfort. 
            Our platform is built for instant appointment booking, real-time schedule checking, and effortless 
            health management with a clean, game-inspired UI.
          </p>

          <h2 className="text-2xl font-bold text-black-500 mt-4">Our Vision</h2>

          <p>
            Our vision is to redefine private healthcare through advanced digital technology. 
            We aim to create a system where patients can book appointments like choosing a mission, 
            track medical history like a progress log, connect with specialists instantly, 
            and experience premium service without delays.
          </p>
        </div>
      </div>

      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold text-black mb-6">WHY CHOOSE US</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 md:px-20">
          
          <div className="border rounded-xl p-6 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm">
            <h3 className="text-xl font-semibold mb-2">EFFICIENCY</h3>
            <p>Streamlined appointment scheduling that fits your busy lifestyle.</p>
          </div>

          <div className="border rounded-xl p-6 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm">
            <h3 className="text-xl font-semibold mb-2">CONVENIENCE</h3>
            <p>Access a network of trusted healthcare professionals in your area.</p>
          </div>

          <div className="border rounded-xl p-6 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm">
            <h3 className="text-xl font-semibold mb-2">PERSONALIZATION</h3>
            <p>Get tailored recommendations and reminders for better health management.</p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}

export default About
