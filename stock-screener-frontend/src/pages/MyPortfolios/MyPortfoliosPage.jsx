// File: src/pages/MyPortfolios/MyPortfoliosPage.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyPortfolios, createMyPortfolio } from '../../api/customPortfolioApi';
import PageHeader from '../../components/shared/PageHeader';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';
import toast from 'react-hot-toast';

const PortfolioCard = ({ portfolio }) => (
    <Link to={`/my-portfolios/${portfolio._id}`} className="block bg-gray-800 hover:bg-gray-700 p-6 rounded-lg shadow-lg transition-all">
        <h3 className="text-xl font-bold text-teal-400">{portfolio.portfolioName}</h3>
        <p className="text-sm text-gray-400 mt-1">Created: {new Date(portfolio.createdAt).toLocaleDateString()}</p>
        <div className="mt-4 flex justify-between items-baseline">
            <span className="text-gray-300">Current Value:</span>
            <span className="text-2xl font-bold text-white">₹{portfolio.currentValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-baseline">
            <span className="text-gray-300">Day's Gain:</span>
            <span className={`text-lg font-bold ${portfolio.dayReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolio.dayReturn >= 0 ? '+' : ''}₹{portfolio.dayReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({portfolio.dayReturnPercent.toFixed(2)}%)
            </span>
        </div>
    </Link>
);


export default function MyPortfoliosPage() {
    const [newPortfolioName, setNewPortfolioName] = useState('');
    const { userInfo } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const { data: portfolios, isLoading, isError, error } = useQuery({
        queryKey: ['myPortfolios'],
        queryFn: () => getMyPortfolios(userInfo.token),
        enabled: !!userInfo,
    });

    const { mutate: create, isPending: isCreating } = useMutation({
        mutationFn: createMyPortfolio,
        onSuccess: () => {
            toast.success('New portfolio created!');
            setNewPortfolioName('');
            queryClient.invalidateQueries({ queryKey: ['myPortfolios'] });
        },
        onError: (err) => toast.error(`Error: ${err.message}`),
    });

    const handleCreatePortfolio = (e) => {
        e.preventDefault();
        if (!newPortfolioName.trim()) {
            toast.error('Portfolio name cannot be empty.');
            return;
        }
        create({ portfolioName: newPortfolioName, token: userInfo.token });
    };

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    const activePortfolios = portfolios?.filter(p => p.isActive) || [];
    const historicalPortfolios = portfolios?.filter(p => !p.isActive) || [];

    return (
        <div>
            <PageHeader title="My Custom Portfolios" subtitle="Create and track your personal stock portfolios." />

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl font-bold text-white mb-4">Create a New Portfolio</h2>
                <form onSubmit={handleCreatePortfolio} className="flex items-center gap-4">
                    <input
                        type="text"
                        value={newPortfolioName}
                        onChange={(e) => setNewPortfolioName(e.target.value)}
                        placeholder="e.g., Long-Term Growth"
                        className="bg-gray-900 text-white w-full rounded-md p-3 border border-gray-700 focus:ring-teal-500"
                    />
                    <button type="submit" disabled={isCreating} className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-md transition-colors disabled:bg-gray-500">
                        {isCreating ? 'Creating...' : 'Create'}
                    </button>
                </form>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">Active Portfolios</h2>
            {activePortfolios.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activePortfolios.map(p => <PortfolioCard key={p._id} portfolio={p} />)}
                </div>
            ) : (
                <p className="text-gray-400">You have no active portfolios. Create one above to get started!</p>
            )}

            {historicalPortfolios.length > 0 && (
                <>
                    <h2 className="text-2xl font-bold text-white mt-12 mb-4">Historical Portfolios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {historicalPortfolios.map(p => <PortfolioCard key={p._id} portfolio={p} />)}
                    </div>
                </>
            )}
        </div>
    );
}
