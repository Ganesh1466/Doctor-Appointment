import React, { use, useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Relateddoctor from '../components/Relateddoctor';

import { toast } from 'react-toastify';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const daysOfWeek = ['Sun', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // ... (previous state)

  const bookAppointment = async () => {
    if (!user) {
      alert("Please login to book appointment");
      navigate('/login');
      return;
    }
    if (!slotTime) {
      alert("Please select a time slot");
      return;
    }

    try {
      // Check profile completion
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile check error:", profileError);
        toast.error("Failed to check profile status");
        return;
      }

      // Check for required fields
      if (!userProfile.phone || !userProfile.dob || !userProfile.gender || userProfile.gender === 'Not Selected' || !userProfile.address?.line1) {
        toast.warn("Please complete your profile to book an appointment");
        navigate('/my-profile');
        return;
      }

      const date = docSlots[slotIndex].date;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      // Use name from profile
      let patientName = userProfile.name || 'Unknown';

      // Insert directly into Supabase appointments table
      const { data, error } = await supabase.from('appointments').insert([{
        user_id: user.id,
        patient_name: patientName,
        doc_id: docId,
        slot_date: slotDate,
        slot_time: slotTime,
        amount: docInfo.fees,
        date: new Date(),
        doc_data: docInfo
      }]);

      if (error) {
        console.error(error);
        toast.error(error.message);
      } else {
        toast.success("Appointment Booked");
        getAvailableSlots();
        navigate('/my-appointments');
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }
  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  const fetchDocInfo = () => {
    const docInfo = doctors.find(doc => doc.id === docId);
    setDocInfo(docInfo);
  };
  const getAvailableSlots = () => {
    setDocSlots([]); // clear first

    let today = new Date();
    let allSlots = [];     // ← ADDED (to collect slots for each day)

    for (let i = 0; i < 7; i++) {

      let currentdate = new Date(today);
      currentdate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentdate.getDate()) {
        currentdate.setHours(today.getHours() > 10 ? currentdate.getHours() + 1 : 10);
        currentdate.setMinutes(today.getMinutes() > 30 ? 30 : 0);
      } else {
        currentdate.setHours(10);
        currentdate.setMinutes(0);
      }

      let timeslots = [];

      while (currentdate < endTime) {
        let formatedTime = currentdate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        timeslots.push(formatedTime);
        currentdate.setMinutes(currentdate.getMinutes() + 30);
      }


      allSlots.push({
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
        slots: timeslots
      });
    }


    setDocSlots(allSlots);
  };


  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);



  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);
  useEffect(() => {
    console.log(docSlots);
  }, [docSlots])

  if (!docInfo) return <div className="text-center p-10 text-lg">Loading...</div>;

  return (

    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Main Section */}
      <div className="flex justify-center py-6 px-3 flex-grow">
        <div className="flex flex-col lg:flex-row gap-6 max-w-5xl w-full">

          {/* LEFT: Doctor Image */}
          <div className="w-full  lg:w-80 bg-blue-400 rounded-xl shadow-md p-4 flex items-center justify-center">
            <img
              src={docInfo.image}
              alt="Doctor"
              className="rounded-lg w-full  h-56 sm:h-72 object-cover"
            />
          </div>

          {/* RIGHT: Doctor Info */}
          <div className="flex-1 bg-white border border-gray-300 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">{docInfo.name}</p>
              <img src={assets.verified_icon} alt="Verified" className="w-6 h-6" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg">{docInfo.degree} - {docInfo.speciality}</p>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                {docInfo.experience}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold">About</p>
                <img src={assets.info_icon} alt="About" className="w-5 h-5" />
              </div>

              <p className="text-gray-700">{docInfo.about}</p>

              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold">Fees:</p>
                <p className="text-gray-700">₹{docInfo.fees}</p>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* Booking Slot Section */}
      <div className="px-3 pb-8">
        <div className="w-full max-w-xl mx-auto bg-white border border-gray-300 rounded-xl p-6 shadow-md">
          <p className="text-xl font-semibold mb-3">Booking Slots</p>

          {/* Days Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {docSlots.map((day, index) => (
              <div
                key={index}
                onClick={() => setSlotIndex(index)}
                className={`min-w-20 px-3 py-2 rounded-lg text-center cursor-pointer transition-all
                ${slotIndex === index
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                  }`}
              >
                <p className="font-medium text-sm">{daysOfWeek[day.date.getDay()]}</p>
                <p className="text-sm">{day.date.getDate()}</p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="flex gap-3 overflow-x-auto pb-3 mt-4 no-scrollbar">
            {docSlots.length > 0 &&
              docSlots[slotIndex].slots.map((slot, i) => (
                <p
                  key={i}
                  onClick={() => setSlotTime(slot)}
                  className={`px-4 py-2 rounded-lg cursor-pointer text-sm whitespace-nowrap transition-all
                  ${slotTime === slot
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 hover:bg-gray-200"
                    }`}
                >
                  {slot.toLowerCase()}
                </p>
              ))}
          </div>

          <button
            onClick={bookAppointment}
            className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md"
          >
            Book Appointment
          </button>
        </div>

        {/* Related Doctors */}
        <div className="mt-10">
          <Relateddoctor docId={docId} speciality={docInfo.speciality} />
        </div>
      </div>

      <Footer />
    </div>
  );


};

export default Appointment;
