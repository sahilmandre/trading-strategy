// File: src/pages/MyPortfolios/PortfolioDetailPage.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { getPortfolioDetails } from '../../api/customPortfolioApi';
import PageHeader from '../../components/shared/PageHeader';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
// Note: Chart, AddTradeForm, and HoldingsTable will be created in the next step.
// For now, we are building the main structure.

export default function PortfolioDetailPage() {
    const { id: portfolioId } = useParams();
    const { userInfo } = useSelector((state) => state.auth);

    const { data: portfolio, isLoading, isError, error } = useQuery({
        queryKey: ['portfolioDetails', portfolioId],
        queryFn: () => getPortfolioDetails({ portfolioId, token: userInfo.token }),
        enabled: !!userInfo && !!portfolioId,
    });

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    const openTrades = portfolio?.trades?.filter(t => t.status === 'open') || [];
    const closedTrades = portfolio?.trades?.filter(t => t.status === 'closed' && t.tradeType === 'sell') || [];

    return (
        <div>
            <PageHeader title={portfolio?.portfolioName || 'Portfolio'} subtitle="Track your holdings and performance." />

            {/* Performance Summary Section (Placeholder) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Current Value</div>
                    <div className="text-2xl font-bold text-white">₹{portfolio?.currentValue.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Total Invested</div>
                    <div className="text-2xl font-bold text-white">₹{portfolio?.totalInvested.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Overall P&L</div>
                    <div className={`text-2xl font-bold ${portfolio?.overallReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {portfolio?.overallReturn >= 0 ? '+' : ''}₹{portfolio?.overallReturn.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-sm text-gray-400">Day's P&L</div>
                    <div className={`text-2xl font-bold ${portfolio?.dayReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {portfolio?.dayReturn >= 0 ? '+' : ''}₹{portfolio?.dayReturn.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                </div>
            </div>

            {/* Chart, Add Trade Form, and Tables will go here in the next steps */}
            <div className="text-center p-8 bg-gray-800 rounded-lg">
                <h3 className="text-xl text-gray-400">More components coming soon!</h3>
                <p className="text-gray-500">The performance chart, add trade form, and holdings tables will be built next.</p>
            </div>
        </div>
    );
}
