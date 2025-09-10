import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/login-form';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
    const { login, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string>('');

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (email: string, password: string) => {
        try {
            setError('');
            await login(email, password);
            navigate('/dashboard');
            toast.success('Login successful');
        } catch (error: Error | unknown) {
            console.error('Login error:', error);
            setError(error instanceof Error ? error.message : 'Invalid email or password');
            toast.error('Login failed');
            throw error; // Re-throw to let the form handle it
        }
    };

    return (
        <div className="min-h-screen flex md:items-center items-start md:py-0 py-5 justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-sm w-full space-y-8">
                <LoginForm
                    onSubmit={handleLogin}
                    loading={loading}
                    error={error}
                />
            </div>
        </div>
    );
};

export default LoginPage;
