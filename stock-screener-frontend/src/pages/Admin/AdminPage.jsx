// File: src/pages/Admin/AdminPage.jsx

import React from 'react';
import { useSelector } from 'react-redux';
import PageHeader from '../../components/shared/PageHeader';
import SystemMonitoringPanel from './components/SystemMonitoringPanel';
import JobControlPanel from './components/JobControlPanel';
import BroadcastPanel from './components/BroadcastPanel';
import UserManagementPanel from './components/UserManagementPanel';

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
              <SystemMonitoringPanel token={userInfo.token} />
              <JobControlPanel token={userInfo.token} />
              <BroadcastPanel token={userInfo.token} />
              <UserManagementPanel token={userInfo.token} currentAdminId={userInfo._id} />
      </div>
    </div>
  );
}
