import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import AdminSidebar from '../components/AdminSidebar';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const DeleteDoctor = () => {
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            const { data, error } = await supabase.from('doctors').select('*');
            if (error) {
                console.error(error);
                toast.error("Failed to fetch doctors");
            } else {
                setDoctors(data);
            }
        };
        fetchDoctors();
    }, []);

    const deleteDoctor = async (id, name) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY delete Dr. ${name}?`)) {
            try {
                const { error } = await supabase.from('doctors').delete().eq('id', id);
                if (error) {
                    console.error("Error deleting doctor:", error);
                    toast.error("Failed to delete doctor.");
                } else {
                    setDoctors(prev => prev.filter(doc => doc.id !== id));
                    toast.success(`Dr. ${name} deleted successfully`);
                }
            } catch (err) {
                console.error(err);
                toast.error("An error occurred");
            }
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-10 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-semibold text-red-600">Delete Doctors</h2>
                    <button
                        onClick={() => navigate('/all-doctors')}
                        className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
                    >
                        &larr; Back to List
                    </button>
                </div>

                <p className="mb-4 text-gray-500">Select a doctor to permanently remove them from the system.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {doctors.map((item, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 relative">
                            <img
                                className="bg-blue-50 w-full opacity-80"
                                src={item.image && (item.image.startsWith('http') || item.image.startsWith('data:')) ? item.image : assets[item.image] || assets.doc1}
                                alt=""
                            />

                            <div className="p-4">
                                <p className="text-gray-900 text-lg font-medium opacity-75">{item.name}</p>
                                <p className="text-gray-600 text-sm">{item.speciality}</p>

                                <button
                                    onClick={() => deleteDoctor(item.id, item.name)}
                                    className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                                >
                                    <span>🗑️</span> Delete Permanently
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DeleteDoctor;
