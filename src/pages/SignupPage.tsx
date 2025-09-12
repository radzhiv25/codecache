import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignupForm } from '../components/signup-form';
import { authAPI } from '../lib/appwrite';
import { toast } from 'sonner';

const SignupPage: React.FC = () => {
    const { register, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleSignup = async (name: string, email: string, password: string) => {
        try {
            setError('');
            await register(name, email, password);
            navigate('/dashboard');
            toast.success('Account created successfully');
        } catch (error: unknown) {
            console.error('Registration error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred during registration';
            setError(errorMessage);
            toast.error('Registration failed');
            throw error; // Re-throw to let the form handle it
        }
    };

    const handleGitHubLogin = async () => {
        try {
            setError('');
            await authAPI.loginWithGitHub();
            // The user will be redirected to GitHub and then back to the app
            // The AuthContext will handle the authentication when they return
        } catch (error: Error | unknown) {
            console.error('GitHub login error:', error);
            setError(error instanceof Error ? error.message : 'GitHub login failed');
            toast.error('GitHub login failed');
            throw error;
        }
    };

    return (
        <div className="min-h-screen flex md:items-center items-start md:py-0 py-5 justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-sm w-full space-y-8">
                <SignupForm
                    onSubmit={handleSignup}
                    onGitHubLogin={handleGitHubLogin}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default SignupPage;
