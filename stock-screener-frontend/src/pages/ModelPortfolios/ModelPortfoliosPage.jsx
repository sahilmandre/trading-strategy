// File: src/pages/ModelPortfolios/ModelPortfoliosPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useModelPortfolios } from '../../hooks/useModelPortfolios';
import { getBenchmarkData } from '../../api/portfoliosApi';
import { getQuotesForTickers } from '../../api/stocksApi';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
import PageHeader from '../../components/shared/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PortfolioCard = ({ portfolio, onSelect, isSelected, liveReturn }) => {
    if (!portfolio) return null;
    // --- FIX: Use the liveReturn if available, otherwise use the DB value ---
    const displayReturn = typeof liveReturn === 'number' ? liveReturn : portfolio.currentReturnPercent;
    const returnColor = displayReturn >= 0 ? 'text-green-400' : 'text-red-400';
    const selectedClass = isSelected ? 'ring-2 ring-teal-500' : 'ring-1 ring-gray-700';

    return (
        <div onClick={() => onSelect(portfolio)} className={`bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-700/50 transition-all ${selectedClass}`}>
            <h3 className="text-xl font-bold text-teal-400">{portfolio.name}</h3>
            <p className="text-sm text-gray-400 mb-4">Generated: {new Date(portfolio.generationDate).toLocaleDateString()}</p>
            <div className="flex justify-between items-baseline">
                <span className="text-gray-300">Overall Return:</span>
                <span className={`text-2xl font-bold ${returnColor}`}>{displayReturn.toFixed(2)}%</span>
            </div>
        </div>
    );
};

