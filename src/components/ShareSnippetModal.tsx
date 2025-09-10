import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Checkbox } from './ui/checkbox';
import { sharingAPI, collaborationAPI } from '../lib/appwrite';
import { type Snippet, type ShareSnippetData, type User, type CreateCollaborationRequestData } from '../types';
import { FiCheck, FiAlertTriangle, FiUser, FiMail, FiX } from 'react-icons/fi';
import UserSearch from './UserSearch';

interface ShareSnippetModalProps {
    isOpen: boolean;
    onClose: () => void;
    snippet: Snippet | null;
}

const ShareSnippetModal: React.FC<ShareSnippetModalProps> = ({
    isOpen,
    onClose,
    snippet,
}) => {
    const [formData, setFormData] = useState<ShareSnippetData>({
        inviteeEmail: '',
        permissions: ['read'],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [existingInvitation, setExistingInvitation] = useState<{ status: string; expiresAt: string } | null>(null);
    const [checkingExisting, setCheckingExisting] = useState(false);
    const [shareMode, setShareMode] = useState<'email' | 'user'>('email');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [message, setMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setExistingInvitation(null);
    };

    // Check for existing invitation when email changes
    const checkExistingInvitation = useCallback(async (email: string) => {
        if (!snippet || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setExistingInvitation(null);
            return;
        }

        try {
            setCheckingExisting(true);
            const existing = await sharingAPI.checkExistingInvitation(snippet.$id, email);
            setExistingInvitation(existing);
        } catch (error) {
            console.error('Error checking existing invitation:', error);
        } finally {
            setCheckingExisting(false);
        }
    }, [snippet]);

    const handlePermissionChange = (permission: 'read' | 'write' | 'admin') => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!snippet) return;

        if (formData.permissions.length === 0) {
            setError('Please select at least one permission');
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (shareMode === 'email') {
                if (!formData.inviteeEmail.trim()) {
                    setError('Email is required');
                    return;
                }

                if (!/\S+@\S+\.\S+/.test(formData.inviteeEmail)) {
                    setError('Please enter a valid email address');
                    return;
                }

                await sharingAPI.shareSnippet(formData, snippet.$id, snippet.ownerId);
            } else {
                if (!selectedUser) {
                    setError('Please select a user');
                    return;
                }

                const collaborationData: CreateCollaborationRequestData = {
                    recipientId: selectedUser.$id,
                    permissions: formData.permissions,
                    message: message.trim() || undefined,
                };

                await collaborationAPI.createCollaborationRequest(collaborationData, snippet.$id, snippet.ownerId);
            }

            setSuccess(true);
            setFormData({ inviteeEmail: '', permissions: ['read'] });
            setSelectedUser(null);
            setMessage('');

            // Auto-close after 2 seconds
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (error: unknown) {
            console.error('Error sharing snippet:', error);
            setError((error as Error).message || 'Failed to share snippet');
        } finally {
            setLoading(false);
        }
    };

    // Debounced effect to check for existing invitations
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.inviteeEmail.trim()) {
                checkExistingInvitation(formData.inviteeEmail);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [formData.inviteeEmail, checkExistingInvitation]);

    const handleClose = () => {
        setFormData({ inviteeEmail: '', permissions: ['read'] });
        setError('');
        setSuccess(false);
        setExistingInvitation(null);
        setSelectedUser(null);
        setMessage('');
        setShareMode('email');
        onClose();
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setError('');
    };

    if (!snippet) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share "{snippet.title}"</DialogTitle>
                </DialogHeader>
                {success ? (
                    <div className="text-center py-4">
                        <div className="text-green-600 mb-2">
                            <FiCheck className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Invitation Sent!</h3>
                        <p className="text-gray-600">
                            An invitation has been sent to {formData.inviteeEmail}
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="bg-gray-50 p-3 rounded-md">
                            <h4 className="font-medium text-gray-900 mb-1">{snippet.title}</h4>
                            <p className="text-sm text-gray-600">
                                {snippet.isPublic ? 'Public' : 'Private'} • {snippet.language}
                            </p>
                        </div>

                        {/* Share Mode Toggle */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
                            <button
                                type="button"
                                onClick={() => setShareMode('email')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${shareMode === 'email'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <FiMail className="w-4 h-4 inline mr-2" />
                                Email Invitation
                            </button>
                            <button
                                type="button"
                                onClick={() => setShareMode('user')}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${shareMode === 'user'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <FiUser className="w-4 h-4 inline mr-2" />
                                User Request
                            </button>
                        </div>

                        {shareMode === 'email' ? (
                            <div>
                                <Input
                                    label="Email Address"
                                    name="inviteeEmail"
                                    type="email"
                                    value={formData.inviteeEmail}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address to invite"
                                // required
                                />
                                {checkingExisting && (
                                    <p className="text-xs text-gray-500 mt-1">Checking for existing invitations...</p>
                                )}
                                {existingInvitation && (
                                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                        <div className="flex items-start">
                                            <FiAlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="text-yellow-800 font-medium">
                                                    Invitation already exists for this email
                                                </p>
                                                <p className="text-yellow-700 mt-1">
                                                    Status: <span className="capitalize">{existingInvitation.status}</span>
                                                    {existingInvitation.status === 'pending' && new Date(existingInvitation.expiresAt) > new Date() && (
                                                        <span> (Expires: {new Date(existingInvitation.expiresAt).toLocaleDateString()})</span>
                                                    )}
                                                </p>
                                                {(existingInvitation.status === 'declined' || new Date(existingInvitation.expiresAt) <= new Date()) && (
                                                    <p className="text-yellow-700 mt-1">
                                                        The invitation will be renewed with new permissions.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Select User
                                    </label>
                                    <UserSearch
                                        onUserSelect={handleUserSelect}
                                        placeholder="Search users by name or email (starts with)..."
                                    />
                                    {selectedUser && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {selectedUser.avatar ? (
                                                        <img
                                                            src={selectedUser.avatar}
                                                            alt={selectedUser.name}
                                                            className="w-8 h-8 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <FiUser className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {selectedUser.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {selectedUser.email}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUser(null)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Message (Optional)
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Add a personal message..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Permissions</label>
                            <div className="space-y-3">
                                {[
                                    { key: 'read', label: 'Read', description: 'Can view the snippet' },
                                    { key: 'write', label: 'Write', description: 'Can edit the snippet' },
                                    { key: 'admin', label: 'Admin', description: 'Can edit and manage sharing' },
                                ].map(({ key, label, description }) => (
                                    <div key={key} className="flex items-start space-x-3">
                                        <Checkbox
                                            id={`permission-${key}`}
                                            checked={formData.permissions.includes(key as 'read' | 'write' | 'admin')}
                                            onCheckedChange={() => handlePermissionChange(key as 'read' | 'write' | 'admin')}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <label
                                                htmlFor={`permission-${key}`}
                                                className="text-sm font-medium text-gray-900 cursor-pointer"
                                            >
                                                {label}
                                            </label>
                                            <div className="text-xs text-gray-500 mt-1">{description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading
                                    ? 'Sending...'
                                    : shareMode === 'email'
                                        ? (existingInvitation
                                            ? (existingInvitation.status === 'pending' && new Date(existingInvitation.expiresAt) > new Date())
                                                ? 'Send New Invitation'
                                                : 'Update Invitation'
                                            : 'Send Invitation')
                                        : 'Send Collaboration Request'
                                }
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ShareSnippetModal;
