// File: src/pages/ModelPortfolios/ModelPortfoliosPage.jsx

import React from 'react';
import { useModelPortfolios } from '../../hooks/useModelPortfolios';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
import PageHeader from '../../components/shared/PageHeader';

// A reusable component to display a single portfolio
const PortfolioCard = ({ portfolio, strategyType }) => {
    if (!portfolio) {
        return (
            <div className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{strategyType} Portfolio</h2>
                <p className="text-gray-400">This portfolio has not been generated for the current month yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-teal-400 mb-1">{portfolio.name}</h2>
                <p className="text-sm text-gray-400 mb-4">
                    Generated on: {new Date(portfolio.generationDate).toLocaleDateString()}
                </p>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Ticker</th>
                                <th className="py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {portfolio.stocks.map((stock) => (
                                <tr key={stock.ticker}>
                                    <td className="py-3 whitespace-nowrap text-sm font-medium text-white">{stock.ticker}</td>
                                    <td className={`py-3 whitespace-nowrap text-sm font-bold ${strategyType === 'Momentum' ? 'text-blue-400' : 'text-green-400'}`}>
                                        {strategyType === 'Momentum' ? stock.momentumScore : stock.alpha}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


export default function ModelPortfoliosPage() {
    const { data: portfolios, isLoading, isError, error } = useModelPortfolios();

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    return (
        <div>
            <PageHeader
                title="Expert Model Portfolios"
                subtitle="Top 10 stocks selected monthly based on our proprietary Momentum and Alpha strategies."
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PortfolioCard portfolio={portfolios?.momentum} strategyType="Momentum" />
                <PortfolioCard portfolio={portfolios?.alpha} strategyType="Alpha" />
            </div>
        </div>
    );
}
