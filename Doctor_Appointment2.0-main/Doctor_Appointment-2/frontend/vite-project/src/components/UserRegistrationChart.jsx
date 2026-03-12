import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

const UserRegistrationChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('aToken');
      if (!token) {
        setError('No admin token found');
        setLoading(false);
        return;
      }

      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${baseUrl.replace(/\/+$/, '')}/api/admin/registration-stats`, {
        headers: { aToken: token }
      });

      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch registration stats:', err);
      setError('Failed to load user registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up real-time socket listener
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const socket = io(baseUrl.replace(/\/+$/, ''));

    socket.on('newUserRegistered', (newUser) => {
      console.log('Real-time update: New user registered!', newUser);
      // Re-fetch data to update the graph
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658', '#ff8042', '#ff7300', '#ff0000', '#00ff00', '#0000ff'];

  return (
    <div className="w-full rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col mb-6">
        <h3 className="text-white text-xl font-bold tracking-tight">Real-Time Registrations</h3>
        <p className="text-gray-400 text-sm mt-1">Live user growth tracking from Supabase Auth</p>
      </div>

      <div className="w-full h-[320px] min-h-[300px] relative">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400 text-sm font-medium animate-pulse">Fetching statistics...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-red-400 bg-red-900/10 rounded-xl border border-red-900/20 p-4">
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
             No registration data available.
          </div>
        ) : (
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  padding: '12px',
                }}
                itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                labelStyle={{ color: '#f3f4f6', marginBottom: '4px' }}
              />
              <Bar 
                dataKey="registrations" 
                radius={[6, 6, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={0.8} />
                ))}
              </Bar>
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ color: '#9ca3af', fontSize: 12, paddingBottom: '20px' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default UserRegistrationChart;
