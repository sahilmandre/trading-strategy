// File: src/pages/ModelPortfolios/ModelPortfoliosPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useModelPortfolios } from '../../hooks/useModelPortfolios';
import { getBenchmarkData } from '../../api/portfoliosApi';
import { getQuotesForTickers } from '../../api/stocksApi';
import { getBacktestData } from '../../api/backtestApi';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
import PageHeader from '../../components/shared/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PortfolioCard = ({ portfolio, onSelect, isSelected, liveReturn }) => {
    if (!portfolio) return null;
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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const portfolioData = payload.find(p => p.dataKey === 'portfolioReturn');
        const benchmarkData = payload.find(p => p.dataKey === 'benchmarkReturn');
        return (
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-sm">
                <p className="label text-gray-300 font-bold">{`${label}`}</p>
                {portfolioData && typeof portfolioData.value === 'number' && (<p style={{ color: portfolioData.color }}>{`${portfolioData.name} : ${portfolioData.value.toFixed(2)}%`}</p>)}
                {benchmarkData && typeof benchmarkData.value === 'number' && (<p style={{ color: benchmarkData.color }}>{`${benchmarkData.name} : ${benchmarkData.value.toFixed(2)}%`}</p>)}
            </div>
        );
    }
    return null;
};

export default function ModelPortfoliosPage() {
    const { data: portfolios, isLoading, isError, error } = useModelPortfolios();
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [selectedBenchmark, setSelectedBenchmark] = useState('^NSEI'); // Default to Nifty 50
    const [backtestPeriod, setBacktestPeriod] = useState('');
    const [activeBacktest, setActiveBacktest] = useState(null);

    // --- DEFINITIVE FIX: Using the correct and expanded list of Yahoo Finance tickers ---
    const benchmarkOptions = [
        { label: 'Nifty 50', value: '^NSEI' },
        { label: 'Nifty 500', value: '^CRSLDX' },
        { label: 'Nifty Alpha 50', value: 'NIFTYALPHA50.NS' },
        { label: 'Nifty200 Momentum 30', value: 'NIFTY200_MOMENTUM_30.NS' },
        { label: 'Nifty200 Alpha 30', value: 'NIFTY200_ALPHA_30.NS' }
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
        return livePriceData.reduce((acc, quote) => { acc[quote.symbol] = quote.regularMarketPrice; return acc; }, {});
    }, [livePriceData]);

    const livePortfolioReturn = useMemo(() => {
        if (!selectedPortfolio || Object.keys(currentPrices).length === 0) return selectedPortfolio?.currentReturnPercent || 0;
        const individualReturns = selectedPortfolio.stocks.map(stock => {
            const currentPrice = currentPrices[stock.ticker];
            const entryPrice = stock.priceAtAddition;
            return currentPrice && entryPrice ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0;
        });
        return individualReturns.reduce((sum, ret) => sum + ret, 0) / individualReturns.length;
    }, [selectedPortfolio, currentPrices]);

    const { data: benchmarkData, isLoading: isLoadingBenchmark } = useQuery({
        queryKey: ['benchmarkData', selectedBenchmark],
        queryFn: () => getBenchmarkData(selectedBenchmark),
        enabled: !!selectedBenchmark && !!selectedPortfolio,
    });

    const { data: backtestData, isLoading: isLoadingBacktest, refetch: runBacktest } = useQuery({
        queryKey: ['backtestData', activeBacktest?.tickers, activeBacktest?.period],
        queryFn: () => getBacktestData(activeBacktest.tickers, activeBacktest.period),
        enabled: false,
    });

    const handleRunBacktest = () => {
        if (backtestPeriod && selectedPortfolioTickers.length > 0) {
            setActiveBacktest({ tickers: selectedPortfolioTickers, period: backtestPeriod });
            setTimeout(() => runBacktest(), 100);
        }
    };

    const chartData = useMemo(() => {
        let portfolioHistory;
        if (activeBacktest && backtestData) {
            portfolioHistory = backtestData.map(entry => ({ date: new Date(entry.date).toLocaleDateString('en-GB'), portfolioReturn: parseFloat(entry.portfolioReturn.toFixed(2)) }));
        } else if (selectedPortfolio?.performanceHistory) {
            portfolioHistory = selectedPortfolio.performanceHistory.map(entry => ({ date: new Date(entry.date).toLocaleDateString('en-GB'), portfolioReturn: parseFloat(entry.portfolioReturn.toFixed(2)) }));
        } else {
            return [];
        }

        if (!benchmarkData || benchmarkData.length === 0) return portfolioHistory;

        const firstBenchmarkValue = benchmarkData[0]?.close;
        if (!firstBenchmarkValue) return portfolioHistory;

        const benchmarkHistoryMap = new Map(benchmarkData.map(day => [new Date(day.date).toLocaleDateString('en-GB'), parseFloat((((day.close - firstBenchmarkValue) / firstBenchmarkValue) * 100).toFixed(2))]));

        return portfolioHistory.map(pDay => ({ ...pDay, benchmarkReturn: benchmarkHistoryMap.get(pDay.date) ?? null }));
    }, [selectedPortfolio, backtestData, activeBacktest, benchmarkData]);

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    const activeMomentum = portfolios?.momentum?.find(p => p.isActive);
    const activeAlpha = portfolios?.alpha?.find(p => p.isActive);
    const historicalMomentum = portfolios?.momentum?.filter(p => !p.isActive) || [];
    const historicalAlpha = portfolios?.alpha?.filter(p => !p.isActive) || [];

    return (
        <div>
            <PageHeader title="Expert Model Portfolios" subtitle="Track historical performance and run backtests on our proprietary strategies." />
            <h2 className="text-2xl font-bold text-white mb-4">This Month's Active Portfolios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <PortfolioCard portfolio={activeMomentum} onSelect={setSelectedPortfolio} isSelected={selectedPortfolio?._id === activeMomentum?._id} liveReturn={selectedPortfolio?._id === activeMomentum?._id ? livePortfolioReturn : undefined} />
                <PortfolioCard portfolio={activeAlpha} onSelect={setSelectedPortfolio} isSelected={selectedPortfolio?._id === activeAlpha?._id} liveReturn={selectedPortfolio?._id === activeAlpha?._id ? livePortfolioReturn : undefined} />
            </div>

            {selectedPortfolio && (
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-12">
                    <h2 className="text-3xl font-bold text-teal-400 mb-4">{selectedPortfolio.name} - Performance Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-700/50 p-4 rounded-md flex flex-wrap items-end gap-4">
                            <div>
                                <label htmlFor="backtestPeriod" className="block text-sm font-medium text-gray-300">Backtest This Portfolio</label>
                                <select id="backtestPeriod" value={backtestPeriod} onChange={(e) => setBacktestPeriod(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-600 rounded-md text-white">
                                    <option value="">Select Period</option><option value="3m">Last 3 Months</option><option value="6m">Last 6 Months</option><option value="1y">Last 1 Year</option>
                                </select>
                            </div>
                            <button onClick={handleRunBacktest} disabled={!backtestPeriod || isLoadingBacktest} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500">{isLoadingBacktest ? 'Running...' : 'Run Backtest'}</button>
                            {activeBacktest && (<button onClick={() => setActiveBacktest(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors">View Actual Performance</button>)}
                        </div>
                        <div className="bg-gray-700/50 p-4 rounded-md">
                            <label htmlFor="benchmark" className="block text-sm font-medium text-gray-300">Compare Against</label>
                            <select
                                id="benchmark"
                                value={selectedBenchmark}
                                onChange={(e) => setSelectedBenchmark(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-gray-800 border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md text-white"
                            >
                                {benchmarkOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="h-96 w-full mb-6">
                        {(isLoadingBenchmark || isLoadingBacktest) ? <Loader /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="date" stroke="#A0AEC0" />
                                    <YAxis stroke="#A0AEC0" unit="%" domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="portfolioReturn" name={activeBacktest ? `Backtested Return (${backtestPeriod})` : 'Portfolio Return'} stroke="#38B2AC" strokeWidth={2} dot={false} connectNulls />
                                    <Line type="monotone" dataKey="benchmarkReturn" name={`${benchmarkOptions.find(b => b.value === selectedBenchmark)?.label || 'Benchmark'} Return`} stroke="#A0AEC0" strokeWidth={2} dot={false} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
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
                    <div className="space-y-4">
                        {historicalAlpha.map(p => <PortfolioCard key={p._id} portfolio={p} onSelect={setSelectedPortfolio} isSelected={selectedPortfolio?._id === p._id} liveReturn={selectedPortfolio?._id === p._id ? livePortfolioReturn : undefined} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
