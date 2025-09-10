import React, { useState, useEffect } from 'react';
import { usersAPI } from '../lib/appwrite';
import { type User } from '../types';
import { FiSearch, FiUser, FiMail } from 'react-icons/fi';

interface UserSearchProps {
    onUserSelect: (user: User) => void;
    placeholder?: string;
    className?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
    onUserSelect,
    placeholder = "Search users by name or email (starts with)...",
    className = ""
}) => {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchUsers = async (searchQuery: string) => {
        if (!searchQuery.trim() || searchQuery.trim().length < 2) {
            setUsers([]);
            setShowResults(false);
            return;
        }

        try {
            setLoading(true);
            const searchResults = await usersAPI.searchUsers(searchQuery);
            setUsers(searchResults);
            setShowResults(true);
        } catch (error) {
            console.error('Error searching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchUsers(query);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleUserSelect = (user: User) => {
        onUserSelect(user);
        setQuery('');
        setShowResults(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleInputFocus = () => {
        if (users.length > 0) {
            setShowResults(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding results to allow clicking on them
        setTimeout(() => setShowResults(false), 200);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {showResults && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {users.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">
                            {loading ? 'Searching...' : query.length < 2 ? 'Type at least 2 characters to search' : 'No users found'}
                        </div>
                    ) : (
                        <div className="py-1">
                            {users.map((user) => (
                                <button
                                    key={user.$id}
                                    onClick={() => handleUserSelect(user)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-3"
                                >
                                    <div className="flex-shrink-0">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <FiUser className="w-4 h-4 text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate flex items-center">
                                            <FiMail className="w-3 h-3 mr-1" />
                                            {user.email}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserSearch;
