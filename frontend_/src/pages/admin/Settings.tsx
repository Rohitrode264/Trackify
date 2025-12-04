import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Database,
    Mail,
    Save,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';

export const Settings: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Settings state
    const [settings, setSettings] = useState({
        emailNotifications: true,
        orderAlerts: true,
        systemMaintenance: false,
        autoBackup: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
    });

    useEffect(() => {
        // Load settings from API or localStorage
        const savedSettings = localStorage.getItem('app_settings');
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.error('Failed to load settings');
            }
        }
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Save to localStorage (or API if available)
            localStorage.setItem('app_settings', JSON.stringify(settings));

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            setSettings({
                emailNotifications: true,
                orderAlerts: true,
                systemMaintenance: false,
                autoBackup: true,
                sessionTimeout: 30,
                maxLoginAttempts: 5,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500">
                            Administration · System
                        </p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                            Settings
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage system configuration and preferences
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {success && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-700 font-medium">Saved successfully</span>
                            </div>
                        )}
                        {error && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-700 font-medium">{error}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* General Settings */}
                        <Card padding="lg" shadow="md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <SettingsIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                                    <p className="text-sm text-gray-500">Basic system configuration</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Session Timeout */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Timeout (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="120"
                                        value={settings.sessionTimeout}
                                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Users will be logged out after inactivity</p>
                                </div>

                                {/* Max Login Attempts */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Login Attempts
                                    </label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="10"
                                        value={settings.maxLoginAttempts}
                                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Account will be locked after exceeding attempts</p>
                                </div>
                            </div>
                        </Card>

                        {/* Notification Settings */}
                        <Card padding="lg" shadow="md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 rounded-xl">
                                    <Bell className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                                    <p className="text-sm text-gray-500">Manage email and alert preferences</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">Email Notifications</p>
                                            <p className="text-sm text-gray-500">Receive email updates for important events</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Bell className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">Order Alerts</p>
                                            <p className="text-sm text-gray-500">Get notified about new and pending orders</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.orderAlerts}
                                            onChange={(e) => setSettings({ ...settings, orderAlerts: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </Card>

                        {/* System Settings */}
                        <Card padding="lg" shadow="md">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-50 rounded-xl">
                                    <Database className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">System</h2>
                                    <p className="text-sm text-gray-500">Database and maintenance options</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Database className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">Auto Backup</p>
                                            <p className="text-sm text-gray-500">Automatically backup data daily</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoBackup}
                                            onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="font-medium text-gray-900">System Maintenance Mode</p>
                                            <p className="text-sm text-gray-500">Temporarily disable access for maintenance</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.systemMaintenance}
                                            onChange={(e) => setSettings({ ...settings, systemMaintenance: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar - User Info & Actions */}
                    <div className="space-y-6">
                        {/* Current User */}
                        <Card padding="lg" shadow="md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-xl">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Current User</h2>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Name</p>
                                    <p className="font-medium text-gray-900">{user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="font-medium text-gray-900">{user?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Role</p>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                                        {user?.role || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Actions */}
                        <Card padding="lg" shadow="md">
                            <div className="space-y-3">
                                <Button
                                    variant="primary"
                                    size="md"
                                    onClick={handleSave}
                                    loading={loading}
                                    className="w-full"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Settings
                                </Button>
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={handleReset}
                                    className="w-full"
                                >
                                    Reset to Default
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
