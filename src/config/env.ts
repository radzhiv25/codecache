// Environment configuration
export const config = {
    appwrite: {
        endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || '',
        projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
        databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
        snippetsCollectionId: import.meta.env.VITE_APPWRITE_SNIPPETS_COLLECTION_ID || 'snippets',
        usersCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users',
        invitationsCollectionId: import.meta.env.VITE_APPWRITE_INVITATIONS_COLLECTION_ID || 'invitations',
        storageBucketId: import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'snippet_files',
    },
};

// Validate required environment variables
export const validateConfig = () => {
    const required = [
        'VITE_APPWRITE_ENDPOINT',
        'VITE_APPWRITE_PROJECT_ID',
    ];

    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        console.warn('Missing environment variables:', missing);
        console.warn('Please create a .env.local file with the required variables.');
        console.warn('See APPWRITE_SETUP.md for configuration details.');
    }
};
