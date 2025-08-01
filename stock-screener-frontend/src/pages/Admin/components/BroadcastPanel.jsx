// File: src/pages/Admin/components/BroadcastPanel.jsx

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { broadcastMessage } from '../../../api/adminApi';

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

export default BroadcastPanel;
