import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from './ui/drawer';
import { Button } from './ui/Button';
import { Avatar } from './ui/avatar';
import { type Snippet, type SnippetWithUser } from '../types';
import { FiCopy, FiCheck } from 'react-icons/fi';

interface SnippetViewDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    snippet: Snippet | SnippetWithUser | null;
}

const SnippetViewDrawer: React.FC<SnippetViewDrawerProps> = ({
    isOpen,
    onClose,
    snippet,
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = async () => {
        if (!snippet) return;

        try {
            await navigator.clipboard.writeText(snippet.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!snippet) return null;

    return (
        <Drawer open={isOpen} onOpenChange={onClose} direction="right">
            <DrawerContent className="w-full sm:w-3/4 lg:w-1/2 xl:w-2/5">
                <DrawerHeader className="border-b">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <DrawerTitle className="text-xl font-bold text-gray-900 mb-2">
                                {snippet.title}
                            </DrawerTitle>
                            {snippet.description && (
                                <p className="text-gray-600 text-sm">{snippet.description}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLanguageColor(snippet.language)}`}>
                                {snippet.language}
                            </span>
                            {!snippet.isPublic && (
                                <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
                                    Private
                                </span>
                            )}
                        </div>
                    </div>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Tags */}
                    {snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {snippet.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Code Block */}
                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-600">
                                {snippet.language} Code
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyCode}
                                className="flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <FiCheck className="w-4 h-4" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <FiCopy className="w-4 h-4" />
                                        Copy Code
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <pre className="p-4 text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-wrap code-block">
                                <code>{snippet.code}</code>
                            </pre>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                            <span>Created {formatDate(snippet.createdAt)}</span>
                            {'owner' in snippet && (
                                <div className="flex items-center space-x-2">
                                    <span>by</span>
                                    <Avatar
                                        src={snippet.owner.avatar}
                                        fallback={snippet.owner.name}
                                        size="sm"
                                    />
                                    <span className="font-medium">{snippet.owner.name}</span>
                                </div>
                            )}
                            {snippet.lastModifiedBy && (
                                <span>Modified {formatDate(snippet.updatedAt)}</span>
                            )}
                        </div>
                        <div className="text-xs text-gray-400">
                            {snippet.code.length} characters
                        </div>
                    </div>
                </div>

                <DrawerFooter className="border-t">
                    <Button variant="outline" onClick={onClose} className="w-full">
                        Close
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default SnippetViewDrawer;
