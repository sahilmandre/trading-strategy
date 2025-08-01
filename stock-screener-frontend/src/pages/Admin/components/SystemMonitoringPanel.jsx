// File: src/pages/Admin/components/SystemMonitoringPanel.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobStatuses } from '../../../api/adminApi';
import Loader from '../../../components/shared/Loader';
import ErrorMessage from '../../../components/shared/ErrorMessage';

const SystemMonitoringPanel = ({ token }) => {
    const { data: statuses, isLoading, isError, error } = useQuery({
        queryKey: ['jobStatuses'],
        queryFn: () => getJobStatuses(token),
        refetchInterval: 10000, // Refetch every 10 seconds for live updates
    });

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    const getStatusColor = (status) => {
        switch (status) {
            case 'OK': return 'bg-green-800 text-green-100';
            case 'Running': return 'bg-blue-800 text-blue-100';
            case 'Failed': return 'bg-red-800 text-red-100';
            default: return 'bg-gray-600 text-gray-100';
        }
    };

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">System Job Monitoring</h2>
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Job Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Last Run</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Error Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {Object.entries(statuses).map(([jobName, details]) => (
                            <tr key={jobName}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{jobName}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(details.status)}`}>
                                        {details.status}
                                    </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {details.lastRun ? new Date(details.lastRun).toLocaleString() : 'Never'}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-red-400">{details.error || 'None'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SystemMonitoringPanel;
