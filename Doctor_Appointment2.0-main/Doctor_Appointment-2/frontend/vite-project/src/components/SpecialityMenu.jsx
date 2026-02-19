import React from "react";
import { specialityData } from "../assets/assets";
import { Link } from "react-router-dom";

const SpecialityMenu = () => {
  return (
    <div
      className="flex flex-col scrollbar-hide items-center  gap-6 py-12 -mt-110 px-6 bg-gray-100 text-gray-800"
      id="speciality"
    >
      <h1 className="text-3xl font-bold text-center text-[#1E3A8A]">
        Find by Speciality
      </h1>
      <p className="text-center text-gray-600 max-w-2xl">
        Simply browse through our extensive list of trusted doctors and schedule
        your appointment hassle-free.
      </p>

      <div className="flex overflow-x-auto justify-start md:justify-center gap-6 mt-8 w-full px-4 scrollbar-hide">
        {specialityData.map((item, index) => (
          <Link
            key={index}
            to={`/doctors/${item.speciality}`}
            className="flex-shrink-0 flex flex-col items-center bg-white p-5 rounded-2xl shadow-md w-36 md:w-44 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
          >
            <img
              src={item.image}
              alt={item.speciality}
              className="w-20 h-20 md:w-24 md:h-24 object-contain mb-3"
            />
            <p className="text-[#1E3A8A] font-semibold text-center hover:text-[#3B82F6]">
              {item.speciality}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SpecialityMenu;
