import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import {
    doc1, doc2, doc3, doc4, doc5, doc6, doc7,
    doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15
} from '../assets/assets'

const DoctorDashboard = () => {
    const navigate = useNavigate()

    const [doctor, setDoctor] = useState(null)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    const imageMap = {
        doc1, doc2, doc3, doc4, doc5, doc6, doc7,
        doc8, doc9, doc10, doc11, doc12, doc13, doc14, doc15
    }

    useEffect(() => {
        const storedDoctor = sessionStorage.getItem('doctorData')
        if (!storedDoctor) {
            navigate('/doctor-login')
            return
        }

        const doc = JSON.parse(storedDoctor)
        if (imageMap[doc.image]) doc.image = imageMap[doc.image]

        setDoctor(doc)
        fetchAppointments(doc.id)
    }, [])

    const fetchAppointments = async (doctorId) => {
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('doc_id', doctorId)
            .order('date', { ascending: false })

        if (error) {
            toast.error(error.message)
            console.error("Error fetching appointments:", error)
        } else {
            console.log("Appointments fetched:", data)
            setAppointments(data)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (!doctor) return

        const channel = supabase
            .channel('doctor-appointments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `doc_id=eq.${doctor.id}`
                },
                () => fetchAppointments(doctor.id)
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [doctor])

    const updateStatus = async (id, type) => {
        const update =
            type === 'accept'
                ? { is_completed: true, cancelled: false }
                : { cancelled: true, is_completed: false }

        const { error } = await supabase
            .from('appointments')
            .update(update)
            .eq('id', id)

        if (error) {
            toast.error(error.message)
        } else {
            toast.success(`Appointment ${type === 'accept' ? 'Accepted' : 'Rejected'}`)
            fetchAppointments(doctor.id)
        }
    }

    if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>

    return (
        <div className="p-6 max-w-6xl mx-auto">

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white shadow-lg rounded-xl p-6 mb-8 border">
                <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-40 h-40 rounded-lg object-cover"
                />

                <div>
                    <h1 className="text-3xl font-bold">{doctor.name}</h1>
                    <p className="text-gray-500">{doctor.speciality}</p>
                    <p className="mt-2">{doctor.degree} • {doctor.experience}</p>
                    <p className="mt-3 text-sm text-gray-600">{doctor.about}</p>
                    <p className="mt-4 font-semibold">Fees: ₹{doctor.fees}</p>
                </div>
                <div className="md:ml-auto">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('doctorData');
                            navigate('/doctor-login');
                            toast.success("Logged out successfully");
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Appointment Requests</h2>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        <div className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr] gap-1 bg-gray-100 p-4 font-semibold text-sm border-b">
                            <p>#</p>
                            <p>Patient</p>
                            <p>Date</p>
                            <p>Time</p>
                            <p>Status</p>
                            <p>Action</p>
                        </div>

                        {appointments.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-[0.5fr_2fr_1fr_1fr_1fr_1fr] gap-1 p-4 border-b hover:bg-gray-50 items-center text-sm">
                                <p>{index + 1}</p>

                                <p className="font-medium">{item.patient_name}</p>

                                <p>{item.slot_date}</p>
                                <p>{item.slot_time}</p>

                                <div className="flex items-center gap-2">
                                    {!item.cancelled && !item.is_completed && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    )}

                                    <span className={`font-medium ${item.cancelled
                                        ? 'text-red-500'
                                        : item.is_completed
                                            ? 'text-green-600'
                                            : 'text-orange-500'
                                        }`}>
                                        {item.cancelled
                                            ? 'Rejected'
                                            : item.is_completed
                                                ? 'Accepted'
                                                : 'Pending'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {!item.cancelled && !item.is_completed && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(item.id, 'accept')}
                                                className="px-3 py-1 bg-green-500 text-white rounded"
                                            >
                                                Accept
                                            </button>

                                            <button
                                                onClick={() => updateStatus(item.id, 'reject')}
                                                className="px-3 py-1 bg-red-500 text-white rounded"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {item.is_completed && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded font-semibold">
                                            Accepted
                                        </span>
                                    )}

                                    {item.cancelled && (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold">
                                            Rejected
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {appointments.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        No appointment requests yet
                    </div>
                )}
            </div>
        </div>
    )
}

export default DoctorDashboard

