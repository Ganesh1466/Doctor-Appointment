import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'

const MyAppointment = () => {
  const { doctors } = useContext(AppContext)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])

  const getUserAppointments = async () => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('cancelled', false)
        .order('id', { ascending: false })

      if (error) {
        toast.error(error.message)
      } else {
        const appointmentsWithData = data.map(appt => {
          const docData = doctors.find(doc => doc.id === appt.doc_id) || appt.doc_data
          return { ...appt, docData }
        })
        setAppointments(appointmentsWithData)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }


  const cancelAppointment = async (appointmentId) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Appointment Cancelled')
        setAppointments(prev =>
          prev.filter(item => item.id !== appointmentId)
        )
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      getUserAppointments()
    } else {
      navigate('/login')
    }
  }, [user, doctors])

  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('my-appointments')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // For simplicity, just refetch
          getUserAppointments()
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  return (
    <div>
      <Navbar />
      <div className="px-4 sm:px-8">
        <p className="pb-3 mt-12 text-xl font-bold text-zinc-800 border-b-2 border-indigo-500">
          My Appointments
        </p>

        {appointments.length === 0 && (
          <p className="text-center text-zinc-500 mt-10">
            No active appointments
          </p>
        )}

        <div className="mt-6 space-y-5">
          {appointments.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col sm:flex-row gap-6"
            >
              <img
                src={assets[item.docData?.image] || item.docData?.image}
                alt=""
                className="w-32 h-32 object-cover rounded-lg border bg-indigo-50"
              />

              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-lg font-semibold text-indigo-700">
                  {item.docData?.name}
                </p>
                <p>{item.docData?.speciality}</p>

                <p className="text-zinc-700 font-medium mt-2">Address:</p>
                <p className="text-xs">{item.docData?.address?.line1}</p>
                <p className="text-xs">{item.docData?.address?.line2}</p>

                <p className="text-xs mt-2">
                  <span className="text-sm font-medium text-neutral-700">
                    Date & Time:
                  </span>{' '}
                  {item.slot_date} | {item.slot_time}
                </p>

                {/* Status Indicator */}
                {item.is_completed && (
                  <div className="flex items-center gap-2 mt-2 text-green-500 font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p>Appointment Accepted</p>
                  </div>
                )}
                {!item.is_completed && !item.cancelled && (
                  <div className="flex items-center gap-2 mt-2 text-orange-500 font-medium">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <p>Pending Approval</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 justify-end">
                <button className="text-sm sm:min-w-48 py-2 border rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                  Pay Online
                </button>

                <button
                  onClick={() => cancelAppointment(item.id)}
                  className="text-sm sm:min-w-48 py-2 border rounded-lg hover:bg-red-600 hover:text-white transition-all"
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default MyAppointment
