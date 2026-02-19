import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { assets } from "../assets/assets";
import { supabase } from "../supabase";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  // const [token, setToken] = useState(true); // Removed local state
  const [openMenu, setOpenMenu] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('image')
            .eq('id', user.id)
            .single();

          if (data) {
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [user]);


  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="text-black px-6 py-3 flex items-center justify-between shadow-md relative">
      {/* Logo */}
      <div>
        <img className="w-20 h-10 cursor-pointer" src="/logo.png" alt="logo" />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-8 text-lg font-medium mx-auto">
        <li><button onClick={() => navigate("/")} className="hover:underline  hover:text-blue-500 underline-offset-4">Home</button></li>
        <li><button onClick={() => navigate("/doctors")} className="hover:underline  hover:text-blue-500  underline-offset-4">Doctor</button></li>
        <li><button onClick={() => navigate("/contact")} className="hover:underline  hover:text-blue-500 underline-offset-4">Contact</button></li>
        <li><button onClick={() => navigate("/about")} className="hover:underline  hover:text-blue-500 underline-offset-4">About</button></li>
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {/* Desktop Dropdown */}
            <div className="hidden md:flex items-center gap-2 group cursor-pointer relative">
              <img className="w-10 h-10 rounded-full object-cover" src={userData?.image || assets.profile_pic} alt="profile" />
              <img className="w-3 h-3" src={assets.dropdown_icon} alt="dropdown" />

              <div className="absolute right-0 top-0 text-base font-semibold text-black bg-white shadow-lg rounded-md mt-10 py-2 px-4 w-40 z-20 hidden group-hover:block">
                <p onClick={() => navigate("/my-profile")} className="hover:text-blue-500 cursor-pointer py-1">My Profile</p>
                <p onClick={() => navigate("/my-appointments")} className="hover:text-blue-500 cursor-pointer py-1">My Appointment</p>
                <p onClick={handleLogout} className="hover:text-blue-500 cursor-pointer py-1" >Logout</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setOpenMenu(true)}
                className="text-2xl text-gray-700 focus:outline-none"
              >
                ☰
              </button>
            </div>

            {/* Fullscreen Mobile Menu */}
            {openMenu && (
              <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-6 text-black text-lg font-semibold">
                <button
                  onClick={() => setOpenMenu(false)}
                  className="absolute top-5 right-6 text-3xl font-bold"
                >
                  ✕
                </button>

                {/* Main Navigation */}
                <p onClick={() => { setOpenMenu(false); navigate("/"); }} className="hover:text-blue-400 hover:font-bold cursor-pointer py-2">Home</p>
                <p onClick={() => { setOpenMenu(false); navigate("/doctors"); }} className="hover:text-blue-500 hover:font-bold cursor-pointer py-2">All Doctor</p>
                <p onClick={() => { setOpenMenu(false); navigate("/contact"); }} className="hover:text-blue-500 hover:font-bold  cursor-pointer py-2">Contact</p>
                <p onClick={() => { setOpenMenu(false); navigate("/about"); }} className="hover:text-blue-500 hover:font-bold cursor-pointer ">About</p>



              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-400 text-white px-4 py-2 rounded-full hover:bg-blue-500 transition"
          >
            Create Account
          </button>
        )}
        <button
          onClick={() => navigate("/admin-login")}
          className="border border-gray-500 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-100 transition text-sm ml-2"
        >
          Admin Panel
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
