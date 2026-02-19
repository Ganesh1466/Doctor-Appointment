import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col flex-wrap items-center justify-center min-h-screen   pb-130 px-4 py-10 bg-gray-100">
      <section className="bg-[#1E3A8A] text-white rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between w-full max-w-[1200px] h-auto md:h-[600px] shadow-lg">

        {/* Left side content */}
        <div className="flex flex-col items-start justify-center max-w-md ml-5 text-left mb-10 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight  mb-4 text-center md:text-mid">
            Book Appointment <br /> With Trusted Doctors
          </h1>

          <img
            src={assets.group_profiles}
            alt="Group"
            className="w-32 md:w-40 mx-auto md:mx-0 mb-4"
          />

          <p className="text-base md:text-lg mb-6 text-gray-200 text-center md:text-left">
            Connect with expert doctors anytime, anywhere.
            Book your visit online — fast and hassle-free.
            Because your wellness deserves the best care.
          </p>

          <button onClick={() => { document.getElementById('doctors').scrollIntoView({ behavior: 'smooth' }) }} className="mx-auto md:mx-0 bg-white text-[#1E3A8A] font-semibold px-6 py-3 rounded-full hover:bg-[#3B82F6] hover:text-white hover:scale-105 hover:shadow-lg active:bg-[#3B82F6] active:text-white active:scale-105 active:shadow-lg focus:bg-[#3B82F6] focus:text-white transition-all duration-300 ease-in-out cursor-pointer">
            Book Appointment →
          </button>
        </div>

        {/* Right side image */}
        <div className="flex justify-center items-center">
          <img
            src={assets.header_img}
            alt="Doctors"
            className="w-[300px] sm:w-[380px] md:w-[600px] pt-6  md:mt-22 h-auto object-contain drop-shadow-lg"

          />
        </div>
      </section>
    </div>
  );
};

export default Header;

