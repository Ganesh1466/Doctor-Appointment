import React from "react";

const Footer = () => {
  return (
    <footer className=" text-black px-8 py-10 rounded-t-2xl">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
        {/* Left Side */}
        <div>
          <img src="/loges.png" alt="Logo" className="w-24 mx-auto md:mx-0 mb-3" />
          <p className="text-sm text-black-300">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque officia cum
            voluptate corporis quos non veritatis mollitia dolorum obcaecati fugit.
          </p>
        </div>

        {/* Center */}
        <div>
          <p className="text-lg font-semibold mb-3">COMPANY</p>
          <ul className="space-y-2 text-black-200">
            <li className="hover:text-black hover:font-semibold cursor-pointer">Home</li>
            <li className="hover:text-black  hover:font-semibold cursor-pointer">About Us</li>
            <li className="hover:text-black  hover:font-semibold cursor-pointer">Delivery</li>
            <li className="hover:text-black  hover:font-semibold cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Right Side */}
        <div>
          <p className="text-lg font-semibold mb-3">GET IN TOUCH</p>
          <p className="text-black-200 text-sm">+0-000-000-000</p>
          <p className="text-black-200 text-sm">ganeshghule757@gmail.com</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-400 mt-8 pt-4 text-center text-sm text-black-400">
        <p>Copyright © 2024 @ GaneshGhule.dev — All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
