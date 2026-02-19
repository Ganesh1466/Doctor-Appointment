import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { assets } from '../assets/assets';
import AdminSidebar from '../components/AdminSidebar';
import { toast } from 'react-toastify';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch users function
    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) {
                console.error("Error fetching users:", error);
            } else {
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();

        // Real-time subscription
        const channel = supabase
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users',
                },
                (payload) => {
                    console.log("Real-time change received!", payload);
                    fetchUsers();
                    toast.info("User list updated!");
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Simple Date Formatter
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Calculate Chart Data (Users per Month)
    const getChartData = () => {
        const counts = {};
        users.forEach(user => {
            const date = new Date(user.created_at);
            const month = date.toLocaleString('default', { month: 'short' });
            counts[month] = (counts[month] || 0) + 1;
        });
        return Object.entries(counts).map(([month, count]) => ({ month, count }));
    };

    const chartData = getChartData();
    const maxCount = Math.max(...chartData.map(d => d.count), 1);

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />

            <div className="flex-1 p-10 overflow-y-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 tracking-tight">User Analytics</h2>

                {/* Real-time Chart Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                        User Registrations
                    </h3>
                    <div className="flex items-end gap-4 h-48 border-b border-gray-100 pb-2">
                        {chartData.length > 0 ? chartData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                    className="w-full bg-blue-500/90 rounded-t-md hover:bg-blue-600 transition-all duration-300 relative group cursor-pointer"
                                    style={{ height: `${(data.count / maxCount) * 100}%` }}
                                >
                                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs font-bold py-1 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        {data.count} Users
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-gray-400 mt-3">{data.month}</span>
                            </div>
                        )) : (
                            <p className="text-gray-400 w-full text-center self-center text-sm">No data to display</p>
                        )}
                    </div>
                </div>

                {/* User List Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="text-lg font-bold text-gray-700">Registered Users <span className="text-gray-400 font-medium text-sm ml-2">({users.length})</span></h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Image</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Email</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Phone</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Joined Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-4 text-center">Loading users...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-4 text-center">No users found</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <img
                                                    src={user.image || assets.profile_pic}
                                                    alt="User"
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.phone || '-'}</td>
                                            <td className="px-6 py-4 text-gray-500">{formatDate(user.created_at)}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AllUsers;
