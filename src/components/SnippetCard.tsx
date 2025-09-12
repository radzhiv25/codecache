import React, { useState } from 'react';
import { type Snippet, type SnippetWithUser } from '../types';
import { Button } from './ui/Button';
import { Avatar } from './ui/avatar';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface SnippetCardProps {
    snippet: Snippet | SnippetWithUser;
    onView: (snippet: Snippet) => void;
    onEdit?: (snippet: Snippet) => void;
    onDelete?: (snippet: Snippet) => void;
    onShare?: (snippet: Snippet) => void;
    showActions?: boolean;
}

const SnippetCard: React.FC<SnippetCardProps> = ({
    snippet,
    onView,
    onEdit,
    onDelete,
    onShare,
    showActions = false,
}) => {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getLanguageColor = (language: string) => {
        const colors: Record<string, string> = {
            javascript: 'bg-yellow-100 text-yellow-800',
            typescript: 'bg-blue-100 text-blue-800',
            python: 'bg-green-100 text-green-800',
            java: 'bg-red-100 text-red-800',
            cpp: 'bg-purple-100 text-purple-800',
            c: 'bg-gray-100 text-gray-800',
            html: 'bg-orange-100 text-orange-800',
            css: 'bg-pink-100 text-pink-800',
            json: 'bg-indigo-100 text-indigo-800',
            xml: 'bg-teal-100 text-teal-800',
            default: 'bg-gray-100 text-gray-800',
        };
        return colors[language.toLowerCase()] || colors.default;
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(snippet.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                            {snippet.title}
                        </h3>
                        {snippet.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {snippet.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(snippet.language)}`}>
                            {snippet.language}
                        </span>
                        {!snippet.isPublic && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                Private
                            </span>
                        )}
                    </div>
                </div>

                <div className="mb-4 flex-1">
                    <div className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden h-full flex flex-col">
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-200 flex-shrink-0">
                            <span className="text-xs font-medium text-gray-600">
                                {snippet.language}
                            </span>
                            <button
                                onClick={handleCopyCode}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                                title="Copy code"
                            >
                                {copied ? (
                                    <>
                                        <FiCheck className="w-3 h-3" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <FiCopy className="w-3 h-3" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto max-h-48">
                            <pre className="p-3 text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-wrap break-words">
                                <code>{snippet.code}</code>
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                    {snippet.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                        <span>Created {formatDate(snippet.createdAt)}</span>
                        {'owner' in snippet && (
                            <div className="flex items-center space-x-1">
                                <span>by</span>
                                <Avatar
                                    src={snippet.owner.avatar}
                                    fallback={snippet.owner.name}
                                    size="xs"
                                />
                                <span className="font-medium">{snippet.owner.name}</span>
                            </div>
                        )}
                    </div>
                    {snippet.lastModifiedBy && (
                        <span>Modified {formatDate(snippet.updatedAt)}</span>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onView(snippet)}
                            >
                                View
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyCode}
                                className="flex items-center gap-1"
                            >
                                {copied ? (
                                    <>
                                        <FiCheck className="w-3 h-3" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <FiCopy className="w-3 h-3" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>

                        {showActions && (
                            <div className="flex flex-wrap gap-2">
                                {onEdit && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(snippet)}
                                    >
                                        Edit
                                    </Button>
                                )}
                                {onShare && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onShare(snippet)}
                                    >
                                        Share
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(snippet)}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnippetCard;