export default function ModelPortfoliosPage() {
    const { data: portfolios, isLoading, isError, error } = useModelPortfolios();
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [selectedBenchmark, setSelectedBenchmark] = useState('^CRSLDX');

    const benchmarkOptions = [
        { label: 'Nifty 500', value: '^CRSLDX' },
        { label: 'Nifty Alpha 50', value: 'NIFTY_ALPHA_50.NS' },
        { label: 'Nifty200 Momentum 30', value: 'NIFTY200_MOMENTUM_30.NS' },
    ];

    useEffect(() => {
        if (portfolios?.momentum && !selectedPortfolio) {
            const activeMomentum = portfolios.momentum.find(p => p.isActive);
            if (activeMomentum) setSelectedPortfolio(activeMomentum);
        }
    }, [portfolios, selectedPortfolio]);

    const selectedPortfolioTickers = useMemo(() => selectedPortfolio?.stocks.map(s => s.ticker) || [], [selectedPortfolio]);

    const { data: livePriceData, isLoading: isLoadingLivePrices } = useQuery({
        queryKey: ['livePrices', selectedPortfolioTickers.join(',')],
        queryFn: () => getQuotesForTickers(selectedPortfolioTickers),
        enabled: selectedPortfolioTickers.length > 0,
        refetchInterval: 60000,
    });

    const currentPrices = useMemo(() => {
        if (!livePriceData) return {};
        return livePriceData.reduce((acc, quote) => {
            acc[quote.symbol] = quote.regularMarketPrice;
            return acc;
        }, {});
    }, [livePriceData]);

    // --- FIX: Calculate the live portfolio return on the frontend ---
    const livePortfolioReturn = useMemo(() => {
        if (!selectedPortfolio || Object.keys(currentPrices).length === 0) {
            return selectedPortfolio?.currentReturnPercent || 0;
        }
        const individualReturns = selectedPortfolio.stocks.map(stock => {
            const currentPrice = currentPrices[stock.ticker];
            const entryPrice = stock.priceAtAddition;
            return currentPrice && entryPrice ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
        });
        // Average the returns of all stocks in the portfolio
        return individualReturns.reduce((sum, ret) => sum + ret, 0) / individualReturns.length;
    }, [selectedPortfolio, currentPrices]);


    const { data: benchmarkData, isLoading: isLoadingBenchmark } = useQuery({
        queryKey: ['benchmarkData', selectedBenchmark],
        queryFn: () => getBenchmarkData(selectedBenchmark),
        enabled: !!selectedBenchmark && !!selectedPortfolio,
    });

    const chartData = useMemo(() => {
        const displayReturn = livePortfolioReturn; // Use the live calculated return for the chart
        if (!selectedPortfolio) return [];
        if (!benchmarkData || benchmarkData.length === 0) {
            return [{ date: new Date(selectedPortfolio.generationDate).toLocaleDateString(), portfolioReturn: 0 }, { date: new Date().toLocaleDateString(), portfolioReturn: displayReturn }];
        }
        const firstBenchmarkValue = benchmarkData[0]?.close;
        if (!firstBenchmarkValue) return [];
        const normalizedBenchmark = benchmarkData.map(day => ({ date: new Date(day.date).toLocaleDateString(), benchmarkReturn: ((day.close - firstBenchmarkValue) / firstBenchmarkValue) * 100 }));
        return normalizedBenchmark.map(day => ({ ...day, portfolioReturn: displayReturn }));
    }, [selectedPortfolio, benchmarkData, livePortfolioReturn]);

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    const activeMomentum = portfolios?.momentum?.find(p => p.isActive);
    const activeAlpha = portfolios?.alpha?.find(p => p.isActive);
    const historicalMomentum = portfolios?.momentum?.filter(p => !p.isActive) || [];
    const historicalAlpha = portfolios?.alpha?.filter(p => !p.isActive) || [];

    return (
        <div>
            <PageHeader title="Expert Model Portfolios" subtitle="Track the historical performance of our proprietary Momentum and Alpha strategies." />
            <h2 className="text-2xl font-bold text-white mb-4">This Month's Active Portfolios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <PortfolioCard portfolio={activeMomentum} onSelect={setSelectedPortfolio} isSelected={selectedPortfolio?._id === activeMomentum?._id} liveReturn={selectedPortfolio?._id === activeMomentum?._id ? livePortfolioReturn : undefined} />
                <PortfolioCard portfolio={activeAlpha} onSelect={setSelectedPortfolio} isSelected={selectedPortfolio?._id === activeAlpha?._id} liveReturn={selectedPortfolio?._id === activeAlpha?._id ? livePortfolioReturn : undefined} />
            </div>

            {selectedPortfolio && (
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-12">
                    <h2 className="text-3xl font-bold text-teal-400 mb-4">{selectedPortfolio.name} - Performance Details</h2>
                    <div className="mb-4">
                        <label htmlFor="benchmark" className="block text-sm font-medium text-gray-300">Compare Against:</label>
                        <select id="benchmark" value={selectedBenchmark} onChange={(e) => setSelectedBenchmark(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-700 border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md text-white">
                            {benchmarkOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    <div className="h-96 w-full mb-6">
                        {isLoadingBenchmark ? <Loader /> : (
                            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#4A5568" /><XAxis dataKey="date" stroke="#A0AEC0" /><YAxis stroke="#A0AEC0" unit="%" /><Tooltip contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }} /><Legend /><Line type="monotone" dataKey="portfolioReturn" name="Portfolio Return" stroke="#38B2AC" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="benchmarkReturn" name="Benchmark Return" stroke="#A0AEC0" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Holdings</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Ticker</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Price at Addition</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Current Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Current Return (%)</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {selectedPortfolio.stocks?.map(stock => {
                                    const currentPrice = currentPrices[stock.ticker];
                                    const entryPrice = stock.priceAtAddition;
                                    const returnPercent = currentPrice && entryPrice ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
                                    const returnColor = returnPercent >= 0 ? 'text-green-400' : 'text-red-400';
                                    return (
                                        <tr key={stock.ticker}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{stock.ticker}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">₹{entryPrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{isLoadingLivePrices ? 'Loading...' : (currentPrice ? `₹${currentPrice.toFixed(2)}` : 'N/A')}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold ${returnColor}`}>{returnPercent.toFixed(2)}%</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-teal-400">{stock.momentumScore || stock.alpha}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <h2 className="text-2xl font-bold text-white mb-4">Performance History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Momentum Kings History</h3>
                    <div className="space-y-4">{historicalMomentum.map(p => <PortfolioCard key={p._id} portfolio={p} onSelect={setSelectedPortfolio} isSelected={selectedPortfolio?._id === p._id} liveReturn={selectedPortfolio?._id === p._id ? livePortfolioReturn : undefined} />)}</div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Alpha Titans History</h3>
                    <div className="space-y-4">{historicalAlpha.map(p => <PortfolioCard key={p._id} portfolio={p} onSelect={setSelectedPortfolio} isSelected={selectedPortfolio?._id === p._id} liveReturn={selectedPortfolio?._id === p._id ? livePortfolioReturn : undefined} />)}</div>
                </div>
            </div>
        </div>
    );
}
