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

  // Fetch user profile on mount
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
      if (error) throw error;

      if (data && data.length > 0) {
        const profile = data[0];
        setUserData({
          name: profile.name || "",
          email: profile.email || user.email,
          phone: profile.phone || "",
          address: profile.address || { line1: "", line2: "" },
          gender: profile.gender || "Not Selected",
          dob: profile.dob || "",
          image: profile.image || ""
        });
      }
    } catch (error) {
      console.error("Error fetching/creating profile:", error);
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

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload to Backend (Cloudinary)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/upload-image`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Upload failed");
      }

      const publicUrl = data.imageURL;

      // Update local state
      setUserData(prev => ({ ...prev, image: publicUrl }));

      // Update DB (Supabase Users Table)
      const { error: dbError } = await supabase
        .from('users')
        .update({ image: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      toast.success("Profile image updated via Backend!");

    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(`Image upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          phone: userData.phone,
          address: userData.address, // Ensure valid JSON in DB
          gender: userData.gender,
          dob: userData.dob,
          image: userData.image // Also save image url if it was just set in state but not db? (Redundant but safe)
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
      setIsEdit(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading profile...</div>;

  return (
    <>
      <Navbar />

      <div className="ml-60 p-4 max-w-xl text-left">

        {/* Profile Image */}
        <div className="mb-4 relative w-32 h-32">
          <img
            src={userData.image || assets.profile_pic}
            alt="profile"
            className="w-full h-full rounded-md object-cover"
          />
          {isEdit && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md cursor-pointer group">
              <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
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
            className="border p-1 rounded w-60 mb-3 text-sm"
          />
        ) : (
          <p className="text-3xl font-semibold mb-3">{userData.name}</p>
        )}

        <hr className="my-4" />

        {/* CONTACT INFORMATION */}
        <p className="text-lg font-semibold mb-3">CONTACT INFORMATION</p>

        {/* Email */}
        <div className="flex items-center mb-2">
          <p className="w-32 font-medium">Email id:</p>

          <p className="text-blue-600">{userData.email}</p>
        </div>

        {/* Phone */}
        <div className="flex items-center mb-2">
          <p className="w-32 font-medium">Phone:</p>

          {isEdit ? (
            <input
              type="text"
              value={userData.phone}
              onChange={e => setUserData(prev => ({ ...prev, phone: e.target.value }))}
              className="border p-1 rounded w-60 text-sm"
            />
          ) : (
            <p>{userData.phone}</p>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start mb-2">
          <p className="w-32 font-medium">Address:</p>

          {isEdit ? (
            <div>
              <input
                type="text"
                value={userData.address?.line1 || ''}
                onChange={e =>
                  setUserData(prev => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value }
                  }))
                }
                className="border p-1 rounded w-60 mb-1 text-sm"
              />
              <input
                type="text"
                value={userData.address?.line2 || ''}
                onChange={e =>
                  setUserData(prev => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value }
                  }))
                }
                className="border p-1 rounded w-60 text-sm"
              />
            </div>
          ) : (
            <div>
              <p>{userData.address?.line1}</p>
              <p>{userData.address?.line2}</p>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* BASIC INFORMATION */}
        <p className="text-lg font-semibold mb-3">BASIC INFORMATION</p>

        {/* Gender */}
        <div className="flex items-center mb-3">
          <p className="w-32 font-medium">Gender:</p>

          {isEdit ? (
            <select
              value={userData.gender}
              onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
              className="border p-1 rounded w-60 text-sm"
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
        <div className="flex items-center mb-4">
          <p className="w-32 font-medium">Birthday:</p>

          {isEdit ? (
            <input
              type="date"
              value={userData.dob}
              onChange={e => setUserData(prev => ({ ...prev, dob: e.target.value }))}
              className="border p-1 rounded w-60 text-sm"
            />
          ) : (
            <p>{userData.dob}</p>
          )}
        </div>

        {/* Button */}
        <button
          onClick={() => isEdit ? handleSave() : setIsEdit(true)}
          className="mt-3 bg-blue-600 text-white px-8 py-2 rounded-full hover:bg-blue-700 transition"
        >
          {isEdit ? "Save Information" : "Edit Information"}
        </button>

      </div>
    </>
  )
}

export default Myprofile
