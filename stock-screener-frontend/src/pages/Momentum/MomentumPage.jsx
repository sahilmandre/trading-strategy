// File: src/pages/Momentum/MomentumPage.jsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link
import { useMomentumStocks } from '../../hooks/useMomentumStocks';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
import PageHeader from '../../components/shared/PageHeader';

const SortableHeader = ({ children, onClick, sortKey, currentSortKey, sortOrder }) => {
    const isSorted = sortKey === currentSortKey;
    return (
        <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-white cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-x-2">
                <span>{children}</span>
                {isSorted && (
                    <span className="text-teal-400">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                )}
            </div>
        </th>
    );
};


export default function MomentumPage() {
    const { data: stocks, isLoading, isError, error } = useMomentumStocks();
    const [sortConfig, setSortConfig] = useState({ key: 'momentumScore', order: 'desc' });

    const handleSort = (key) => {
        let order = 'desc';
        if (sortConfig.key === key && sortConfig.order === 'desc') {
            order = 'asc';
        }
        setSortConfig({ key, order });
    };

    const sortedStocks = useMemo(() => {
        if (!stocks) return [];
        const sortableStocks = [...stocks];
        sortableStocks.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.order === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.order === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableStocks;
    }, [stocks, sortConfig]);

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    return (
        <div>
            <PageHeader
                title="Momentum Screener"
                subtitle="Stocks ranked by their expert-calculated momentum score, updated daily."
            />

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <SortableHeader sortKey="ticker" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('ticker')}>Ticker</SortableHeader>
                            <SortableHeader sortKey="currentPrice" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('currentPrice')}>Price</SortableHeader>
                            <SortableHeader sortKey="momentumScore" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('momentumScore')}>Momentum Score</SortableHeader>
                            <SortableHeader sortKey="perf1D" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('perf1D')}>1D %</SortableHeader>
                            <SortableHeader sortKey="perf1W" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('perf1W')}>1W %</SortableHeader>
                            <SortableHeader sortKey="perf1M" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('perf1M')}>1M %</SortableHeader>
                            <SortableHeader sortKey="perf6M" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('perf6M')}>6M %</SortableHeader>
                            <SortableHeader sortKey="perf1Y" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('perf1Y')}>1Y %</SortableHeader>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {sortedStocks.map((stock) => (
                            <tr key={stock.ticker} className="hover:bg-gray-700/50">
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                                    {/* Make the ticker a clickable link */}
                                    <Link to={`/stocks/${stock.ticker}`} className="text-teal-400 hover:underline">
                                        {stock.ticker}
                                    </Link>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">₹{stock.currentPrice?.toFixed(2)}</td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-white">{stock.momentumScore}</td>
                                <td className={`whitespace-nowrap px-4 py-4 text-sm ${stock.perf1D > 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.perf1D}%</td>
                                <td className={`whitespace-nowrap px-4 py-4 text-sm ${stock.perf1W > 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.perf1W}%</td>
                                <td className={`whitespace-nowrap px-4 py-4 text-sm ${stock.perf1M > 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.perf1M}%</td>
                                <td className={`whitespace-nowrap px-4 py-4 text-sm ${stock.perf6M > 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.perf6M}%</td>
                                <td className={`whitespace-nowrap px-4 py-4 text-sm ${stock.perf1Y > 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.perf1Y}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
