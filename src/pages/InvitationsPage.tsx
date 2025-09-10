import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sharingAPI, snippetsAPI } from '../lib/appwrite';
import { Button } from '../components/ui/Button';
import { type Invitation, type Snippet } from '../types';
import { FiClock, FiCheck, FiX, FiEye } from 'react-icons/fi';
import SnippetViewDrawer from '../components/SnippetViewDrawer';

const InvitationsPage: React.FC = () => {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [debugMode, setDebugMode] = useState(false);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [showSnippetDrawer, setShowSnippetDrawer] = useState(false);
    const [loadingSnippet, setLoadingSnippet] = useState(false);

    const loadInvitations = useCallback(async () => {
        if (!user?.email) return;

        try {
            setLoading(true);
            console.log('🔍 Loading invitations for email:', user.email);

            let userInvitations;
            if (debugMode) {
                // Load all invitations for debugging
                const allInvitations = await sharingAPI.getAllInvitations();
                userInvitations = allInvitations;
                console.log('🐛 Debug mode: Loading all invitations:', allInvitations);
            } else {
                userInvitations = await sharingAPI.getUserInvitations(user.email);
                console.log('📧 Found invitations:', userInvitations);
            }

            setInvitations(userInvitations);
        } catch (error) {
            console.error('Error loading invitations:', error);
            setError('Failed to load invitations');
        } finally {
            setLoading(false);
        }
    }, [user?.email, debugMode]);

    useEffect(() => {
        if (user?.email) {
            loadInvitations();
        }
    }, [user?.email, loadInvitations]);

    const handleAcceptInvitation = async (invitationId: string) => {
        try {
            await sharingAPI.acceptInvitation(invitationId);
            await loadInvitations(); // Reload to update the list
        } catch (error) {
            console.error('Error accepting invitation:', error);
            setError('Failed to accept invitation');
        }
    };

    const handleDeclineInvitation = async (invitationId: string) => {
        try {
            await sharingAPI.declineInvitation(invitationId);
            await loadInvitations(); // Reload to update the list
        } catch (error) {
            console.error('Error declining invitation:', error);
            setError('Failed to decline invitation');
        }
    };

    const handleViewSnippet = async (snippetId: string) => {
        try {
            setLoadingSnippet(true);
            const snippet = await snippetsAPI.getSnippet(snippetId);
            setSelectedSnippet(snippet);
            setShowSnippetDrawer(true);
        } catch (error) {
            console.error('Error loading snippet:', error);
            setError('Failed to load snippet');
        } finally {
            setLoadingSnippet(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isExpired = (expiresAt: string) => {
        return new Date(expiresAt) < new Date();
    };

    const getStatusColor = (status: string, expiresAt: string) => {
        if (isExpired(expiresAt)) return 'text-red-600 bg-red-100';
        if (status === 'accepted') return 'text-green-600 bg-green-100';
        if (status === 'declined') return 'text-gray-600 bg-gray-100';
        return 'text-yellow-600 bg-yellow-100';
    };

    const getStatusIcon = (status: string, expiresAt: string) => {
        if (isExpired(expiresAt)) return <FiX className="w-4 h-4" />;
        if (status === 'accepted') return <FiCheck className="w-4 h-4" />;
        if (status === 'declined') return <FiX className="w-4 h-4" />;
        return <FiClock className="w-4 h-4" />;
    };

    const getStatusText = (status: string, expiresAt: string) => {
        if (isExpired(expiresAt)) return 'Expired';
        if (status === 'accepted') return 'Accepted';
        if (status === 'declined') return 'Declined';
        return 'Pending';
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Please log in to view your invitations.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Invitations
                                </h1>
                                <p className="text-gray-600">
                                    Manage your snippet sharing invitations
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={debugMode}
                                        onChange={(e) => {
                                            setDebugMode(e.target.checked);
                                            if (e.target.checked) {
                                                loadInvitations();
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    Debug Mode (Show All)
                                </label>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={loadInvitations}
                                >
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Invitations List */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-gray-500">Loading invitations...</div>
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">
                                {debugMode ? 'No invitations found in database.' : 'You don\'t have any invitations yet.'}
                            </div>
                            <p className="text-sm text-gray-400">
                                {debugMode
                                    ? 'Try turning off debug mode to see user-specific invitations.'
                                    : 'When someone shares a snippet with you, it will appear here.'
                                }
                            </p>
                            {debugMode && (
                                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                                    <strong>Debug Info:</strong> Check the browser console for detailed logs about the invitation search.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.$id}
                                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    Snippet Invitation
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    You've been invited to collaborate on a code snippet
                                                </p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>Invited: {formatDate(invitation.createdAt)}</span>
                                                    <span>Expires: {formatDate(invitation.expiresAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        invitation.status,
                                                        invitation.expiresAt
                                                    )}`}
                                                >
                                                    {getStatusIcon(invitation.status, invitation.expiresAt)}
                                                    <span className="ml-1">
                                                        {getStatusText(invitation.status, invitation.expiresAt)}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {invitation.permissions.map((permission) => (
                                                    <span
                                                        key={permission}
                                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md capitalize"
                                                    >
                                                        {permission}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {invitation.status === 'pending' && !isExpired(invitation.expiresAt) && (
                                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAcceptInvitation(invitation.$id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <FiCheck className="w-4 h-4" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeclineInvitation(invitation.$id)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                    Decline
                                                </Button>
                                            </div>
                                        )}

                                        {invitation.status === 'accepted' && (
                                            <div className="pt-4 border-t border-gray-100">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2"
                                                    onClick={() => handleViewSnippet(invitation.snippetId)}
                                                    disabled={loadingSnippet}
                                                >
                                                    <FiEye className="w-4 h-4" />
                                                    {loadingSnippet ? 'Loading...' : 'View Snippet'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Snippet View Drawer */}
            {selectedSnippet && (
                <SnippetViewDrawer
                    isOpen={showSnippetDrawer}
                    onClose={() => {
                        setShowSnippetDrawer(false);
                        setSelectedSnippet(null);
                    }}
                    snippet={selectedSnippet}
                />
            )}
        </>
    );
};

export default InvitationsPage;
