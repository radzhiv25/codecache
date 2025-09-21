import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { snippetsAPI } from '../lib/appwrite';
import {
    FiCode,
    FiSearch,
    FiLock,
    FiHeart,
    FiStar,
    FiArrowRight,
    FiTrendingUp,
    FiClock
} from 'react-icons/fi';
import { DatabaseZap } from 'lucide-react';

const LandingPage: React.FC = () => {
    const [stats, setStats] = useState<{
        totalSnippets: number;
        totalUsers: number;
        publicSnippets: number;
        privateSnippets: number;
        recentSnippets: { title: string; language: string; createdAt: string }[];
        topLanguages: { language: string; count: number }[];
        loading: boolean;
    }>({
        totalSnippets: 0,
        totalUsers: 0,
        publicSnippets: 0,
        privateSnippets: 0,
        recentSnippets: [],
        topLanguages: [],
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch public snippets to get total count
                const publicSnippets = await snippetsAPI.getPublicSnippets(100);

                // Calculate stats
                const totalSnippets = publicSnippets.length;
                const publicCount = publicSnippets.length;
                const privateCount = 0; // We can't easily get private count without auth

                // Get language distribution
                const languageCount: { [key: string]: number } = {};
                publicSnippets.forEach(snippet => {
                    languageCount[snippet.language] = (languageCount[snippet.language] || 0) + 1;
                });

                const topLanguages = Object.entries(languageCount)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([lang, count]) => ({ language: lang, count }));

                // Get recent snippets
                const recentSnippets = publicSnippets
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 3);

                setStats({
                    totalSnippets,
                    totalUsers: 0, // We can't easily get user count without admin access
                    publicSnippets: publicCount,
                    privateSnippets: privateCount,
                    recentSnippets,
                    topLanguages,
                    loading: false
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 h-[90vh] flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
                            <FiStar className="w-4 h-4 mr-2" />
                            The future of code sharing
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 md:leading-tight leading-10">
                            Your code snippet
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> vault</span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto md:leading-relaxed leading-tight">
                            Store, organize, and share your code snippets with the world.
                            Collaborate with developers, discover amazing code, and build better together.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/signup">
                                <Button size="lg" className="px-8 py-4 text-lg">
                                    Get Started
                                    <FiArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                                    Sign In
                                </Button>
                            </Link>
                        </div>

                        <p className="text-sm text-gray-500 mt-6">
                            No card required • Free forever
                        </p>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-0">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything you need to manage code
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Powerful features designed for developers who want to organize, share, and collaborate on code snippets.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Large Feature Card - Code Management */}
                        <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader>
                                <div className="flex md:items-center items-start gap-3 mb-4">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <FiCode className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Smart Code Management</CardTitle>
                                        <CardDescription className="text-lg">Organize your snippets with tags, languages, and descriptions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-white rounded-lg p-4 shadow-sm border">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                        <span className="ml-2 text-sm text-gray-500">React Component</span>
                                    </div>
                                    <pre className="text-sm text-gray-800 font-mono overflow-x-auto">
                                        {`const Button = ({ children, variant }) => {
  return (
    <button className={\`btn \${variant}\`}>
      {children}
    </button>
  );
};`}
                                    </pre>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Badge variant="secondary">React</Badge>
                                        <Badge variant="outline">UI</Badge>
                                        <Badge variant="outline">Component</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Privacy & Security */}
                        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                            <CardHeader>
                                <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
                                    <FiLock className="w-6 h-6 text-orange-600" />
                                </div>
                                <CardTitle className="text-xl">Privacy First</CardTitle>
                                <CardDescription>Control who sees your code with public and private snippets</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Public Snippets</span>
                                        <Badge variant="secondary">Visible to all</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Private Snippets</span>
                                        <Badge variant="outline">Only you</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Shared Snippets</span>
                                        <Badge variant="outline">Invited users</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Search & Discovery */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                            <CardHeader>
                                <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                                    <FiSearch className="w-6 h-6 text-purple-600" />
                                </div>
                                <CardTitle className="text-xl">Smart Search</CardTitle>
                                <CardDescription>Find exactly what you need with powerful search and filters</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="bg-white rounded-lg p-3 border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiSearch className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-500">Search snippets...</span>
                                        </div>
                                        <div className="text-xs text-gray-400">Filter by language, tags, or author</div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <div className="font-medium">Recent searches:</div>
                                        <div className="text-xs text-gray-500 mt-1">• React hooks</div>
                                        <div className="text-xs text-gray-500">• API authentication</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Stats Card */}
                        <Card className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
                            <CardHeader>
                                <div className="flex md:items-center items-start gap-3 mb-4">
                                    <div className="p-3 bg-indigo-100 rounded-lg">
                                        <FiTrendingUp className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Live Community Stats</CardTitle>
                                        <CardDescription className="text-lg">Real data from our growing community</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {stats.loading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-indigo-600">{stats.totalSnippets}</div>
                                            <div className="text-sm text-gray-600">Total Snippets</div>
                                            <div className="text-xs text-gray-500 mt-1">Public snippets</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-indigo-600">{stats.publicSnippets}</div>
                                            <div className="text-sm text-gray-600">Public Snippets</div>
                                            <div className="text-xs text-gray-500 mt-1">Shared with community</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-indigo-600">{stats.topLanguages.length > 0 ? stats.topLanguages[0].language : 'N/A'}</div>
                                            <div className="text-sm text-gray-600">Top Language</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {stats.topLanguages.length > 0 ? `${stats.topLanguages[0].count} snippets` : 'No data'}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-indigo-600">∞</div>
                                            <div className="text-sm text-gray-600">Storage</div>
                                            <div className="text-xs text-gray-500 mt-1">Unlimited snippets</div>
                                        </div>
                                    </div>
                                )}

                                {!stats.loading && stats.recentSnippets.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-indigo-200">
                                        <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                            <FiClock className="w-4 h-4" />
                                            Recent Activity
                                        </div>
                                        <div className="space-y-2">
                                            {stats.recentSnippets.map((snippet, index) => (
                                                <div key={index} className="flex items-center gap-3 text-sm">
                                                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                        {snippet.title.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-600 flex-1 truncate">
                                                        "{snippet.title}" - {snippet.language}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">
                                                        {new Date(snippet.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!stats.loading && stats.topLanguages.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-indigo-200">
                                        <div className="text-sm font-medium text-gray-700 mb-3">Popular Languages</div>
                                        <div className="flex flex-wrap gap-2">
                                            {stats.topLanguages.map((lang, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {lang.language} ({lang.count})
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-0">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How it Works
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get started with CodeCache in three simple steps and transform how you manage your code snippets.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-blue-600">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create & Organize</h3>
                            <p className="text-gray-600">
                                Write your code snippets, add descriptions, and organize them with tags and language categories.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-green-600">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Share & Collaborate</h3>
                            <p className="text-gray-600">
                                Share your snippets publicly or privately with your team. Invite others to collaborate and contribute.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Discover & Learn</h3>
                            <p className="text-gray-600">
                                Explore the community library, discover new techniques, and learn from other developers' code.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            What Developers Say
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join thousands of developers who are already using CodeCache to manage their code snippets.
                        </p>
                    </div>

                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            "CodeCache has completely transformed how I manage my code snippets. The search functionality is incredible and the collaboration features are exactly what our team needed."
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                S
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Sarah Chen</div>
                                                <div className="text-sm text-gray-500">Senior Frontend Developer</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>

                            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            "The privacy controls are perfect for our enterprise needs. We can keep sensitive code private while sharing useful utilities with the team."
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                                                M
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Mike Rodriguez</div>
                                                <div className="text-sm text-gray-500">Tech Lead</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>

                            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            "I love how easy it is to discover new code patterns and techniques. The community aspect makes learning so much more engaging."
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                                A
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Alex Kim</div>
                                                <div className="text-sm text-gray-500">Full Stack Developer</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>

                            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            "The real-time collaboration features are game-changing. Our team can now work together on code snippets seamlessly."
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                                                E
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Emma Wilson</div>
                                                <div className="text-sm text-gray-500">DevOps Engineer</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>

                            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            "CodeCache has become an essential part of my development workflow. The organization and search capabilities are unmatched."
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-medium">
                                                D
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">David Park</div>
                                                <div className="text-sm text-gray-500">Software Architect</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>

                            <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <Card className="h-full">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 mb-4">
                                            "The interface is clean and intuitive. I can find any snippet I need in seconds, and the tagging system is brilliant."
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-medium">
                                                L
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Lisa Zhang</div>
                                                <div className="text-sm text-gray-500">Mobile Developer</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto py-20 bg-blue-600 rounded-md">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to organize your code?
                    </h2>
                    <p className="text-xl text-white mb-10">
                        Join thousands of developers who are already using CodeCache to manage their code snippets.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup">
                            <Button size="lg" className="px-8 py-4 text-lg bg-gray-900 hover:bg-gray-800 text-white">
                                Start Building Today
                                <FiArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link to="/app">
                            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-white hover:bg-white text-blue-600">
                                Browse Public Snippets
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-gray-900">
                <div className="max-w-7xl mx-auto px-4 md:px-0 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <DatabaseZap className="size-10 text-gray-500" />
                            <span className="leading-tight">
                                <h1 className="bg-gradient-to-br from-gray-300 to-zinc-600 text-transparent bg-clip-text text-xl md:text-2xl font-bold leading-none">CodeCache</h1>
                                <p className="text-xs text-gray-500 hidden sm:block">your everyday code snippet vault</p>
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiHeart className="w-4 h-4 text-red-500" />
                            <span className="text-gray-600 text-sm">Made with love for developers</span>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            © 2025 CodeCache. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
