import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'login' | 'register';
    onModeChange: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange }) => {
    const { login, register, loading } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (mode === 'register') {
            if (!formData.name.trim()) {
                newErrors.name = 'Name is required';
            }
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (mode === 'register') {
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (mode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await register(formData.name, formData.email, formData.password);
            }
            onClose();
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            setErrors({});
        } catch (error: any) {
            console.error('Auth error:', error);
            setErrors({ general: error.message || 'An error occurred' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{mode === 'login' ? 'Sign In' : 'Sign Up'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {errors.general && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {errors.general}
                        </div>
                    )}

                    {mode === 'register' && (
                        <Input
                            label="Name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={errors.name}
                            placeholder="Enter your name"
                            required
                        />
                    )}

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        error={errors.email}
                        placeholder="Enter your email"
                        required
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        error={errors.password}
                        placeholder="Enter your password"
                        required
                    />

                    {mode === 'register' && (
                        <Input
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            error={errors.confirmPassword}
                            placeholder="Confirm your password"
                            required
                        />
                    )}

                    <div className="flex flex-col space-y-3">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
                                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                {mode === 'login'
                                    ? "Don't have an account? Sign up"
                                    : "Already have an account? Sign in"
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
