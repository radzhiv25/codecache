import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { type CreateSnippetData } from '../types';
import { FiInfo } from 'react-icons/fi';

interface CreateSnippetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateSnippetData) => Promise<void>;
    loading?: boolean;
    isAuthenticated?: boolean;
}

const LANGUAGES = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#',
    'HTML', 'CSS', 'JSON', 'XML', 'Markdown', 'SQL', 'PHP', 'Ruby',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Other'
];

const CreateSnippetModal: React.FC<CreateSnippetModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading = false,
    isAuthenticated = true,
}) => {
    const [formData, setFormData] = useState<CreateSnippetData>({
        title: '',
        description: '',
        code: '',
        language: 'JavaScript',
        tags: [],
        isPublic: !isAuthenticated, // Default to public for non-authenticated users
    });
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tagInput.trim()]
            }));
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.code.trim()) {
            newErrors.code = 'Code is required';
        }

        if (!formData.language) {
            newErrors.language = 'Language is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await onSubmit(formData);
            // Reset form
            setFormData({
                title: '',
                description: '',
                code: '',
                language: 'JavaScript',
                tags: [],
                isPublic: false,
            });
            setTagInput('');
            setErrors({});
            onClose();
        } catch (error: unknown) {
            console.error('Error creating snippet:', error);
            setErrors({ general: (error as Error).message || 'An error occurred' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Snippet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {errors.general}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <Input
                            label="Title"
                            name="title"
                            type="text"
                            value={formData.title}
                            onChange={handleInputChange}
                            error={errors.title}
                            placeholder="Enter snippet title"
                            required
                        />

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Language <span className="text-red-500">*</span></label>
                            <Select
                                value={formData.language}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                            >
                                <SelectTrigger className="w-full h-10 data-[size=default]:h-10">
                                    <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map(lang => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.language && (
                                <p className="text-sm text-red-500">{errors.language}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe what this snippet does..."
                            rows={2}
                            className={errors.description ? 'border-red-500 focus:ring-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Code <span className="text-red-500">*</span></label>
                        <Textarea
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="Paste your code here..."
                            rows={10}
                            className={`font-mono text-sm ${errors.code ? 'border-red-500 focus:ring-red-500' : ''}`}
                            required
                        />
                        {errors.code && (
                            <p className="text-sm text-red-500">{errors.code}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tags</label>
                        <div className="flex items-center gap-2">
                            <Input
                                name="tagInput"
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Add a tag and press Enter"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                size="lg"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim()}
                            >
                                Add
                            </Button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {formData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 text-gray-400 hover:text-gray-600"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="isPublic"
                                checked={formData.isPublic}
                                onChange={handleInputChange}
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                            />
                            <label className="text-sm text-gray-700">
                                Make this snippet public
                            </label>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <FiInfo className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        <strong>Note:</strong> As a guest user, you can only create public snippets.{" "}
                                        <a href="/signup" className="font-medium underline text-blue-700 hover:text-blue-600">
                                            Sign up
                                        </a> to create private snippets and manage your collection.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Snippet'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateSnippetModal;
