// File: src/pages/Settings/SettingsPage.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { generateTelegramToken, disconnectTelegram } from '../../api/userApi';
import { fetchUserProfileThunk, updateUserInfo } from '../../redux/authSlice';
import PageHeader from '../../components/shared/PageHeader';

export default function SettingsPage() {
  const [linkToken, setLinkToken] = useState(null);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
  const { userInfo } = useSelector((state) => state.auth);

    // Fetch the latest user profile on component mount
    useEffect(() => {
        dispatch(fetchUserProfileThunk());
    }, [dispatch]);

    const { mutate: generateToken, isPending: isGenerating } = useMutation({
    mutationFn: () => generateTelegramToken(userInfo.token),
    onSuccess: (data) => {
      setLinkToken(data.token);
      toast.success('Your unique link token has been generated!');
    },
      onError: (error) => toast.error(`Error: ${error.message}`),
  });

    const { mutate: disconnect, isPending: isDisconnecting } = useMutation({
        mutationFn: () => disconnectTelegram(userInfo.token),
        onSuccess: () => {
            toast.success('Telegram account disconnected successfully!');
            // Update the user info in Redux state to reflect the change
            const updatedUserInfo = { ...userInfo, telegramChatId: null };
            dispatch(updateUserInfo(updatedUserInfo));
            queryClient.invalidateQueries(['userProfile']); // Invalidate queries if you use react-query for profile
    },
      onError: (error) => toast.error(`Error: ${error.message}`),
  });

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and integrations." />

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-teal-400 mb-4">Telegram Integration</h2>

              {userInfo?.telegramChatId ? (
                  <div>
                      <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-md relative text-center mb-4">
                          <strong className="font-bold">Connected!</strong>
                          <span className="block sm:inline ml-2">Your account is linked to Telegram Chat ID: {userInfo.telegramChatId}</span>
                      </div>
                      <p className="text-gray-300 mb-4">You can now receive price alerts and manage your portfolio from Telegram.</p>
                      <button
                          onClick={disconnect}
                          disabled={isDisconnecting}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-md transition-colors w-full disabled:bg-gray-500"
                      >
                          {isDisconnecting ? 'Disconnecting...' : 'Disconnect Telegram Account'}
                      </button>
                  </div>
              ) : (
                      <div className="space-y-4">
                          <p className="text-gray-300">Link your Telegram account to receive real-time price alerts.</p>
                          <div>
                              <h3 className="text-lg font-semibold text-white">Step 1: Start a chat with our bot</h3>
                              <p className="text-gray-400">Open Telegram and search for the bot <a href="https://t.me/YourBotUsername" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">@YourBotUsername</a>, then send the command <code className="bg-gray-700 p-1 rounded">/start</code>.</p>
                          </div>
                          <div>
                              <h3 className="text-lg font-semibold text-white">Step 2: Link your account</h3>
                              <p className="text-gray-400 mb-2">Click the button below to generate a temporary token. Then, send this token to the bot in Telegram using the format: <code className="bg-gray-700 p-1 rounded">/link YOUR_TOKEN</code></p>
                              <button
                                  onClick={generateToken}
                                  disabled={isGenerating}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500"
                              >
                                  {isGenerating ? 'Generating...' : 'Generate Link Token'}
                              </button>
                          </div>
                          {linkToken && (
                              <div className="bg-gray-900 p-4 rounded-md">
                                  <p className="text-gray-300">Your token is:</p>
                                  <div className="flex items-center justify-between mt-2">
                                      <code className="text-2xl font-mono text-teal-400 bg-gray-700 p-2 rounded">{linkToken}</code>
                                      <button
                                          onClick={() => {
                                              navigator.clipboard.writeText(`/link ${linkToken}`);
                                              toast.success('Command copied to clipboard!');
                                          }}
                                          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-md"
                                      >
                                          Copy Command
                                      </button>
                                  </div>
                              </div>
                          )}
                      </div>
              )}
      </div>
    </div>
  );
}
