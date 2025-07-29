// File: src/pages/Alpha/AlphaPage.jsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; // <-- Import Link
import { useAlphaStocks } from '../../hooks/useAlphaStocks';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
import PageHeader from '../../components/shared/PageHeader';

const SortableHeader = ({ children, onClick, sortKey, currentSortKey, sortOrder }) => {
    return (
        <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-white cursor-pointer" onClick={onClick}>
            <div className="flex items-center gap-x-2">
                <span>{children}</span>
                {sortKey === currentSortKey && (
                    <span className="text-teal-400">
                        {sortOrder === 'asc' ? '▲' : '▼'}
                    </span>
                )}
            </div>
        </th>
    );
};


export default function AlphaPage() {
    const { data: stocks, isLoading, isError, error } = useAlphaStocks();
    const [sortConfig, setSortConfig] = useState({ key: 'alpha', order: 'desc' });

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
                title="Alpha Screener"
                subtitle="Stocks that are outperforming the Nifty 500 index, updated daily."
            />

            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <SortableHeader sortKey="ticker" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('ticker')}>Ticker</SortableHeader>
                            <SortableHeader sortKey="currentPrice" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('currentPrice')}>Price</SortableHeader>
                            <SortableHeader sortKey="alpha" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('alpha')}>Alpha</SortableHeader>
                            <SortableHeader sortKey="perf1Y" currentSortKey={sortConfig.key} sortOrder={sortConfig.order} onClick={() => handleSort('perf1Y')}>Stock 1Y %</SortableHeader>
                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-white">Market 1Y %</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {sortedStocks.map((stock) => {
                            const marketReturn = stock.perf1Y - stock.alpha;
                            return (
                                <tr key={stock.ticker} className="hover:bg-gray-700/50">
                                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium">
                                        {/* Make the ticker a clickable link */}
                                        <Link to={`/stocks/${stock.ticker}`} className="text-teal-400 hover:underline">
                                            {stock.ticker}
                                        </Link>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-300">₹{stock.currentPrice?.toFixed(2)}</td>
                                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-green-400">{stock.alpha}%</td>
                                    <td className={`whitespace-nowrap px-4 py-4 text-sm ${stock.perf1Y > 0 ? 'text-green-400' : 'text-red-400'}`}>{stock.perf1Y}%</td>
                                    <td className={`whitespace-nowrap px-4 py-4 text-sm ${marketReturn > 0 ? 'text-gray-300' : 'text-red-500'}`}>{marketReturn.toFixed(2)}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
