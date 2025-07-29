// File: src/pages/StockDetail/StockDetailPage.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getStockDetails, getHistoricalData } from '../../api/stocksApi';
import PageHeader from '../../components/shared/PageHeader';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Metric = ({ label, value, unit = '', className = '' }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <p className="text-sm text-gray-400">{label}</p>
    <p className={`text-2xl font-bold text-white ${className}`}>
      {typeof value === 'number' ? value.toLocaleString(undefined, {maximumFractionDigits: 2}) : value}
      {unit}
    </p>
  </div>
);

// Custom tooltip for the chart for better styling
const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-gray-700 border border-gray-600 rounded-lg shadow-lg text-sm">
                <p className="label text-gray-300 font-bold">{`Date: ${label}`}</p>
                <p className="intro text-teal-400">{`Price: ${payload[0].value.toFixed(2)} ₹`}</p>
            </div>
        );
    }
    return null;
};


export default function StockDetailPage() {
  const { ticker } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  // Query for the main stock details
  const { data: stock, isLoading: isLoadingStock, isError: isErrorStock, error: errorStock } = useQuery({
    queryKey: ['stockDetails', ticker],
    queryFn: () => getStockDetails(ticker, userInfo.token),
    enabled: !!userInfo,
  });

  // Query for the historical data for the chart
  const { data: historicalData, isLoading: isLoadingChart } = useQuery({
    queryKey: ['historicalData', ticker],
    queryFn: () => getHistoricalData(ticker),
    enabled: !!stock, // Only run this query after the main stock details have been fetched
  });

  if (isLoadingStock) return <Loader />;
  if (isErrorStock) return <ErrorMessage message={errorStock.message} />;

  // Transform historical data for the chart
  const chartData = historicalData?.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-GB'),
    price: (1 + d.portfolioReturn / 100) * (stock.currentPrice / (1 + (historicalData[historicalData.length - 1]?.portfolioReturn || 0) / 100))
  }));

  return (
    <div>
      <PageHeader title={stock?.longName || ticker} subtitle={`Ticker: ${stock?.ticker}`} />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <Metric label="Current Price" value={stock?.currentPrice} unit=" ₹" className="text-teal-400" />
        <Metric label="Momentum Score" value={stock?.momentumScore} className="text-purple-400" />
        <Metric label="Alpha (1Y)" value={stock?.alpha} unit="%" className={stock?.alpha > 0 ? 'text-green-400' : 'text-red-400'} />
        <Metric label="Market Cap" value={(stock?.marketCap / 10000000)?.toFixed(2)} unit=" Cr" />
        <Metric label="P/E Ratio" value={stock?.trailingPE?.toFixed(2)} />
        <Metric label="EPS" value={stock?.epsTrailingTwelveMonths?.toFixed(2)} />
        <Metric label="52-Week High" value={stock?.fiftyTwoWeekHigh} unit=" ₹" />
        <Metric label="52-Week Low" value={stock?.fiftyTwoWeekLow} unit=" ₹" />
      </div>

      {/* Chart Section */}
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        <h3 className="text-xl font-bold mb-4">Price Chart (1 Year)</h3>
        <div style={{ width: '100%', height: 300 }}>
          {isLoadingChart ? <Loader /> : (
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis dataKey="date" stroke="#A0AEC0" tick={{ fontSize: 12 }} />
                <YAxis stroke="#A0AEC0" domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Line type="monotone" dataKey="price" name="Price" stroke="#38B2AC" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Performance & Technicals Sections */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-400">1 Day</span><span className={stock?.perf1D > 0 ? 'text-green-400' : 'text-red-400'}>{stock?.perf1D}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">1 Week</span><span className={stock?.perf1W > 0 ? 'text-green-400' : 'text-red-400'}>{stock?.perf1W}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">1 Month</span><span className={stock?.perf1M > 0 ? 'text-green-400' : 'text-red-400'}>{stock?.perf1M}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">6 Months</span><span className={stock?.perf6M > 0 ? 'text-green-400' : 'text-red-400'}>{stock?.perf6M}%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">1 Year</span><span className={stock?.perf1Y > 0 ? 'text-green-400' : 'text-red-400'}>{stock?.perf1Y}%</span></div>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Technical Indicators</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-400">50-Day Avg.</span><span>{stock?.fiftyDayAverage?.toFixed(2)} ₹</span></div>
            <div className="flex justify-between"><span className="text-gray-400">150-Day Avg.</span><span>{stock?.hundredFiftyDayAverage?.toFixed(2)} ₹</span></div>
            <div className="flex justify-between"><span className="text-gray-400">200-Day Avg.</span><span>{stock?.twoHundredDayAverage?.toFixed(2)} ₹</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
