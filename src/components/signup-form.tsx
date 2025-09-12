import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from "../lib/utils"
import { Button } from "./ui/Button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card"
import { Input } from "./ui/Input"
import { Label } from "./ui/label"
import { FiEye, FiEyeOff, FiGithub } from 'react-icons/fi'

interface SignupFormProps {
    onSubmit: (name: string, email: string, password: string) => Promise<void>;
    onGitHubLogin?: () => Promise<void>;
    loading?: boolean;
    error?: string;
    className?: string;
}

export function SignupForm({
    className,
    onSubmit,
    onGitHubLogin,
    loading = false,
    error,
    ...props
}: SignupFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await onSubmit(formData.name, formData.email, formData.password);
        } catch (error: unknown) {
            console.error('Signup error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
            setErrors({ general: errorMessage });
        }
    };

    const handleGitHubLogin = async () => {
        if (onGitHubLogin) {
            try {
                await onGitHubLogin();
            } catch (error: unknown) {
                console.error('GitHub login error:', error);
                const errorMessage = error instanceof Error ? error.message : 'GitHub login failed';
                setErrors({ general: errorMessage });
            }
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                        Enter your information below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
                                {error}
                            </div>
                        )}
                        {errors.general && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md mb-4">
                                {errors.general}
                            </div>
                        )}
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="w-4 h-4" />
                                        ) : (
                                            <FiEye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <FiEyeOff className="w-4 h-4" />
                                        ) : (
                                            <FiEye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    type="button"
                                    onClick={handleGitHubLogin}
                                    disabled={loading}
                                >
                                    <FiGithub className="w-4 h-4 mr-2" />
                                    Sign up with GitHub
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="underline underline-offset-4">
                                Sign in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
