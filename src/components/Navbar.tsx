import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { sharingAPI, usersAPI } from '../lib/appwrite';
import { FiBell, FiUser } from 'react-icons/fi';
import { type User } from '../types';

const Navbar = () => {
    const { user, logout, isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingInvitations, setPendingInvitations] = useState(0);
    const [userProfile, setUserProfile] = useState<User | null>(null);

    const handleLogout = async () => {
        try {
            await logout();
            setIsMobileMenuOpen(false);
            setUserProfile(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const loadUserProfile = useCallback(async () => {
        if (!user?.email) return;

        try {
            const profile = await usersAPI.getUserByEmail(user.email);
            setUserProfile(profile);
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }, [user?.email]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Load pending invitations count
    useEffect(() => {
        const loadPendingInvitations = async () => {
            if (!user?.email) return;

            try {
                const invitations = await sharingAPI.getUserInvitations(user.email);
                const pending = invitations.filter(
                    inv => inv.status === 'pending' && new Date(inv.expiresAt) > new Date()
                );
                setPendingInvitations(pending.length);
            } catch (error) {
                console.error('Error loading pending invitations:', error);
            }
        };

        if (isAuthenticated && user?.email) {
            loadPendingInvitations();
            loadUserProfile();
        }
    }, [isAuthenticated, user?.email, loadUserProfile]);

    return (
        <>
            <div className="md:max-w-7xl md:mx-auto mx-4 md:p-4 p-2 border border-gray-200 bg-white rounded-md">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0">
                            <span className="leading-tight">
                                <h1 className="bg-gradient-to-br from-gray-300 to-zinc-600 text-transparent bg-clip-text text-xl md:text-2xl font-bold leading-none">CodeCache</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">your every code snippet vault</p>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex gap-6 items-center">
                            <Link
                                to="/"
                                className={`text-sm font-medium transition-colors ${location.pathname === '/'
                                    ? 'text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Public Snippets
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard'
                                            ? 'text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        My Snippets
                                    </Link>
                                    <Link
                                        to="/invitations"
                                        className={`relative text-sm font-medium transition-colors ${location.pathname === '/invitations'
                                            ? 'text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <FiBell className="w-4 h-4" />
                                        {pendingInvitations > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {pendingInvitations}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className={`text-sm font-medium transition-colors ${location.pathname === '/profile'
                                            ? 'text-gray-900'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Profile
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Desktop Auth Buttons */}
                        <div className="hidden md:flex gap-3 items-center">
                            {loading ? (
                                <div className="text-sm text-gray-500">Loading...</div>
                            ) : isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                            {userProfile?.avatar ? (
                                                <img
                                                    src={userProfile.avatar}
                                                    alt={userProfile.name}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <FiUser className="w-4 h-4 text-gray-500" />
                                            )}
                                        </div>
                                        <span>{userProfile?.name || user?.name || 'User'}</span>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                        >
                                            Login
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button
                                            size="sm"
                                        >
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            aria-label="Toggle mobile menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
                            <div className="pt-4 space-y-4">
                                {/* Mobile Navigation Links */}
                                <nav className="space-y-2">
                                    <Link
                                        to="/"
                                        className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/'
                                            ? 'text-gray-900 bg-gray-100'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Public Snippets
                                    </Link>
                                    {isAuthenticated && (
                                        <>
                                            <Link
                                                to="/dashboard"
                                                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/dashboard'
                                                    ? 'text-gray-900 bg-gray-100'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                My Snippets
                                            </Link>
                                            <Link
                                                to="/invitations"
                                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/invitations'
                                                    ? 'text-gray-900 bg-gray-100'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <FiBell className="w-4 h-4 mr-2" />
                                                Invitations
                                                {pendingInvitations > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                        {pendingInvitations}
                                                    </span>
                                                )}
                                            </Link>
                                            <Link
                                                to="/profile"
                                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/profile'
                                                    ? 'text-gray-900 bg-gray-100'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Profile
                                            </Link>
                                        </>
                                    )}
                                </nav>

                                {/* Mobile Auth Section */}
                                <div className="pt-4 border-t border-gray-200">
                                    {loading ? (
                                        <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                                    ) : isAuthenticated ? (
                                        <div className="space-y-3">
                                            <Link
                                                to="/profile"
                                                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                                    {userProfile?.avatar ? (
                                                        <img
                                                            src={userProfile.avatar}
                                                            alt={userProfile.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiUser className="w-4 h-4 text-gray-500" />
                                                    )}
                                                </div>
                                                <span>{userProfile?.name || user?.name || 'User'}</span>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleLogout}
                                                className="w-full"
                                            >
                                                Logout
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Link to="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full justify-start"
                                                >
                                                    Login
                                                </Button>
                                            </Link>
                                            <Link to="/signup" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    Sign Up
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Navbar