
import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { toast } from 'react-toastify'

const Myprofile = () => {
  const { user } = useAuth();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: ""
    },
    gender: "Not Selected",
    dob: "",
    image: ""
  })

  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dobError, setDobError] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      const fallbackName = user?.user_metadata?.name || user?.user_metadata?.full_name || "";

      setUserData({
        name: data?.name || fallbackName,
        email: data?.email || user.email,
        phone: data?.phone || "",
        address: data?.address || { line1: "", line2: "" },
        gender: data?.gender || "Not Selected",
        dob: data?.dob || "",
        image: data?.image || ""
      });

    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Could not load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/upload-image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      const publicUrl = data.imageURL;

      setUserData(prev => ({ ...prev, image: publicUrl }));

      const { error: dbError } = await supabase
        .from('users')
        .upsert({ id: user.id, email: user.email, image: publicUrl });

      if (dbError) throw dbError;

      toast.success("Profile image updated!");

    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(`Image upload failed`);
    } finally {
      setUploading(false);
    }
  }

  const handleSave = async () => {
    try {
      if (userData.phone && userData.phone.length !== 10) {
        toast.error("Phone number must be exactly 10 digits");
        return;
      }

      if (userData.dob) {
        const selectedDate = new Date(userData.dob);
        const today = new Date();
        today.setHours(0, 0, 0, 0)

        if (selectedDate > today) {
          toast.error("Birthday cannot be in the future");
          return;
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
          address: JSON.stringify(userData.address),
          gender: userData.gender,
          dob: userData.dob
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Profile updated successfully");
        setIsEdit(false);
        await fetchProfile(); // Refresh local data
      } else {
        toast.error(result.message || "Failed to update profile");
      }

    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };


  return (
    <>
      <Navbar />

      <div className="md:ml-60 p-4 max-w-xl w-full text-left">

        {/* Profile Image */}
        <div className="mb-4 relative w-24 h-24 sm:w-32 sm:h-32">
          <img
            src={userData.image || assets.profile_pic}
            alt="profile"
            className="w-full h-full rounded-md object-cover"
          />

          {isEdit && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md cursor-pointer group">
              <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100">
                {uploading ? "Uploading..." : "Change Photo"}
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
            </div>
          )}
        </div>

        {/* Name */}
        {isEdit ? (
          <input
            type="text"
            value={userData.name}
            onChange={e => setUserData(prev => ({ ...prev, name: e.target.value }))}
            className="border p-2 rounded w-full sm:w-80 mb-3 text-sm"
          />
        ) : (
          <p className="text-2xl sm:text-3xl font-semibold mb-3">{userData.name}</p>
        )}

        <hr className="my-4 border-gray-200" />

        {/* CONTACT INFORMATION */}
        <p className="text-base sm:text-lg font-semibold mb-3 text-gray-700">CONTACT INFORMATION</p>

        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-2">
          <p className="w-32 font-medium text-gray-600 mb-1 sm:mb-0">Email id:</p>
          <p className="text-blue-600 break-all">{userData.email}</p>
        </div>

        {/* PHONE */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-2">
          <p className="w-32 font-medium text-gray-600 mb-1 sm:mb-0">Phone:</p>

          {isEdit ? (
            <input
              type="tel"
              value={userData.phone || ""}
              onChange={(e) => {

                let value = e.target.value.replace(/\D/g, "")

                if (value.length > 10) {
                  value = value.slice(0, 10)
                }

                setUserData(prev => ({
                  ...prev,
                  phone: value
                }))

              }}
              maxLength="10"
              inputMode="numeric"
              className="border p-2 rounded w-full sm:w-80 text-sm"
              placeholder="Enter 10 digit phone"
            />
          ) : (
            <p>{userData.phone}</p>
          )}
        </div>

        {/* ADDRESS */}
        <div className="flex flex-col sm:flex-row mb-4 sm:mb-2">
          <p className="w-32 font-medium text-gray-600 mb-1 sm:mb-0">Address:</p>

          {isEdit ? (
            <div className="w-full sm:w-80 space-y-2">
              <input
                type="text"
                value={userData.address.line1}
                onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))}
                className="border p-2 rounded w-full text-sm"
                placeholder="Address Line 1"
              />
              <input
                type="text"
                value={userData.address.line2}
                onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))}
                className="border p-2 rounded w-full text-sm"
                placeholder="Address Line 2"
              />
            </div>
          ) : (
            <p className="text-gray-500">
              {userData.address.line1} <br />
              {userData.address.line2}
            </p>
          )}
        </div>

        {/* BASIC INFORMATION */}
        <hr className="my-4 border-gray-200" />
        <p className="text-base sm:text-lg font-semibold mb-3 text-gray-700">BASIC INFORMATION</p>

        {/* Gender */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-4 sm:mb-3">
          <p className="w-32 font-medium text-gray-600 mb-1 sm:mb-0">Gender:</p>

          {isEdit ? (
            <select
              value={userData.gender}
              onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
              className="border p-2 rounded w-full sm:w-80 text-sm bg-white"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Not Selected</option>
            </select>
          ) : (
            <p>{userData.gender}</p>
          )}
        </div>

        {/* DOB */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <p className="w-32 font-medium text-gray-600 mb-1 sm:mb-0">Birthday:</p>

          {isEdit ? (
            <div className="w-full sm:w-80">
              <input
                type="date"
                value={userData.dob || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const selectedDate = new Date(value);
                  const today = new Date();

                  today.setHours(0, 0, 0, 0);

                  if (selectedDate > today) {
                    setDobError("Future date is not allowed");

                    // reset date
                    setUserData((prev) => ({
                      ...prev,
                      dob: ""
                    }));

                    return;
                  }

                  setDobError("");

                  setUserData((prev) => ({
                    ...prev,
                    dob: value
                  }));
                }}
                max={new Date().toISOString().split("T")[0]}
                className="border p-2 rounded w-full text-sm"
              />

              {dobError && (
                <p className="text-red-500 text-xs mt-1">{dobError}</p>
              )}
            </div>
          ) : (
            <p>{userData.dob}</p>
          )}
        </div>
        <button
          onClick={() => isEdit ? handleSave() : setIsEdit(true)}
          className="mt-4 w-full sm:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-full hover:bg-blue-700 transition shadow-sm"
        >
          {isEdit ? "Save Information" : "Edit Information"}
        </button>

      </div>
    </>
  )
}

export default Myprofile;

