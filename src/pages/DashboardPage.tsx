import React, { useState, useEffect, useCallback } from 'react';
import { snippetsAPI, sharedSnippetsAPI } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';
import SnippetCard from '../components/SnippetCard';
import CreateSnippetModal from '../components/CreateSnippetModal';
import ShareSnippetModal from '../components/ShareSnippetModal';
import SnippetViewDrawer from '../components/SnippetViewDrawer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { type Snippet, type CreateSnippetData } from '../types';
import { FiUser, FiUsers } from 'react-icons/fi';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [ownedSnippets, setOwnedSnippets] = useState<Snippet[]>([]);
    const [sharedSnippets, setSharedSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showViewDrawer, setShowViewDrawer] = useState(false);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [creating, setCreating] = useState(false);
    const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
    const [viewMode, setViewMode] = useState<'owned' | 'shared' | 'all'>('all');

    const loadSnippets = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const { owned, shared } = await sharedSnippetsAPI.getAllAccessibleSnippets(user.$id, user.email);
            setOwnedSnippets(owned);
            setSharedSnippets(shared);
        } catch (error) {
            console.error('Error loading snippets:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadSnippets();
        }
    }, [user, loadSnippets]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadSnippets();
            return;
        }

        // For now, we'll do client-side filtering since we already have all snippets
        // In a real app, you might want to implement server-side search
        loadSnippets();
    };

    const handleCreateSnippet = async (data: CreateSnippetData) => {
        if (!user) return;

        try {
            setCreating(true);
            await snippetsAPI.createSnippet(data, user.$id);
            await loadSnippets();
        } catch (error) {
            console.error('Error creating snippet:', error);
            throw error;
        } finally {
            setCreating(false);
        }
    };

    const handleEditSnippet = (snippet: Snippet) => {
        // For now, just show an alert. In a real app, you'd open an edit modal or navigate to edit page
        alert(`Editing snippet: ${snippet.title}`);
    };

    const handleDeleteSnippet = async (snippet: Snippet) => {
        if (!confirm(`Are you sure you want to delete "${snippet.title}"?`)) return;

        try {
            await snippetsAPI.deleteSnippet(snippet.$id);
            await loadSnippets();
        } catch (error) {
            console.error('Error deleting snippet:', error);
            alert('Failed to delete snippet');
        }
    };

    const handleShareSnippet = (snippet: Snippet) => {
        setSelectedSnippet(snippet);
        setShowShareModal(true);
    };

    const handleViewSnippet = (snippet: Snippet) => {
        setSelectedSnippet(snippet);
        setShowViewDrawer(true);
    };

    // Get snippets based on view mode
    const getCurrentSnippets = () => {
        switch (viewMode) {
            case 'owned':
                return ownedSnippets;
            case 'shared':
                return sharedSnippets;
            case 'all':
            default:
                return [...ownedSnippets, ...sharedSnippets];
        }
    };

    const currentSnippets = getCurrentSnippets();

    const filteredSnippets = currentSnippets.filter(snippet => {
        const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = filter === 'all' ||
            (filter === 'public' && snippet.isPublic) ||
            (filter === 'private' && !snippet.isPublic);

        return matchesSearch && matchesFilter;
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Please log in to access your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        My Snippets
                    </h1>
                    <p className="text-gray-600">
                        Manage your personal code snippets
                    </p>
                </div>

                {/* Search, Filter, and Create */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search your snippets..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={loading} className="h-10 px-6">
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </div>
                    </form>

                    <div className="flex gap-2">
                        <Select
                            value={filter}
                            onValueChange={(value) => setFilter(value as 'all' | 'public' | 'private')}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Snippets</SelectItem>
                                <SelectItem value="public">Public Only</SelectItem>
                                <SelectItem value="private">Private Only</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={() => setShowCreateModal(true)}>
                            Create Snippet
                        </Button>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-md w-fit">
                        <button
                            onClick={() => setViewMode('all')}
                            className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${viewMode === 'all'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiUsers className="w-4 h-4" />
                            <span>All Snippets ({ownedSnippets.length + sharedSnippets.length})</span>
                        </button>
                        <button
                            onClick={() => setViewMode('owned')}
                            className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${viewMode === 'owned'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiUser className="w-4 h-4" />
                            <span>My Snippets ({ownedSnippets.length})</span>
                        </button>
                        <button
                            onClick={() => setViewMode('shared')}
                            className={`flex items-center space-x-2 py-2 px-4 text-sm font-medium rounded-md transition-colors ${viewMode === 'shared'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <FiUsers className="w-4 h-4" />
                            <span>Shared with Me ({sharedSnippets.length})</span>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{currentSnippets.length}</div>
                        <div className="text-sm text-gray-600">Total Snippets</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">
                            {currentSnippets.filter(s => s.isPublic).length}
                        </div>
                        <div className="text-sm text-gray-600">Public Snippets</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">
                            {currentSnippets.filter(s => !s.isPublic).length}
                        </div>
                        <div className="text-sm text-gray-600">Private Snippets</div>
                    </div>
                </div>

                {/* Snippets Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-gray-500">Loading snippets...</div>
                    </div>
                ) : filteredSnippets.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 mb-4">
                            {searchQuery
                                ? 'No snippets found matching your search.'
                                : viewMode === 'shared'
                                    ? 'No snippets have been shared with you yet.'
                                    : viewMode === 'owned'
                                        ? 'You haven\'t created any snippets yet.'
                                        : 'You don\'t have any snippets yet.'
                            }
                        </div>
                        {!searchQuery && viewMode !== 'shared' && (
                            <Button onClick={() => setShowCreateModal(true)}>
                                Create Your First Snippet
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredSnippets.map((snippet) => (
                            <SnippetCard
                                key={snippet.$id}
                                snippet={snippet}
                                onView={handleViewSnippet}
                                onEdit={handleEditSnippet}
                                onDelete={handleDeleteSnippet}
                                onShare={handleShareSnippet}
                                showActions={true}
                            />
                        ))}
                    </div>
                )}

                {/* Create Snippet Modal */}
                <CreateSnippetModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateSnippet}
                    loading={creating}
                />

                {/* Share Snippet Modal */}
                <ShareSnippetModal
                    isOpen={showShareModal}
                    onClose={() => {
                        setShowShareModal(false);
                        setSelectedSnippet(null);
                    }}
                    snippet={selectedSnippet}
                />

                {/* View Snippet Drawer */}
                <SnippetViewDrawer
                    isOpen={showViewDrawer}
                    onClose={() => {
                        setShowViewDrawer(false);
                        setSelectedSnippet(null);
                    }}
                    snippet={selectedSnippet}
                />
            </div>
        </div>
    );
};

export default DashboardPage;
