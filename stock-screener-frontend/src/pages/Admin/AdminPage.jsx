// File: src/pages/Admin/AdminPage.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { triggerJob, getAllUsers, updateUserAdminStatus, deleteUser, broadcastMessage } from '../../api/adminApi';
import PageHeader from '../../components/shared/PageHeader';
import Loader from '../../components/shared/Loader';
import ErrorMessage from '../../components/shared/ErrorMessage';

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


const UserManagementPanel = ({ token, currentAdminId }) => {
    const queryClient = useQueryClient();
    const { data: users, isLoading, isError, error } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: () => getAllUsers(token),
    });

    const { mutate: updateUser } = useMutation({
        mutationFn: updateUserAdminStatus,
        onSuccess: () => {
            toast.success('User admin status updated!');
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: (error) => toast.error(`Error: ${error.message}`),
    });

    const { mutate: removeUser } = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            toast.success('User deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: (error) => toast.error(`Error: ${error.message}`),
    });

    if (isLoading) return <Loader />;
    if (isError) return <ErrorMessage message={error.message} />;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">User Management</h2>
            <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Telegram</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Admin</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Joined</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{user.email}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    {user.telegramChatId ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-800 text-green-100">Yes</span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-800 text-red-100">No</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    {user.isAdmin ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-800 text-teal-100">Admin</span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-gray-100">User</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                    {user._id !== currentAdminId && (
                                        <>
                                            {user.isAdmin ? (
                                                <button onClick={() => updateUser({ userId: user._id, isAdmin: false, token })} className="px-4 py-1 text-sm font-semibold rounded-full transition-colors bg-yellow-600 hover:bg-yellow-500 text-white">Revoke Admin</button>
                                            ) : (
                                                <button onClick={() => updateUser({ userId: user._id, isAdmin: true, token })} className="px-4 py-1 text-sm font-semibold rounded-full transition-colors bg-green-800 hover:bg-green-600 text-white">Make Admin</button>
                                            )}
                                            <button onClick={() => { if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) removeUser({ userId: user._id, token }) }} className="px-4 py-1 text-sm font-semibold rounded-full transition-colors bg-red-800 hover:bg-red-600 text-white">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BroadcastPanel = ({ token }) => {
    const [message, setMessage] = useState('');
    const { mutate, isPending } = useMutation({
        mutationFn: broadcastMessage,
        onSuccess: (data) => {
            toast.success(data.message);
            setMessage('');
        },
        onError: (error) => toast.error(`Error: ${error.message}`),
    });

    const handleBroadcast = () => {
        if (!message.trim()) {
            toast.error('Message cannot be empty.');
            return;
        }
        mutate({ message, token });
    };

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-teal-400 mb-4">Broadcast Telegram Message</h2>
            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your announcement here. The message will be sent to all users with a linked Telegram account."
                    className="bg-gray-900 text-white w-full rounded-md p-2 border border-gray-700 focus:ring-teal-500 focus:border-teal-500"
                    rows="4"
                />
                <button
                    onClick={handleBroadcast}
                    disabled={isPending}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors w-full disabled:bg-gray-500"
                >
                    {isPending ? 'Sending...' : 'Send Broadcast to All Users'}
                </button>
            </div>
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
          <PageHeader title="Admin Panel" subtitle="Manage users and system jobs." />
          <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                  <AdminButton
                      jobName="intraday-update"
                      jobTitle="Intraday Stock Update"
                      description="Fetches live prices for all stocks."
                      token={userInfo.token}
                  />
                  <AdminButton
                      jobName="daily-analysis"
                      jobTitle="Full Daily Analysis"
                      description="Runs the complete analysis for all Nifty 500 stocks."
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
              <BroadcastPanel token={userInfo.token} />
              <UserManagementPanel token={userInfo.token} currentAdminId={userInfo._id} />
      </div>
    </div>
  );
}
