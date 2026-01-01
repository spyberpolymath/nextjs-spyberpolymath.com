'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface EmailPreferences {
  twoFANotifications: {
    enabled: boolean;
    frequency: string;
  };
  accountChanges: {
    enabled: boolean;
    frequency: string;
  };
  loginNotifications: {
    enabled: boolean;
    frequency: string;
  };
  newsletter: {
    enabled: boolean;
    frequency: string;
  };
}

interface UnsubscribeResponse {
  emailPreferences: EmailPreferences;
  message?: string;
  error?: string;
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'all';

  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      setError('Email parameter is required');
      setLoading(false);
      return;
    }

    fetchPreferences();
  }, [email]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: UnsubscribeResponse = await response.json();

      if (response.ok) {
        setPreferences(data.emailPreferences);
      } else {
        setError(data.error || 'Failed to fetch preferences');
      }
    } catch (err) {
      setError('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (preferenceType: keyof EmailPreferences, enabled: boolean) => {
    if (!email || !preferences) return;

    setUpdating(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferenceType,
          enabled,
          frequency: preferences[preferenceType].frequency
        }),
      });

      const data: UnsubscribeResponse = await response.json();

      if (response.ok) {
        setPreferences(data.emailPreferences);
        setMessage('Preference updated successfully');
      } else {
        setError(data.error || 'Failed to update preference');
      }
    } catch (err) {
      setError('Failed to update preference');
    } finally {
      setUpdating(false);
    }
  };

  const unsubscribeAll = async () => {
    if (!email) return;

    setUpdating(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data: UnsubscribeResponse = await response.json();

      if (response.ok) {
        setPreferences(data.emailPreferences);
        setMessage('Successfully unsubscribed from all emails');
      } else {
        setError(data.error || 'Failed to unsubscribe');
      }
    } catch (err) {
      setError('Failed to unsubscribe');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your email preferences...</p>
        </div>
      </div>
    );
  }

  if (error && !preferences) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Preferences</h1>
            <p className="text-gray-600">Manage your email notifications for {email}</p>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {preferences && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notification Preferences</h2>

                {/* 2FA Notifications */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-gray-900">2FA Security Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications about two-factor authentication activities</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.twoFANotifications.enabled}
                      onChange={(e) => updatePreference('twoFANotifications', e.target.checked)}
                      disabled={updating}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Account Changes */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Account Changes</h3>
                    <p className="text-sm text-gray-600">Receive notifications about account modifications and updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.accountChanges.enabled}
                      onChange={(e) => updatePreference('accountChanges', e.target.checked)}
                      disabled={updating}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Login Notifications */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Login Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications when your account is accessed</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.loginNotifications.enabled}
                      onChange={(e) => updatePreference('loginNotifications', e.target.checked)}
                      disabled={updating}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Newsletter */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Newsletter</h3>
                    <p className="text-sm text-gray-600">Receive our newsletter with updates and news</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences.newsletter.enabled}
                      onChange={(e) => updatePreference('newsletter', e.target.checked)}
                      disabled={updating}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={unsubscribeAll}
                  disabled={updating}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Processing...' : 'Unsubscribe from All'}
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}