
'use client';

import { useState } from 'react';
// Remix Icon 사용 (lucide-react 대신)
import { useTranslation } from '../../../lib/hooks/useTranslation';
import { useAuthStore } from '../../../lib/stores/auth';

export default function DangerZone() {
  const { t } = useTranslation(['me', 'common']);
  const { logout } = useAuthStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setIsDeleting(true);
    // Simulate account deletion
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In real app, this would call the delete API
    await logout();
  };

  const handleLogoutAllDevices = async () => {
          if (confirm(t('danger.confirmLogoutAll'))) {
      // Simulate logout all devices
      await new Promise(resolve => setTimeout(resolve, 1000));
      await logout();
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <i className="ri-error-warning-line w-6 h-6 text-red-600 mr-2 text-xl"></i>
          <h2 
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('danger.title')}
          </h2>
        </div>
        <p 
          style={{ color: 'var(--text-secondary)' }}
        >
                      {t('danger.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Data Export */}
        <div 
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--border-primary)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-2 flex items-center"
            style={{ color: 'var(--text-primary)' }}
          >
            <i className="ri-shield-check-line w-5 h-5 mr-2 text-blue-600 text-lg"></i>
                            {t('danger.dataExport')}
          </h3>
          <p 
            className="mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
                          {t('danger.dataExportDesc')}
          </p>
          <button 
            className="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--text-on-accent)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
            }}
          >
                          {t('danger.downloadData')}
          </button>
        </div>

        {/* Logout All Devices */}
        <div 
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--accent-warning)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-2 flex items-center"
            style={{ color: 'var(--text-primary)' }}
          >
            <i className="ri-logout-box-r-line w-5 h-5 mr-2 text-orange-600 text-lg"></i>
                            {t('danger.logoutAllDevices')}
          </h3>
          <p 
            className="mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
                          {t('danger.logoutAllDevicesDesc')}
          </p>
          <button 
            onClick={handleLogoutAllDevices}
            className="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            style={{
              backgroundColor: 'var(--accent-warning)',
              color: 'var(--text-on-accent)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-warning-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-warning)';
            }}
          >
                          {t('danger.logoutAll')}
          </button>
        </div>

        {/* Delete Account */}
        <div 
          className="rounded-xl border-2 p-6"
          style={{
            backgroundColor: 'var(--surface-primary)',
            borderColor: 'var(--accent-danger)'
          }}
        >
          <h3 
            className="text-lg font-semibold mb-2 flex items-center"
            style={{ color: 'var(--accent-danger)' }}
          >
            <i className="ri-delete-bin-line w-5 h-5 mr-2 text-lg"></i>
            {t('danger.deleteAccount')}
          </h3>
          <p 
            className="mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('danger.deleteAccountDesc')}
          </p>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
              style={{
                backgroundColor: 'var(--accent-danger)',
                color: 'var(--text-on-accent)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-danger-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-danger)';
              }}
            >
              {t('danger.deleteAccount')}
            </button>
          ) : (
            <div 
              className="border rounded-lg p-4"
              style={{
                borderColor: 'var(--accent-danger)',
                backgroundColor: 'var(--accent-danger-bg)'
              }}
            >
              <div className="mb-4">
                <p 
                  className="text-sm mb-2"
                  style={{ color: 'var(--accent-danger)' }}
                >
                  {t('danger.deleteWarning')}
                </p>
                <p 
                  className="text-sm mb-3"
                  style={{ color: 'var(--accent-danger)' }}
                >
                  {t('danger.typeDelete')}
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: 'var(--accent-danger)',
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 border rounded-lg whitespace-nowrap"
                  style={{
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  style={{
                    backgroundColor: 'var(--accent-danger)',
                    color: 'var(--text-on-accent)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting && deleteConfirmText === 'DELETE') {
                      e.currentTarget.style.backgroundColor = 'var(--accent-danger-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting && deleteConfirmText === 'DELETE') {
                      e.currentTarget.style.backgroundColor = 'var(--accent-danger)';
                    }
                  }}
                >
                  {isDeleting ? t('danger.deleting') : t('danger.confirmDelete')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
