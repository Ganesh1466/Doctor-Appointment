import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const MOCK_DATA = [
  { month: 'Jan', logins: 20 },
  { month: 'Feb', logins: 35 },
  { month: 'Mar', logins: 50 },
  { month: 'Apr', logins: 45 },
  { month: 'May', logins: 70 },
  { month: 'Jun', logins: 60 },
];

const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const sortByMonthOrder = (data = []) => {
  return [...data].sort((a, b) => {
    return MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month);
  });
};

const formatToChartData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  const sanitized = rawData
    .map((item) => ({
      month: String(item.month || '').slice(0, 3),
      logins: Number(item.logins ?? item.count ?? 0),
    }))
    .filter((item) => item.month && !isNaN(item.logins));

  return sortByMonthOrder(sanitized);
};

const UserLoginChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const url = `${baseUrl.replace(/\/+$/, '')}/api/admin/login-stats`;

        const response = await axios.get(url, {
          signal: controller.signal,
        });

        const chartData = formatToChartData(response.data);
        setData(chartData.length ? chartData : formatToChartData(MOCK_DATA));
      } catch (err) {
        console.error('Failed to load chart data', err);
        setError('Unable to load analytics — showing sample data.');
        setData(formatToChartData(MOCK_DATA));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => controller.abort();
  }, []);

  const chartData = useMemo(() => (data.length ? data : formatToChartData(MOCK_DATA)), [data]);

  return (
    <div className="w-full rounded-2xl bg-black/70 border border-white/10 p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white text-xl font-semibold">Monthly User Registrations</h3>
          <p className="text-gray-300 text-sm">Tracking new user signups by month.</p>
        </div>
        {error && (
          <span className="text-xs text-amber-200 bg-amber-900/30 px-3 py-1 rounded-full">
            {error}
          </span>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                <stop offset="75%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ffffff22" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#e5e7eb', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#e5e7eb', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: 10,
                color: '#f8fafc',
              }}
              cursor={{ stroke: '#4f46e5', strokeWidth: 2 }}
              formatter={(value) => [value, 'Registrations']}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="logins"
              stroke="url(#colorLine)"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
              activeDot={{ r: 6 }}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {loading && (
        <div className="mt-4 text-sm text-gray-300">Loading chart…</div>
      )}
    </div>
  );
};

export default UserLoginChart;
