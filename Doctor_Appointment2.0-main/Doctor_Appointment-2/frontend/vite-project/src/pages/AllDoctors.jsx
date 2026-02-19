import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import AdminSidebar from '../components/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const AllDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDoctors = async () => {
            const { data, error } = await supabase.from('doctors').select('*');
            if (error) console.error(error);
            else setDoctors(data);
        };
        fetchDoctors();
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-10 overflow-y-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Doctors List</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <button
                            onClick={() => navigate('/add-doctor')}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition shadow-md w-full md:w-auto font-medium"
                        >
                            + Add Doctor
                        </button>
                        <button
                            onClick={() => navigate('/delete-doctor')}
                            className="bg-white text-red-600 border border-red-200 px-5 py-2 rounded-lg hover:bg-red-50 transition shadow-sm w-full md:w-auto font-medium"
                        >
                            - Delete Doctor
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {doctors.map((item, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                            <div className="relative overflow-hidden bg-blue-50">
                                <img
                                    className="w-full h-48 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                    src={item.image && (item.image.startsWith('http') || item.image.startsWith('data:')) ? item.image : assets[item.image] || assets.doc1}
                                    alt=""
                                />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-full mb-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p>Available</p>
                                </div>
                                <p className="text-gray-900 text-lg font-bold truncate">{item.name}</p>
                                <p className="text-gray-500 text-sm">{item.speciality}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AllDoctors;
