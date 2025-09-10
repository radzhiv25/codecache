import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SignupForm } from '../components/signup-form';

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
        } catch (error: any) {
            console.error('Registration error:', error);
            setError(error.message || 'An error occurred during registration');
            throw error; // Re-throw to let the form handle it
        }
    };

    return (
        <div className="min-h-screen flex md:items-center items-start md:py-0 py-5 justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-sm w-full space-y-8">
                <SignupForm
                    onSubmit={handleSignup}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default SignupPage;
