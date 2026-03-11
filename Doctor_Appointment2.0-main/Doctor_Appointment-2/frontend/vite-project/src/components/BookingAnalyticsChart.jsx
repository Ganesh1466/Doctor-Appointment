import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

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
      bookings: Number(item.bookings ?? item.count ?? 0),
    }))
    .filter((item) => item.month && !Number.isNaN(item.bookings));

  return sortByMonthOrder(sanitized);
};

const BookingAnalyticsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const response = await axios.get(`${baseUrl.replace(/\/+$/, '')}/api/admin/booking-stats`, {
          signal: controller.signal,
        });

        const chartData = formatToChartData(response.data);
        setData(chartData);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Booking stats failed', err);
          setError('Unable to load booking analytics.');
          setData([]);
        }
      } finally {
        setLoading(false);
        // Small delay to ensure DOM dimensions are stabilized
        setTimeout(() => setIsReady(true), 200);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const chartData = useMemo(() => data, [data]);

  return (
    <div className="w-full rounded-2xl bg-black/80 border border-white/10 p-5 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white text-xl font-semibold">Monthly Bookings</h3>
          <p className="text-gray-300 text-sm">Bookings per month (based on appointment date).</p>
        </div>
        {error && (
          <span className="text-xs text-pink-200 bg-pink-900/30 px-3 py-1 rounded-full">
            {error}
          </span>
        )}
      </div>

      <div className="w-full" style={{ height: '300px', minHeight: '300px', minWidth: '300px', position: 'relative' }}>
        {loading || !isReady ? (
          <div className="flex h-full items-center justify-center text-gray-300">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <span>{loading ? 'Loading analytics...' : 'Preparing chart...'}</span>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-300">
            No booking data available.
          </div>
        ) : (
          <ResponsiveContainer width="99%" height="99%">
            <AreaChart data={chartData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity={0.9} />
                  <stop offset="60%" stopColor="#f472b6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity={0.2} />
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
                cursor={{ stroke: '#a855f7', strokeWidth: 2 }}
                formatter={(value) => [value, 'Bookings']}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#c084fc"
                strokeWidth={2.5}
                fill="url(#bookingGradient)"
                activeDot={{ r: 6 }}
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default BookingAnalyticsChart;
