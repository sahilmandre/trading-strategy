// File: src/pages/Admin/components/JobControlPanel.jsx

import React from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { triggerJob } from '../../../api/adminApi';

const AdminButton = ({ jobName, jobTitle, description, token }) => {
  const { mutate, isPending } = useMutation({
    mutationFn: () => triggerJob(jobName, token),
    onSuccess: (data) => toast.success(data.message),
    onError: (error) => toast.error(`Error: ${error.message}`),
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
      <div>
        <h3 className="font-bold text-white">{jobTitle}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <button
        onClick={mutate}
        disabled={isPending}
        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500"
      >
        {isPending ? 'Running...' : 'Run Now'}
      </button>
    </div>
  );
};

const JobControlPanel = ({ token }) => {
  return (
    <div className="space-y-4 mt-12">
        <h2 className="text-2xl font-bold text-teal-400 mb-4">Job Triggers</h2>
        <AdminButton
            jobName="intraday-update"
            jobTitle="Intraday Stock Update"
            description="Fetches live prices for all stocks."
            token={token}
        />
        <AdminButton
            jobName="daily-analysis"
            jobTitle="Full Daily Analysis"
            description="Runs the complete analysis for all Nifty 500 stocks."
            token={token}
        />
        <AdminButton
            jobName="performance-update"
            jobTitle="Portfolio Performance Update"
            description="Updates the performance metrics for all model portfolios."
            token={token}
        />
        <AdminButton
            jobName="portfolio-creation"
            jobTitle="Monthly Portfolio Creation"
            description="Generates the new 'Momentum Kings' and 'Alpha Titans' portfolios for the month."
            token={token}
        />
    </div>
  );
};

export default JobControlPanel;
