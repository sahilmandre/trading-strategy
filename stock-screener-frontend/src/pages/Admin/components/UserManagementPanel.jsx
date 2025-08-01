// File: src/pages/Admin/components/UserManagementPanel.jsx

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAllUsers, updateUserAdminStatus, deleteUser } from '../../../api/adminApi';
import Loader from '../../../components/shared/Loader';
import ErrorMessage from '../../../components/shared/ErrorMessage';

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
                                    {user.telegramChatId ? ( <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-800 text-green-100">Yes</span> ) : ( <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-800 text-red-100">No</span> )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    {user.isAdmin ? ( <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-800 text-teal-100">Admin</span> ) : ( <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-600 text-gray-100">User</span> )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                                    {user._id !== currentAdminId && (
                                        <>
                                            {user.isAdmin ? ( <button onClick={() => updateUser({ userId: user._id, isAdmin: false, token })} className="text-yellow-500 hover:text-yellow-400">Revoke Admin</button> ) : ( <button onClick={() => updateUser({ userId: user._id, isAdmin: true, token })} className="text-green-500 hover:text-green-400">Make Admin</button> )}
                                            <button onClick={() => { if(window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) removeUser({ userId: user._id, token })}} className="text-red-500 hover:text-red-400">Delete</button>
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

export default UserManagementPanel;
