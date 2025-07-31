// File: src/pages/Settings/SettingsPage.jsx

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { generateTelegramToken } from '../../api/userApi';
import PageHeader from '../../components/shared/PageHeader';

export default function SettingsPage() {
  const [linkToken, setLinkToken] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  const { mutate: generateToken, isPending } = useMutation({
    mutationFn: () => generateTelegramToken(userInfo.token),
    onSuccess: (data) => {
      setLinkToken(data.token);
      toast.success('Your unique link token has been generated!');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleGenerateToken = () => {
    generateToken();
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and integrations." />

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-teal-400 mb-4">Telegram Integration</h2>
        <p className="text-gray-300 mb-4">
          Link your Telegram account to receive real-time price alerts and manage your portfolio directly from the app.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Step 1: Start a chat with our bot</h3>
            <p className="text-gray-400">Open Telegram and search for the bot <a href="https://t.me/YourBotUsername" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">@StockScreenerAlertsBot</a>, then send the command <code className="bg-gray-700 p-1 rounded">/start</code>. The bot will reply with your Chat ID.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Step 2: Link your account</h3>
            <p className="text-gray-400 mb-2">Click the button below to generate a temporary, single-use token. Then, send this token to the bot in Telegram using the format: <code className="bg-gray-700 p-1 rounded">/link YOUR_TOKEN</code></p>
            <button
              onClick={handleGenerateToken}
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isPending ? 'Generating...' : 'Generate Link Token'}
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
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-md transition-colors"
                >
                  Copy Command
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">This token is valid for one-time use and will expire.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
