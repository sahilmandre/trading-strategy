// File: src/pages/Admin/AdminPage.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { triggerJob } from '../../api/adminApi';
import PageHeader from '../../components/shared/PageHeader';

const AdminButton = ({ jobName, jobTitle, description, token }) => {
  const { mutate, isPending } = useMutation({
    mutationFn: () => triggerJob(jobName, token),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
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

export default function AdminPage() {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo?.isAdmin) {
    return (
      <div>
        <PageHeader title="Access Denied" />
        <p className="text-center text-red-400">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Admin Panel" subtitle="Manually trigger scheduled jobs." />
      <div className="space-y-4 max-w-2xl mx-auto">
        <AdminButton
          jobName="intraday-update"
          jobTitle="Intraday Stock Update"
          description="Fetches live prices and recalculates performance metrics for all stocks."
          token={userInfo.token}
        />
        <AdminButton
          jobName="daily-analysis"
          jobTitle="Full Daily Analysis"
          description="Runs the complete, in-depth analysis for all Nifty 500 stocks."
          token={userInfo.token}
        />
        <AdminButton
          jobName="performance-update"
          jobTitle="Portfolio Performance Update"
          description="Updates the performance metrics for all model portfolios."
          token={userInfo.token}
        />
        <AdminButton
          jobName="portfolio-creation"
          jobTitle="Monthly Portfolio Creation"
          description="Generates the new 'Momentum Kings' and 'Alpha Titans' portfolios for the month."
          token={userInfo.token}
        />
      </div>
    </div>
  );
}
