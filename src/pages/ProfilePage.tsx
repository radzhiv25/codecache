import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar } from '../components/ui/avatar';
import { usersAPI, imageAPI } from '../lib/appwrite';
import { type User } from '../types';

const ProfilePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatar: ''
    });
    const [previewImage, setPreviewImage] = useState<string>('');
    const [imageUrl, setImageUrl] = useState<string>('');

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            const userProfile = await usersAPI.getUserByEmail(user!.email);
            setProfile(userProfile);
            setFormData({
                name: userProfile?.name || '',
                email: userProfile?.email || '',
                avatar: userProfile?.avatar || ''
            });
            setImageUrl(userProfile?.avatar || '');
            setPreviewImage(''); // Clear any preview when loading profile
        } catch (error) {
            console.error('Error loading profile:', error);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthenticated && user?.email) {
            loadProfile();
        }
    }, [isAuthenticated, user?.email, loadProfile]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        if (!user?.$id) {
            setError('User not found');
            return;
        }

        try {
            setSaving(true);
            setError('');

            // Create preview first
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = event.target?.result as string;
                setPreviewImage(preview);
            };
            reader.readAsDataURL(file);

            // Upload image to Appwrite storage
            const imageUrl = await imageAPI.uploadImage(file, user.$id);

            // Update form data with the image URL
            setFormData(prev => ({ ...prev, avatar: imageUrl }));
            setImageUrl(imageUrl); // Also update the URL input field
            setPreviewImage(''); // Clear preview since we now have the actual URL
            setSuccess('Image uploaded successfully');

            // Auto-save the profile after image upload
            if (profile) {
                try {
                    const updatedProfile = await usersAPI.updateUser(profile.$id, {
                        name: formData.name,
                        avatar: imageUrl
                    });
                    setProfile(updatedProfile);
                    setSuccess('Image uploaded and profile saved successfully');

                    // Notify navbar to refresh user profile
                    window.dispatchEvent(new CustomEvent('profileUpdated'));
                } catch (saveError) {
                    console.error('Error auto-saving profile:', saveError);
                    setError('Image uploaded but failed to save profile');
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image');
            setPreviewImage(''); // Clear preview on error
        } finally {
            setSaving(false);
        }
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const url = event.target.value;
        setImageUrl(url);
        setFormData(prev => ({ ...prev, avatar: url }));
        setPreviewImage(''); // Clear file preview when using URL
    };

    const handleUrlSubmit = async () => {
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }

        // Basic URL validation
        try {
            new URL(imageUrl);
        } catch {
            setError('Please enter a valid URL');
            return;
        }

        try {
            setError('');
            setSuccess('');

            // Update form data with the URL
            setFormData(prev => ({ ...prev, avatar: imageUrl }));
            setSuccess('Image URL set successfully');

            // Auto-save the profile after URL input
            if (profile) {
                try {
                    const updatedProfile = await usersAPI.updateUser(profile.$id, {
                        name: formData.name,
                        avatar: imageUrl
                    });
                    setProfile(updatedProfile);
                    setSuccess('Image URL set and profile saved successfully');

                    // Notify navbar to refresh user profile
                    window.dispatchEvent(new CustomEvent('profileUpdated'));
                } catch (saveError) {
                    console.error('Error auto-saving profile:', saveError);
                    setError('Image URL set but failed to save profile');
                }
            }
        } catch (error) {
            console.error('Error setting image URL:', error);
            setError('Failed to set image URL');
        }
    };

    const handleRemoveImage = async () => {
        try {
            setError('');
            setSuccess('');

            // Clear all image-related states
            setFormData(prev => ({ ...prev, avatar: '' }));
            setImageUrl('');
            setPreviewImage('');

            // Auto-save the profile after removing image
            if (profile) {
                try {
                    const updatedProfile = await usersAPI.updateUser(profile.$id, {
                        name: formData.name,
                        avatar: ''
                    });
                    setProfile(updatedProfile);
                    setSuccess('Image removed successfully');

                    // Notify navbar to refresh user profile
                    window.dispatchEvent(new CustomEvent('profileUpdated'));
                } catch (saveError) {
                    console.error('Error saving profile after image removal:', saveError);
                    setError('Image removed but failed to save profile');
                }
            }
        } catch (error) {
            console.error('Error removing image:', error);
            setError('Failed to remove image');
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');

            if (!profile) {
                setError('Profile not found');
                return;
            }


            const updatedProfile = await usersAPI.updateUser(profile.$id, {
                name: formData.name,
                avatar: formData.avatar
            });

            setProfile(updatedProfile);
            setSuccess('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
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
            setImageUrl(profile.avatar || '');
        }
        setPreviewImage(''); // Clear preview when canceling
        setError('');
        setSuccess('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
                    <p className="text-gray-600">You need to be logged in to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="mt-2 text-gray-600">Manage your profile information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your profile details and avatar
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {error && (
                                    <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                                        {success}
                                    </div>
                                )}

                                {/* Profile Picture */}
                                <div className="space-y-4">
                                    <Label>Profile Picture</Label>
                                    <div className="flex items-center space-x-4">
                                        <Avatar
                                            src={previewImage || formData.avatar}
                                            fallback={formData.name}
                                            size="xl"
                                        />
                                        <div className="flex-1">
                                            {formData.avatar ? (
                                                // Show remove button when image is set
                                                <div className="space-y-2">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={handleRemoveImage}
                                                        disabled={saving}
                                                        size="sm"
                                                    >
                                                        Remove Image
                                                    </Button>
                                                    <p className="text-xs text-gray-500">
                                                        Current image is set
                                                    </p>
                                                </div>
                                            ) : (
                                                // Show upload options when no image
                                                <div className="space-y-4">
                                                    <div>
                                                        <input
                                                            type="file"
                                                            id="avatar-upload"
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                                            disabled={saving}
                                                        >
                                                            Choose Image
                                                        </Button>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            JPG, PNG, GIF up to 5MB
                                                        </p>
                                                    </div>

                                                    {/* URL Input */}
                                                    <div className="space-y-2">
                                                        <Label htmlFor="image-url">Or enter image URL</Label>
                                                        <div className="flex space-x-2">
                                                            <Input
                                                                id="image-url"
                                                                type="url"
                                                                placeholder="https://example.com/image.jpg"
                                                                value={imageUrl}
                                                                onChange={handleUrlChange}
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleUrlSubmit}
                                                                disabled={saving || !imageUrl.trim()}
                                                            >
                                                                Set URL
                                                            </Button>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Enter a direct link to an image
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Email cannot be changed
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Benefits */}
                    <div className="lg:col-span-1">
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Why create a profile?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-sm text-blue-800">
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        Other users can find you when sharing snippets
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        You'll appear in user search results
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        Better collaboration experience
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-blue-600 mr-2">•</span>
                                        Personalize your account
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;