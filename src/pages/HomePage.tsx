import React, { useState, useEffect, useCallback } from 'react';
import { snippetsAPI } from '../lib/appwrite';
import { useAuth } from '../contexts/AuthContext';
import SnippetCard from '../components/SnippetCard';
import CreateSnippetModal from '../components/CreateSnippetModal';
import SnippetViewDrawer from '../components/SnippetViewDrawer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { type Snippet, type SnippetWithUser, type CreateSnippetData } from '../types';

const LANGUAGES = [
    'All Languages', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#',
    'HTML', 'CSS', 'JSON', 'XML', 'Markdown', 'SQL', 'PHP', 'Ruby',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Other'
];

const HomePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [snippets, setSnippets] = useState<(Snippet | SnippetWithUser)[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('All Languages');
    const [selectedTag, setSelectedTag] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewDrawer, setShowViewDrawer] = useState(false);
    const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
    const [creating, setCreating] = useState(false);

    // Get unique tags from all snippets
    const getAllTags = useCallback(() => {
        const allTags = snippets.flatMap(snippet => snippet.tags);
        return Array.from(new Set(allTags)).sort();
    }, [snippets]);

    const loadSnippets = useCallback(async () => {
        try {
            setLoading(true);
            const publicSnippets = await snippetsAPI.getPublicSnippetsWithUsers();
            setSnippets(publicSnippets);
        } catch (error) {
            console.error('Error loading snippets:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSnippets();
    }, [loadSnippets]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadSnippets();
            return;
        }

        try {
            setLoading(true);
            const searchResults = await snippetsAPI.searchSnippets(searchQuery, true);
            setSnippets(searchResults);
        } catch (error) {
            console.error('Error searching snippets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter snippets based on search, language, and tag
    const filteredSnippets = snippets.filter(snippet => {
        const matchesSearch = !searchQuery.trim() ||
            snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLanguage = selectedLanguage === 'All Languages' ||
            snippet.language === selectedLanguage;

        const matchesTag = selectedTag === 'all' ||
            snippet.tags.includes(selectedTag);

        return matchesSearch && matchesLanguage && matchesTag;
    });

    const handleCreateSnippet = async (data: CreateSnippetData) => {
        // For public snippets, we can create them without authentication
        // but we need to handle the case where user is not logged in
        if (!user && !data.isPublic) {
            throw new Error('You must be logged in to create private snippets');
        }

        try {
            setCreating(true);
            // If user is logged in, use their ID, otherwise use a placeholder for public snippets
            const ownerId = user?.$id || 'anonymous';
            await snippetsAPI.createSnippet(data, ownerId);
            await loadSnippets(); // Reload to show the new snippet
        } catch (error) {
            console.error('Error creating snippet:', error);
            throw error;
        } finally {
            setCreating(false);
        }
    };

    const handleViewSnippet = (snippet: Snippet) => {
        setSelectedSnippet(snippet);
        setShowViewDrawer(true);
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Public Code Snippets
                    </h1>
                    <p className="text-gray-600">
                        Discover and share code snippets with the community
                    </p>
                </div>

                {/* Search, Filters, and Create */}
                <div className="space-y-4 mb-8">
                    <div className="flex flex-col lg:flex-row items-end gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <Input
                                type="text"
                                placeholder="Search snippets by title, description, code, or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                            <Button type="submit" disabled={loading} className="h-10 px-6">
                                {'Search'}
                            </Button>
                        </form>

                        {/* Filters */}
                        <div className="flex flex-col md:flex-row gap-4 flex-1">
                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Language
                                </label>
                                <Select
                                    value={selectedLanguage}
                                    onValueChange={setSelectedLanguage}
                                >
                                    <SelectTrigger className="w-full h-10 data-[size=default]:h-10">
                                        <SelectValue placeholder="Filter by language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LANGUAGES.map(lang => (
                                            <SelectItem key={lang} value={lang}>
                                                {lang}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="w-full">
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Tag
                                </label>
                                <Select
                                    value={selectedTag}
                                    onValueChange={setSelectedTag}
                                >
                                    <SelectTrigger className="w-full h-10 data-[size=default]:h-10">
                                        <SelectValue placeholder="Filter by tag" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Tags</SelectItem>
                                        {getAllTags().map(tag => (
                                            <SelectItem key={tag} value={tag}>
                                                #{tag}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={() => setShowCreateModal(true)}>
                                Create Snippet
                            </Button>
                        </div>
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
                            {searchQuery || selectedLanguage !== 'All Languages' || selectedTag !== 'all'
                                ? 'No snippets found matching your filters.'
                                : 'No public snippets available yet.'}
                        </div>
                        {!searchQuery && selectedLanguage === 'All Languages' && selectedTag === 'all' && (
                            <Button onClick={() => setShowCreateModal(true)}>
                                Be the first to create a snippet!
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSnippets.map((snippet) => (
                            <SnippetCard
                                key={snippet.$id}
                                snippet={snippet}
                                onView={handleViewSnippet}
                                showActions={false}
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
                    isAuthenticated={isAuthenticated}
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

export default HomePage;
