import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, storageAPI } from '../lib/appwrite';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { type User } from '../types';
import { FiUser, FiMail, FiSave, FiEdit2, FiUpload, FiX, FiCamera } from 'react-icons/fi';

const ProfilePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatar: ''
    });

    useEffect(() => {
        if (user && isAuthenticated) {
            loadProfile();
        }
    }, [user, isAuthenticated]);

    const loadProfile = async () => {
        if (!user?.email) return;

        try {
            setLoading(true);
            const existingProfile = await usersAPI.getUserByEmail(user.email);

            if (existingProfile) {
                setProfile(existingProfile);
                setFormData({
                    name: existingProfile.name,
                    email: existingProfile.email,
                    avatar: existingProfile.avatar || ''
                });
            } else {
                // Create initial profile
                setFormData({
                    name: user.name || '',
                    email: user.email,
                    avatar: ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            setError('');

            if (profile) {
                // Update existing profile
                const updatedProfile = await usersAPI.updateUser(profile.$id, {
                    name: formData.name,
                    avatar: formData.avatar
                });
                setProfile(updatedProfile);
                setSuccess('Profile updated successfully!');
            } else {
                // Create new profile
                const newProfile = await usersAPI.createUser({
                    name: formData.name,
                    email: formData.email,
                    avatar: formData.avatar
                });
                setProfile(newProfile);
                setSuccess('Profile created successfully!');
            }

            setEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar || ''
            });
        }
        setEditing(false);
        setError('');
        setSuccess('');
        setPreviewUrl(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            // Create preview URL
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setError('');
        }
    };

    const handleUploadAvatar = async () => {
        if (!fileInputRef.current?.files?.[0] || !user) return;

        try {
            setUploading(true);
            setError('');

            const file = fileInputRef.current.files[0];
            const avatarUrl = await storageAPI.uploadAvatar(file);

            setFormData(prev => ({ ...prev, avatar: avatarUrl }));
            setSuccess('Avatar uploaded successfully!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setError('Failed to upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveAvatar = () => {
        setPreviewUrl(null);
        setFormData(prev => ({ ...prev, avatar: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Please log in to access your profile.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
                    <p className="text-gray-600">Manage your profile information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-green-600">{success}</p>
                        </div>
                    )}

                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="relative w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {(profile?.avatar || previewUrl) ? (
                                    <img
                                        src={previewUrl || profile?.avatar}
                                        alt={profile?.name || 'Profile'}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <FiUser className="w-8 h-8 text-gray-500" />
                                )}
                                {editing && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                    >
                                        <FiCamera className="w-4 h-4 text-white" />
                                    </button>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {profile?.name || 'No name set'}
                                </h2>
                                <p className="text-gray-600">{user?.email}</p>
                            </div>
                        </div>

                        {!editing && (
                            <Button
                                onClick={() => setEditing(true)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <FiEdit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-6">
                            {/* Avatar Upload Section */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Profile Picture
                                </label>
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                        {(formData.avatar || previewUrl) ? (
                                            <img
                                                src={previewUrl || formData.avatar}
                                                alt="Profile preview"
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        ) : (
                                            <FiUser className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex items-center gap-2"
                                            >
                                                <FiUpload className="w-4 h-4" />
                                                Choose Image
                                            </Button>
                                            {(formData.avatar || previewUrl) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleRemoveAvatar}
                                                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                        {fileInputRef.current?.files?.[0] && (
                                            <Button
                                                type="button"
                                                onClick={handleUploadAvatar}
                                                disabled={uploading}
                                                className="mt-2 flex items-center gap-2"
                                                size="sm"
                                            >
                                                <FiUpload className="w-4 h-4" />
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            JPG, PNG, GIF up to 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Input
                                    label="Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div>
                                <Input
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    disabled
                                    className="bg-gray-50"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Email cannot be changed
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2"
                                >
                                    <FiSave className="w-4 h-4" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Name</label>
                                    <p className="text-gray-900 mt-1">{profile?.name || 'Not set'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                                        <FiMail className="w-4 h-4" />
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            {profile?.avatar && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Avatar</label>
                                    <p className="text-gray-900 mt-1">{profile.avatar}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                                    <p className="text-gray-900 mt-1">
                                        {profile?.createdAt
                                            ? new Date(profile.createdAt).toLocaleDateString()
                                            : 'Unknown'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                    <p className="text-gray-900 mt-1">
                                        {profile?.updatedAt
                                            ? new Date(profile.updatedAt).toLocaleDateString()
                                            : 'Never'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Why create a profile?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Other users can find you when sharing snippets</li>
                        <li>• You'll appear in user search results</li>
                        <li>• Better collaboration experience</li>
                        <li>• Personalize your account</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
